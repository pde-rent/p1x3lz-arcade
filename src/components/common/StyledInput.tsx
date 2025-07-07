import React, { forwardRef } from 'react';
import { Input } from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';

/**
 * StyledInput — shared input component to keep styling consistent across the app.
 * - Transparent background
 * - Subtle gray border
 * - Blue focus ring
 * - Gentle hover effect
 */
const StyledInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input
    ref={ref}
    bg="transparent"
    border="1px solid"
    borderColor="gray.600"
    _focus={{ borderColor: 'accent.primary' }}
    _hover={{ borderColor: 'gray.500' }}
    _placeholder={{ color: 'gray.500' }}
    {...props}
  />
));

StyledInput.displayName = 'StyledInput';

export default StyledInput; 