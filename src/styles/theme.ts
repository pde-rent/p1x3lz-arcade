import { extendTheme } from '@chakra-ui/react';
import type { ThemeConfig } from '@chakra-ui/react';

/**
 * Centralized color palette based on specs/visual-identity.md
 * Use these tokens everywhere instead of hard-coding hex values.
 */
const colors = {
  /** Base application background */
  bg: 'gray.900',         // Nice dark gray – primary background
  /** Grid lines */
  grid: '#333333',        // Medium gray used for grid outlines
  /** Brand / accent colors */
  accent: {
    primary: '#4299e1',   // Bright blue – main interactive color
    secondary: '#9f7aea', // Purple – secondary accent
  },
  /** Semantic colors (success / warning / error) */
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
};

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  styles: {
    global: {
      html: {
        bg: 'bg',
      },
    },
  },
  components: {
    /**
     * Shared input-like components adopt the same dark transparent background,
     * subtle gray border, and blue focus ring. Placeholder text is now visible
     * (gray.500) to avoid "invisible" fields on dark mode.
     */
    Input: {
      baseStyle: {
        field: {
          bg: 'transparent',
          border: '1px solid',
          borderColor: 'gray.600',
          _hover: { borderColor: 'gray.500' },
          _focus: { borderColor: 'accent.primary' },
          _placeholder: { color: 'gray.500' },
          color: 'white',
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          bg: 'transparent',
          border: '1px solid',
          borderColor: 'gray.600',
          _hover: { borderColor: 'gray.500' },
          _focus: { borderColor: 'accent.primary' },
          _placeholder: { color: 'gray.500' },
          color: 'white',
        },
        icon: {
          color: 'gray.400',
        },
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          bg: 'transparent',
          border: '1px solid',
          borderColor: 'gray.600',
          _hover: { borderColor: 'gray.500' },
          _focus: { borderColor: 'accent.primary' },
          _placeholder: { color: 'gray.500' },
          color: 'white',
        },
        stepper: {
          color: 'gray.400',
          _hover: { color: 'blue.300' },
          _active: { color: 'blue.400' },
          borderColor: 'gray.600',
        },
      },
    },
    /**
     * Slider gets a thicker track and a darker default background so it blends
     * better with the dark UI while remaining visible.
     */
    Slider: {
      baseStyle: {
        track: {
          bg: 'gray.600',
        },
        filledTrack: {
          bg: 'accent.primary',
        },
      },
    },
    Switch: {
      baseStyle: {
        track: {
          bg: 'gray.600',
          _checked: {
            bg: 'accent.primary',
          },
        },
      },
    },
  },
});

export default theme; 