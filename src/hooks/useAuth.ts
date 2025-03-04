"use client";

import { useState, useEffect } from 'react';
import { initData } from '@telegram-apps/sdk-react';
import { useSignal } from '@telegram-apps/sdk-react';
import { AuthService } from '@/services/auth';
import { isTelegramContext, isDevelopmentMode } from '@/core/init';

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userDetails, setUserDetails] = useState(AuthService.getUser());

    const isInTelegram = isTelegramContext();
    // Используем Telegram initData только если мы в Telegram
    const initDataState = isInTelegram ? useSignal(initData.state) : null;

    // Автоматическая аутентификация через Telegram
    const authenticateWithTelegram = async () => {
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
                authenticateWithTelegram();
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    // Аутентификация для режима разработки
    const authenticateForDevelopment = async () => {
        try {
            setIsLoading(true);

            // Получаем ID тестового пользователя из переменных окружения
            const userId = process.env.NEXT_PUBLIC_TEST_USER_ID || "3b270b4a-6289-47c8-a6d9-5833625b352f";

            // Используем тот же подход, что и в authenticateWithTelegram
            const data = await AuthService.getTestToken(userId);

            setUserDetails(data.user);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Ошибка тестовой аутентификации:', err);
            setError(err instanceof Error ? err.message : 'Ошибка тестовой аутентификации');
        } finally {
            setIsLoading(false);
        }
    };

    // Проверяем аутентификацию при загрузке страницы
    useEffect(() => {
        const isAlreadyAuthenticated = AuthService.isAuthenticated();
        setIsAuthenticated(isAlreadyAuthenticated);
        setUserDetails(AuthService.getUser());

        // Если не аутентифицирован, выбираем метод аутентификации в зависимости от контекста
        if (!isAlreadyAuthenticated) {
            if (isInTelegram && initDataState) {
                authenticateWithTelegram();
            } else if (isDevelopmentMode()) {
                authenticateForDevelopment();
            }
        }
    }, [isInTelegram, initDataState]);

    return {
        isAuthenticated,
        isLoading,
        error,
        userDetails,
        retry: isInTelegram ? authenticateWithTelegram : authenticateForDevelopment
    };
}