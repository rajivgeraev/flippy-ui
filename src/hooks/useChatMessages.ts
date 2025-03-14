import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/chats';
import { ChatService } from '@/services/chatService';
import { useAuthContext } from '@/contexts/AuthContext';

export function useChatMessages(chatId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const { isAuthenticated } = useAuthContext();

    const fetchMessages = useCallback(async (loadMore = false) => {
        if (!isAuthenticated || !chatId) {
            console.log('Fetch skipped: not authenticated or no chatId');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const before = loadMore && oldestMessageId ? oldestMessageId : undefined;
            const response = await ChatService.getChatMessages(chatId, before);

            console.log('API response:', response);

            const responseMessages = response.messages || [];
            if (loadMore) {
                setMessages(prev => [...prev, ...responseMessages]);
            } else {
                setMessages(responseMessages);
            }

            if (responseMessages.length > 0) {
                setOldestMessageId(responseMessages[responseMessages.length - 1].id);
            }

            setHasMore(response.has_more || false);
            setInitialized(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки сообщений';
            setError(errorMessage);
            console.error('Fetch error:', err);
            setInitialized(true);
        } finally {
            setLoading(false);
        }
    }, [chatId, isAuthenticated]); // Убрали oldestMessageId из зависимостей

    useEffect(() => {
        if (chatId) {
            setMessages([]);
            setOldestMessageId(null);
            setHasMore(false);
            setInitialized(false);
            fetchMessages();
        }
    }, [chatId, fetchMessages]);

    useEffect(() => {
        if (!chatId || !initialized) return;

        const interval = setInterval(() => {
            console.log('Periodic fetch triggered');
            fetchMessages();
        }, 10000);

        return () => clearInterval(interval);
    }, [chatId, initialized, fetchMessages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!isAuthenticated || !chatId || !text.trim()) return;

        try {
            const response = await ChatService.sendMessage(chatId, { text });
            if (response.message) {
                setMessages(prev => [response.message, ...prev]);
            }
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка отправки сообщения';
            setError(errorMessage);
            throw err;
        }
    }, [chatId, isAuthenticated]);

    const loadMoreMessages = useCallback(() => {
        if (!loading && hasMore) {
            fetchMessages(true);
        }
    }, [loading, hasMore, fetchMessages]);

    return {
        messages,
        loading,
        error,
        hasMore,
        sendMessage,
        loadMoreMessages,
        refreshMessages: () => fetchMessages(),
        initialized
    };
}