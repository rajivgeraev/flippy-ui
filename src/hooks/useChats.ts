import { useState, useEffect, useCallback } from 'react';
import { Chat } from '@/types/chats';
import { ChatService } from '@/services/chatService';
import { useAuthContext } from '@/contexts/AuthContext';

export function useChats() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuthContext();

    // Загрузка списка чатов
    const fetchChats = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await ChatService.getChats();

            if (response.chats) {
                setChats(response.chats);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чатов';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Загрузка чатов при монтировании
    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // Создание нового чата
    const createChat = useCallback(async (receiverId: string, message?: string, tradeId?: string) => {
        if (!isAuthenticated) {
            throw new Error('Для создания чата необходимо авторизоваться');
        }

        try {
            const data = {
                receiver_id: receiverId,
                message,
                ...(tradeId && { trade_id: tradeId })
            };

            const response = await ChatService.createChat(data);

            // Обновляем список чатов после создания нового чата
            await fetchChats();

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при создании чата';
            setError(errorMessage);
            throw err;
        }
    }, [isAuthenticated, fetchChats]);

    // Периодическое обновление списка чатов
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            fetchChats();
        }, 30000); // Обновляем каждые 30 секунд

        return () => clearInterval(interval);
    }, [isAuthenticated, fetchChats]);

    return {
        chats,
        loading,
        error,
        createChat,
        refreshChats: fetchChats
    };
}