import React from 'react';
import {
  HStack,
  Text
} from '@chakra-ui/react';
import { GameType } from '../../types/core-types';
import StyledInput from '../common/StyledInput';
import StyledSelect from '../common/StyledSelect';
import StyledButton from '../common/StyledButton';

interface SearchAndCreateProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedGameType: string;
  onGameTypeChange: (type: string) => void;
  onCreateGame: () => void;
}

export const SearchAndCreate: React.FC<SearchAndCreateProps> = ({
  searchTerm,
  onSearchTermChange,
  selectedGameType,
  onGameTypeChange,
  onCreateGame
}) => {
  return (
    <HStack gap={3}>
      <StyledInput
        placeholder="Search games..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        flex={1}
      />
      <StyledSelect
        value={selectedGameType}
        onChange={(e) => onGameTypeChange(e.target.value)}
        w="140px"
      >
        <option value="ALL">All Games</option>
        <option value={GameType.CONQUER}>Conquer</option>
        <option value="bomber" disabled title="Coming soon!">Bomber (soon)</option>
        <option value={GameType.CHESS} disabled title="Coming soon!">Chess (soon)</option>
        <option value={GameType.SNAKE} disabled title="Coming soon!">Snake (soon)</option>
      </StyledSelect>
      <StyledButton
        onClick={onCreateGame}
        leftIcon={<Text>+</Text>}
      >
        Create
      </StyledButton>
    </HStack>
  );
};

export default SearchAndCreate; 