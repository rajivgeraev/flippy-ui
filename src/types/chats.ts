import { Trade } from './trades';

export interface Chat {
    id: string;
    trade_id?: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    updated_at: string;
    last_message_text?: string;
    last_message_time?: string;
    is_active: boolean;

    // Дополнительные поля для API
    sender?: User;
    receiver?: User;
    trade?: Trade;
    unread_count: number;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    text: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;

    // Дополнительные поля для API
    sender?: User;
}

export interface User {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
}

export interface CreateChatRequest {
    receiver_id: string;
    trade_id?: string;
    message?: string;
}

export interface SendMessageRequest {
    text: string;
}

export interface ChatResponse {
    chats: Chat[];
    count: number;
}

export interface MessagesResponse {
    messages: Message[];
    has_more: boolean;
}

export interface SendMessageResponse {
    message: Message;
    success: boolean;
}

export interface CreateChatResponse {
    chat_id: string;
    is_new: boolean;
    success: boolean;
}