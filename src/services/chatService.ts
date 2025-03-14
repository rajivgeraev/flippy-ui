import { AuthService } from './auth';
import {
    Chat,
    Message,
    CreateChatRequest,
    SendMessageRequest,
    ChatResponse,
    MessagesResponse,
    SendMessageResponse,
    CreateChatResponse
} from '@/types/chats';

export class ChatService {
    // Получение списка чатов пользователя
    static async getChats(): Promise<ChatResponse> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chats`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении списка чатов');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении чатов:', error);
            throw error;
        }
    }

    // Создание нового чата
    static async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании чата');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании чата:', error);
            throw error;
        }
    }

    // Получение сообщений чата
    static async getChatMessages(chatId: string, before?: string): Promise<MessagesResponse> {
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chatId}/messages`;

            // Добавляем параметр "before" для пагинации, если он указан
            if (before) {
                url += `?before=${before}`;
            }

            const response = await AuthService.fetchWithAuth(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении сообщений');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении сообщений:', error);
            throw error;
        }
    }

    // Отправка сообщения
    static async sendMessage(chatId: string, data: SendMessageRequest): Promise<SendMessageResponse> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при отправке сообщения');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            throw error;
        }
    }

}