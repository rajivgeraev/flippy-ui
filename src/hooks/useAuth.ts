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

    // Автоматическая аутентификация
    const authenticateUser = async () => {
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

            // Устанавливаем таймер для повторной попытки
            setTimeout(() => {
                authenticateUser();
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    // Проверяем аутентификацию при загрузке страницы
    useEffect(() => {
        const isAlreadyAuthenticated = AuthService.isAuthenticated();
        setIsAuthenticated(isAlreadyAuthenticated);
        setUserDetails(AuthService.getUser());

        // Если не аутентифицирован и есть initData, пробуем аутентифицироваться
        if (!isAlreadyAuthenticated && initDataState) {
            authenticateUser();
        }
    }, [initDataState]);

    return {
        isAuthenticated,
        isLoading,
        error,
        userDetails,
        retry: authenticateUser
    };
}