import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const CHAT_STORAGE_KEY = 'chatbot_messages';

export const useChatbotPersistence = () => {
  const [persistedMessages, setPersistedMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages from secure storage on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await SecureStore.getItemAsync(CHAT_STORAGE_KEY);
        if (stored) {
          const parsedMessages = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setPersistedMessages(messagesWithDates);
        }
      } catch (error) {
        console.log('Error loading chat messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Save messages to secure storage
  const saveMessages = useCallback(async (messages) => {
    try {
      // Store only serializable data (convert Dates to strings)
      const serializableMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      await SecureStore.setItemAsync(CHAT_STORAGE_KEY, JSON.stringify(serializableMessages));
      setPersistedMessages(messages);
    } catch (error) {
      console.log('Error saving chat messages:', error);
    }
  }, []);

  // Clear all chat history
  const clearMessages = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(CHAT_STORAGE_KEY);
      setPersistedMessages([]);
    } catch (error) {
      console.log('Error clearing chat messages:', error);
    }
  }, []);

  return {
    persistedMessages,
    isLoading,
    saveMessages,
    clearMessages
  };
};

