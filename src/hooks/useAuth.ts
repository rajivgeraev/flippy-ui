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
    const [telegramContext, setTelegramContext] = useState(false);

    // Всегда вызываем хук useSignal
    const initDataSignal = useSignal(initData.state);

    // Проверяем контекст в useEffect
    useEffect(() => {
        // Проверяем после небольшой задержки для завершения инициализации
        const timer = setTimeout(() => {
            const isInTelegram = isTelegramContext();
            setTelegramContext(isInTelegram);
            console.log("== isInTelegram ===>>", isInTelegram);
            console.log("== initDataState ===>>", isInTelegram ? initDataSignal : null);
        }, 100);

        return () => clearTimeout(timer);
    }, [initDataSignal]);

    // Аутентификация через Telegram (без изменений)...
    const authenticateWithTelegram = async () => {
        if (!initDataSignal) {
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
        if (telegramContext && initDataSignal) {
            authenticateWithTelegram();
        } else if (isDevelopmentMode() && process.env.NEXT_PUBLIC_APP_ENV === 'development') {
            authenticateForDevelopment();
        } else {
            const isAlreadyAuthenticated = AuthService.isAuthenticated();
            setIsAuthenticated(isAlreadyAuthenticated);
            setUserDetails(AuthService.getUser());
        }
    }, [telegramContext, initDataSignal]);


    return {
        isAuthenticated,
        isLoading,
        error,
        userDetails,
        retry: telegramContext ? authenticateWithTelegram : authenticateForDevelopment
    };
}