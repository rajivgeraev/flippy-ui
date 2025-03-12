import { Listing } from './listings';

export interface Trade {
    id: string;
    sender_id: string;
    receiver_id: string;
    sender_listing_id: string;
    receiver_listing_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'canceled';
    message: string;
    created_at: string;
    updated_at: string;

    // Дополнительные поля
    sender_listing?: Listing;
    receiver_listing?: Listing;
    sender?: User;
    receiver?: User;
}

export interface User {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
}

export interface CreateTradeRequest {
    sender_listing_id: string;
    receiver_listing_id: string;
    message?: string;
}

export interface UpdateTradeStatusRequest {
    status: 'accepted' | 'rejected' | 'canceled';
}

// Для отображения в UI
export const TradeStatusLabels: Record<string, string> = {
    pending: 'Ожидание',
    accepted: 'Принято',
    rejected: 'Отклонено',
    canceled: 'Отменено'
};

export const TradeStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800'
};