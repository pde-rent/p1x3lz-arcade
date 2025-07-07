import React, { forwardRef } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

/**
 * StyledBox — shared box component for consistent panel styling across the app.
 * - Transparent background
 * - Subtle gray border with hover effect
 * - Standard padding and border radius
 */
const StyledBox = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box
    ref={ref}
    bg="transparent"
    border="1px solid"
    borderColor="gray.600"
    borderRadius="md"
    p={4}
    _hover={{ borderColor: 'gray.500' }}
    {...props}
  />
));

StyledBox.displayName = 'StyledBox';

export default StyledBox; 