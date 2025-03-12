import { AuthService } from './auth';
import { Trade, CreateTradeRequest, UpdateTradeStatusRequest } from '@/types/trades';

export class TradeService {
    // Создание предложения обмена
    static async createTrade(data: CreateTradeRequest): Promise<{ success: boolean, trade_id: string, message: string }> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании предложения обмена');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании предложения обмена:', error);
            throw error;
        }
    }

    // Получение списка предложений обмена
    static async getMyTrades(type: 'all' | 'incoming' | 'outgoing' = 'all', status: 'all' | 'pending' | 'accepted' | 'rejected' | 'canceled' = 'all'): Promise<{ trades: Trade[], count: number }> {
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/trades`);
            url.searchParams.append('type', type);
            url.searchParams.append('status', status);

            const response = await AuthService.fetchWithAuth(url.toString());

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении предложений обмена');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении предложений обмена:', error);
            throw error;
        }
    }

    // Обновление статуса предложения обмена
    static async updateTradeStatus(tradeId: string, data: UpdateTradeStatusRequest): Promise<{ success: boolean, message: string, status: string }> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trades/${tradeId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при обновлении статуса предложения обмена');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении статуса предложения обмена:', error);
            throw error;
        }
    }
}