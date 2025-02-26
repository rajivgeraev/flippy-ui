"use client";

import { useState, useEffect } from 'react';
import { initData } from '@telegram-apps/sdk-react';
import { useSignal } from '@telegram-apps/sdk-react';
import { AuthService } from '@/services/auth';

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userDetails, setUserDetails] = useState(AuthService.getUser());

    const initDataState = useSignal(initData.state);

    const login = async () => {
        if (!initDataState) {
            setError('Ошибка получения данных из Telegram Mini App');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Безопасно получаем raw data, проверяя, что она не undefined
            const rawData = initData.raw();
            if (!rawData) {
                throw new Error('Отсутствуют данные инициализации Telegram');
            }

            const data = await AuthService.authenticateWithTelegram(rawData);
            setUserDetails(data.user);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Ошибка аутентификации:', err);
            setError(err instanceof Error ? err.message : 'Ошибка аутентификации');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        AuthService.clearToken();
        setIsAuthenticated(false);
        setUserDetails(null);
    };

    // Проверяем аутентификацию при загрузке страницы
    useEffect(() => {
        setIsAuthenticated(AuthService.isAuthenticated());
        setUserDetails(AuthService.getUser());
    }, []);

    // Автоматическая аутентификация при загрузке страницы, если есть initData
    useEffect(() => {
        if (initDataState && !isAuthenticated && !isLoading) {
            login();
        }
    }, [initDataState, isAuthenticated]);

    return {
        isAuthenticated,
        isLoading,
        error,
        userDetails,
        login,
        logout
    };
}