import React, { forwardRef } from 'react';
import { Select } from '@chakra-ui/react';
import type { SelectProps } from '@chakra-ui/react';

/**
 * StyledSelect — shared select component with the same dark-light theme we use across inputs.
 */
const StyledSelect = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => (
  <Select
    ref={ref}
    bg="transparent"
    border="1px solid"
    borderColor="gray.600"
    _focus={{ borderColor: 'blue.400' }}
    _hover={{ borderColor: 'gray.500' }}
    iconColor="gray.400"
    _placeholder={{ color: 'gray.500' }}
    {...props}
  />
));

StyledSelect.displayName = 'StyledSelect';

export default StyledSelect; 