import React, { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  Container
} from '@chakra-ui/react';
import { useAppState } from '../hooks/useAppState';
import { createPlayer } from '../types/core-types';
import { useNavigate } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentPlayer } = useAppState();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmedName = playerName.trim();
    setError('');
    
    if (!trimmedName) {
      setError('Please enter your player name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Player name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Player name must be 20 characters or less');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create local player for MVP
      const player = createPlayer(trimmedName, true, false);
      setCurrentPlayer(player);
      
      // Navigate to main lobby
      navigate('/lobby');
    } catch {
      setError('Failed to create player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxW="md">
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="100%"
      >
        <Box w="100%" maxW="400px">
          <Box textAlign="center" mb={8}>
            <Heading fontFamily="Tiny5" fontSize="8xl" color="accent.primary" mb={4} letterSpacing="2px">
              P1x3lz
            </Heading>
            <Text fontSize="lg" color="gray.300" mb={2}>
              On-chain PVP Arcade Games
            </Text>
            <Text fontSize="md" color="gray.500">
              Your dad's wildest dreams
            </Text>
          </Box>

          <Box mb={6}>
            <Input
              placeholder="Enter your player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              size="lg"
              bg="gray.800"
              border="1px solid"
              borderColor="gray.600"
              _hover={{ borderColor: 'gray.500' }}
              _focus={{ borderColor: 'accent.primary', boxShadow: '0 0 0 1px var(--chakra-colors-accent-primary)' }}
              mb={4}
            />
            
            {error && (
              <Text color="red.400" fontSize="sm" mb={4}>
                {error}
              </Text>
            )}
            
            <Button
              className="play"
              onClick={handleLogin}
              isLoading={isLoading}
              size="lg"
              colorScheme="blue"
              w="100%"
              disabled={!playerName.trim()}
            >
              {isLoading ? 'Loading...' : 'Play!'}
            </Button>
          </Box>

          <Box textAlign="center">
            <Text fontSize="sm" color="gray.500" mb={1}>
              MVP Version - Local Play Only
            </Text>
            <Text fontSize="xs" color="gray.600">
              All games run locally in your browser
            </Text>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginScreen; 