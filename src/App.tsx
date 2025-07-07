import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import LoginScreen from './components/LoginScreen';
import Lobby from './components/lobby/Lobby';
import InGameScreen from './components/game/InGameScreen';

const App: React.FC = () => {
  return (
    <Box minH="100vh" bg="bg" color="white">
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/lobby" element={<Lobby mode="main" />} />
        <Route path="/lobby/:gameId" element={<Lobby mode="game" />} />
        <Route path="/game/:gameId" element={<InGameScreen />} />
      </Routes>
    </Box>
  );
};

export default App; 