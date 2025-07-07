import React from 'react';
import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

/**
 * StyledButton — outline button with unified hover styling.
 * Pass any Chakra Button props. Color scheme defaults to blue.
 */
const StyledButton: React.FC<ButtonProps> = ({ colorScheme = 'blue', variant = 'outline', sx, ...rest }) => {
  const hoverColor = `${colorScheme}.300`;
  return (
    <Button
      colorScheme={colorScheme}
      variant={variant}
      sx={{
        _hover: {
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: hoverColor,
          color: hoverColor,
        },
        ...sx,
      }}
      {...rest}
    />
  );
};

export default StyledButton; 