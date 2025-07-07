import React, { useRef, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text
} from '@chakra-ui/react';
import type { ChatMessage } from '../../types/core-types';
import StyledInput from '../common/StyledInput';
import StyledButton from '../common/StyledButton';
import StyledBox from '../common/StyledBox';

interface ChatComponentProps {
  title: string;
  messages: ChatMessage[];
  chatMessage: string;
  onChatMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({
  title,
  messages,
  chatMessage,
  onChatMessageChange,
  onSendMessage,
  onKeyPress
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <VStack align="stretch" gap={2} mt={4}>
      <Text fontSize="xl" fontWeight="medium">
        {title}
      </Text>
      
      {/* Chat Messages */}
      <StyledBox
        ref={chatContainerRef}
        h="200px"
        overflowY="auto"
        p={3}
      >
        {messages.length === 0 ? (
          <Text color="gray.500" fontSize="sm">No messages yet...</Text>
        ) : (
          messages.map((msg) => (
            <Box key={msg.id} mb={2}>
              {msg.isSystemMessage ? (
                <Text fontSize="sm" color="yellow.300" fontStyle="italic">
                  {msg.content}
                </Text>
              ) : (
                <Text fontSize="sm">
                  <Text as="span" color="blue.300" fontWeight="medium">
                    {msg.playerName}:
                  </Text>{' '}
                  <Text as="span" color="gray.100">
                    {msg.content}
                  </Text>
                </Text>
              )}
            </Box>
          ))
        )}
      </StyledBox>



      {/* Chat Input */}
      <HStack gap={2}>
        <StyledInput
          placeholder="Type message"
          value={chatMessage}
          onChange={(e) => onChatMessageChange(e.target.value)}
          onKeyPress={onKeyPress}
          flex={1}
        />
        <StyledButton
          onClick={onSendMessage}
          leftIcon={<Text>→</Text>}
        >
          Send
        </StyledButton>
      </HStack>
    </VStack>
  );
};

export default ChatComponent; 