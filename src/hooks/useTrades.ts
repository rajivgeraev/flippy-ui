import { useState, useEffect, useCallback } from 'react';
import { TradeService } from '@/services/tradeService';
import { Trade } from '@/types/trades';
import { useAuthContext } from '@/contexts/AuthContext';

type TradeType = 'all' | 'incoming' | 'outgoing';
type TradeStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'canceled';

export function useTrades(initialType: TradeType = 'all', initialStatus: TradeStatus = 'all') {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<TradeType>(initialType);
    const [status, setStatus] = useState<TradeStatus>(initialStatus);
    const [count, setCount] = useState(0);
    const { isAuthenticated } = useAuthContext();

    // Функция для получения списка обменов
    const fetchTrades = useCallback(async () => {
        if (!isAuthenticated) {
            setTrades([]);
            setCount(0);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await TradeService.getMyTrades(type, status);

            setTrades(response.trades);
            setCount(response.count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке предложений обмена';
            setError(errorMessage);
            console.error('Error fetching trades:', err);
        } finally {
            setLoading(false);
        }
    }, [type, status, isAuthenticated]);

    // Загрузка данных при монтировании и при изменении параметров
    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    // Функция для обновления статуса предложения обмена
    const updateTradeStatus = useCallback(async (tradeId: string, newStatus: 'accepted' | 'rejected' | 'canceled') => {
        try {
            setLoading(true);

            const response = await TradeService.updateTradeStatus(tradeId, { status: newStatus });

            // Обновляем состояние только для измененного предложения
            setTrades(prevTrades =>
                prevTrades.map(trade =>
                    trade.id === tradeId
                        ? { ...trade, status: newStatus }
                        : trade
                )
            );

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обновлении статуса';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Функция для фильтрации по типу
    const filterByType = useCallback((newType: TradeType) => {
        setType(newType);
    }, []);

    // Функция для фильтрации по статусу
    const filterByStatus = useCallback((newStatus: TradeStatus) => {
        setStatus(newStatus);
    }, []);

    // Функция для обновления списка
    const refreshTrades = useCallback(() => {
        fetchTrades();
    }, [fetchTrades]);

    return {
        trades,
        loading,
        error,
        count,
        type,
        status,
        filterByType,
        filterByStatus,
        updateTradeStatus,
        refreshTrades
    };
}