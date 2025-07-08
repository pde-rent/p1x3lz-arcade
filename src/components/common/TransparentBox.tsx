import React from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

interface TransparentBoxProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * Reusable transparent box with blur backdrop for consistent modal/panel styling
 * Note: Default padding is kept minimal since modals explicitly set their own padding
 */
export const TransparentBox: React.FC<TransparentBoxProps> = ({ 
  children, 
  ...props 
}) => {
  return (
    <Box
      bg="rgba(23, 25, 35, 0.6)"
      backdropFilter="blur(12px)"
      borderRadius="xl"
      boxShadow="0 10px 40px rgba(0, 0, 0, 0.3)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      maxH="90vh"
      overflowY="auto"
      {...props}
    >
      {children}
    </Box>
  );
};

export default TransparentBox; 