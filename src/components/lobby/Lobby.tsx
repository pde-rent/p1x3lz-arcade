import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Heading, HStack, VStack, Button, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import {
  GameType,
  GameStatus,
  type Game,
  type GameOptions,
  type ConquerOptions,
  createPlayer,
} from '../../types/core-types';
import { GameManager } from '../../utils/GameManager';
import { colorManager } from '../../utils/ColorManager';

// Modular UI pieces
import SearchAndCreate from './SearchAndCreate';
import GameList from './GameList';
import PlayerList from './PlayerList';
import ChatComponent from './ChatComponent';
import GameControls from './GameControls';
import GameSelectionModal from './GameSelectionModal';
import GameOptionsModal from './GameOptionsModal';

interface LobbyProps {
  mode: 'main' | 'game';
}

const Lobby: React.FC<LobbyProps> = ({ mode }) => {
  /* ------------------------------------------------------------------ */
  /*                             State                                  */
  /* ------------------------------------------------------------------ */
  const {
    appState,
    addGame,
    setCurrentGame,
    updateLobbyState,
    updateGame,
    removeGame,
  } = useAppState();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const toast = useToast();

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<string>('ALL');
  const [chatMessage, setChatMessage] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  /* ------------------------------------------------------------------ */
  /*                           Audio refs                               */
  /* ------------------------------------------------------------------ */
  const countdownAudio = useRef<HTMLAudioElement>(new Audio('/sounds/countdown.mp3'));
  const boostAudio = useRef<HTMLAudioElement>(new Audio('/sounds/boost.mp3'));

  /* ------------------------------------------------------------------ */
  /*                    Business-logic helpers                           */
  /* ------------------------------------------------------------------ */
  const gm = useMemo(
    () =>
      new GameManager(appState, {
        addGame,
        setCurrentGame,
        updateGame,
        removeGame,
        updateLobbyState,
      }),
    [appState, addGame, setCurrentGame, updateGame, removeGame, updateLobbyState]
  );

  const currentGame =
    mode === 'game' && gameId ? appState.lobbyState.games.get(gameId) : null;
  const currentPlayer = appState.currentPlayer;
  
  // Redirect to login if no current player in game mode
  if (mode === 'game' && !currentPlayer) {
    console.warn('No current player found, redirecting to login');
    navigate('/');
    return null;
  }

  const isHost =
    !!currentGame &&
    !!currentPlayer &&
    currentGame.createdBy === currentPlayer.id;

  /* ------------------------------------------------------------------ */
  /*                         Game filtering                              */
  /* ------------------------------------------------------------------ */
  const gamesList = Array.from(appState.lobbyState.games.values());
  const filteredGames = gamesList.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedGameType === 'ALL' || game.type === selectedGameType;
    return matchesSearch && matchesType;
  });

  const chatMessages = appState.lobbyState.globalChat.messages;

  /* ------------------------------------------------------------------ */
  /*                       Player Management                             */
  /* ------------------------------------------------------------------ */
  const handlePlayerColorChange = (playerId: string, newColorHex: string) => {
    if (!currentGame) return;
    
    const player = currentGame.players.find(p => p.id === playerId);
    if (!player) return;

    const newPlayerColor = colorManager.hexToPlayerColor(newColorHex);
    const updatedPlayer = { ...player, color: newPlayerColor };

    const updatedPlayers = currentGame.players.map(p =>
      p.id === playerId ? updatedPlayer : p
    );
    const updatedGame = { ...currentGame, players: updatedPlayers };
    
    setCurrentGame(updatedGame);
    updateGame(updatedGame);
  };

  const handlePlayerNameChange = (playerId: string, newName: string) => {
    if (!currentGame) return;

    const updatedPlayers = currentGame.players.map(p =>
      p.id === playerId ? { ...p, name: newName } : p
    );

    const updatedGame = { ...currentGame, players: updatedPlayers };
    setCurrentGame(updatedGame);
    updateGame(updatedGame);

    toast({
      title: 'Player Renamed',
      description: `Player is now known as ${newName}.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddLocalPlayer = async () => {
    if (!currentGame || !isHost || currentGame.players.length >= currentGame.options.maxPlayers) {
      toast({
        title: 'Cannot add player',
        description: 'The lobby is full or you are not the host.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const nextNumber = currentGame.players.length + 1;
    const newPlayerName = `Player ${nextNumber}`;
    const newPlayer = createPlayer(newPlayerName, true, false);
    
    newPlayer.isReady = true;
    newPlayer.color = colorManager.assignPlayerColor(newPlayer.id, currentGame.id);
    
    const updatedGame = {
      ...currentGame,
      players: [...currentGame.players, newPlayer],
    };

    setCurrentGame(updatedGame);
    updateGame(updatedGame);

    toast({
      title: 'Local player added',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddAIPlayer = () => {
    toast({ title: 'AI players are not yet available.', status: 'info', duration: 2000, isClosable: true });
  };

  const handleKickPlayer = (playerId: string) => {
    if (!currentGame) return;
    
    const updatedPlayers = currentGame.players.filter(p => p.id !== playerId);
    const updatedGame = { ...currentGame, players: updatedPlayers };
    setCurrentGame(updatedGame);
    updateGame(updatedGame);
    toast({ title: 'Player kicked.', status: 'warning', duration: 2000, isClosable: true });
  };

  const handleMutePlayer = (playerId: string) => {
    if (!currentGame) return;
    
    const updatedPlayers = currentGame.players.map(p =>
      p.id === playerId ? { ...p, isMuted: !p.isMuted } : p
    );
    const updatedGame = { ...currentGame, players: updatedPlayers };
    setCurrentGame(updatedGame);
    updateGame(updatedGame);
    const player = currentGame.players.find(p => p.id === playerId);
    if (player) {
      toast({ title: player.isMuted ? `Unmuted ${player.name}` : `Muted ${player.name}`, status: 'info', duration: 2000, isClosable: true });
    }
  };

  /* ------------------------------------------------------------------ */
  /*                       Countdown effect                              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (countdown === null) {
      countdownAudio.current.pause();
      countdownAudio.current.currentTime = 0;
      return;
    }
    
    if (countdown > 0) {
      if (countdown === 8) {
        countdownAudio.current.currentTime = 0;
        void countdownAudio.current.play();
      }
      const timer = setTimeout(() => setCountdown(countdown - 1), 900);
      return () => clearTimeout(timer);
    } else {
      boostAudio.current.play();
      setCountdown(null);
      if (currentGame) {
        const started = gm.startGame(currentGame);
        if (started) navigate(`/game/${started.id}`);
      }
    }
  }, [countdown, currentGame, navigate, gm]);

  /* ------------------------------------------------------------------ */
  /*                     Game mutations & actions                       */
  /* ------------------------------------------------------------------ */
  const handleCreateGame = () => {
    const newGame = gm.createGame();
    if (newGame) navigate(`/lobby/${newGame.id}`);
  };

  const handleJoinGame = (game: Game) => {
    gm.joinGame(game);
    navigate(`/lobby/${game.id}`);
  };

  const handleLeaveGame = () => {
    if (!currentGame) return;
    gm.leaveGame(currentGame);
    navigate('/lobby');
  };

  const handleStartGame = () => {
    if (!currentGame) return;
    if (countdown !== null) {
      setCountdown(null);
      return;
    }
    if (!isHost) {
      setIsPlayerReady(!isPlayerReady);
      return;
    }
    if (currentGame.players.length >= 2) setCountdown(8);
  };

  const handleSendMessage = () => {
    gm.sendChatMessage(chatMessage);
    setChatMessage('');
  };

  /* ------------------------------------------------------------------ */
  /*                               Modals                               */
  /* ------------------------------------------------------------------ */
  const {
    isOpen: isOptionsOpen,
    onOpen: onOptionsOpen,
    onClose: onOptionsClose,
  } = useDisclosure();
  const {
    isOpen: isGameSelectOpen,
    onOpen: onGameSelectOpen,
    onClose: onGameSelectClose,
  } = useDisclosure();

  const handleSaveOptions = (options: GameOptions) => {
    if (!currentGame) return;
    const ok = gm.updateGameOptions(currentGame, options);
    if (ok) onOptionsClose();
  };

  const handleSaveGameType = (gameType: GameType) => {
    if (!currentGame || !isHost) return;
    const updated = { ...currentGame, type: gameType };
    updateGame(updated);
    gm.sendChatMessage(`**Game type changed to ${gameType}!**`);
  };

  /* ------------------------------------------------------------------ */
  /*                             Guards                                 */
  /* ------------------------------------------------------------------ */
  if (mode === 'game' && !currentGame) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.400">Game not found</Text>
        <Button mt={4} variant="outline" colorScheme="blue" onClick={() => navigate('/lobby')}>
          Back
        </Button>
      </Box>
    );
  }

  /* ------------------------------------------------------------------ */
  /*                              UI                                    */
  /* ------------------------------------------------------------------ */
  return (
    <Box
      p={4}
      maxW="1200px"
      mx="auto"
      display="flex"
      flexDirection="column"
      minH="100vh"
    >
      {/* Header */}
      <HStack justify="space-between" mb={6} flexShrink={0}>
        <Heading fontFamily="Tiny5" fontSize="3xl" color="blue.300">
          {mode === 'main' ? 'P1x3lz Lobby' : currentGame?.name || 'Game Lobby'}
        </Heading>
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={mode === 'main' ? () => navigate('/') : () => navigate('/lobby')}
        >
          {mode === 'main' ? 'Logout' : 'Back'}
        </Button>
      </HStack>

      {/* Main layout */}
      <HStack alignItems="flex-start" gap={6} flex="1" overflow="hidden">
        {/* Left column */}
        <Box flex={3} display="flex" flexDirection="column" h="full" minH={0}>
          {mode === 'main' ? (
            <>
              <Box mb={4}>
                <SearchAndCreate
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  selectedGameType={selectedGameType}
                  onGameTypeChange={setSelectedGameType}
                  onCreateGame={handleCreateGame}
                />
              </Box>
              {/* Scrollable rooms list */}
              <Box flex="1" overflowY="auto" minH={0} mb={4}>
                <GameList games={filteredGames} onJoinGame={handleJoinGame} />
              </Box>
            </>
          ) : (
            currentGame && currentPlayer && (
              <Box flex="1" overflowY="auto" minH={0} mb={4}>
                <PlayerList
                  game={currentGame}
                  currentPlayerId={currentPlayer.id}
                  isHost={isHost}
                  onAddLocalPlayer={handleAddLocalPlayer}
                  onAddAIPlayer={handleAddAIPlayer}
                  onPlayerColorChange={handlePlayerColorChange}
                  onPlayerNameChange={handlePlayerNameChange}
                  onKickPlayer={handleKickPlayer}
                  onMutePlayer={handleMutePlayer}
                />
              </Box>
            )
          )}

          {/* Shared chat */}
          <Box flexShrink={0}>
            <ChatComponent
              title={mode === 'main' ? 'Global Chat' : 'Game Chat'}
              messages={chatMessages}
              chatMessage={chatMessage}
              onChatMessageChange={setChatMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
          </Box>
        </Box>

        {/* Right column */}
        {mode === 'game' && currentGame && (
          <Box
            w="200px"
            display="flex"
            flexDirection="column"
            h="full"
            flexShrink={0}
          >
            <GameControls
              game={currentGame}
              isHost={isHost}
              countdown={countdown}
              onGameTypeClick={onGameSelectOpen}
              onOptionsClick={onOptionsOpen}
              onStartClick={handleStartGame}
              onLeaveClick={handleLeaveGame}
            />
          </Box>
        )}
      </HStack>

      {/* Modals */}
      {currentGame && (
        <>
          <GameOptionsModal
            isOpen={isOptionsOpen}
            onClose={onOptionsClose}
            gameType={currentGame.type}
            initialOptions={currentGame.options as GameOptions & ConquerOptions}
            onSave={handleSaveOptions}
          />
          <GameSelectionModal
            isOpen={isGameSelectOpen}
            onClose={onGameSelectClose}
            currentGameType={currentGame.type}
            onGameTypeChange={handleSaveGameType}
            onSave={onGameSelectClose}
            isHost={isHost}
          />
        </>
      )}
    </Box>
  );
};

export default Lobby; 