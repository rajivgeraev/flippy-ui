// src/services/auth.ts
import { TelegramUserInfo } from '@/types/TelegramUserInfo';

// Интерфейс для ответа от API с токеном
interface AuthResponse {
    token: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        username: string;
        avatar_url: string;
    };
}

// Класс для работы с аутентификацией
export class AuthService {
    private static readonly TOKEN_KEY = 'jwt_token';
    private static readonly USER_KEY = 'flippy_user';

    // Получение токена из localStorage
    static getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Сохранение токена и информации о пользователе
    static setToken(token: string, user: AuthResponse['user']): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    // Проверка, аутентифицирован ли пользователь
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Получение информации о пользователе
    static getUser(): AuthResponse['user'] | null {
        if (typeof window === 'undefined') return null;
        const userJson = localStorage.getItem(this.USER_KEY);
        if (!userJson) return null;
        try {
            return JSON.parse(userJson);
        } catch (e) {
            return null;
        }
    }

    // Аутентификация через Telegram Mini App
    static async authenticateWithTelegram(initData: string): Promise<AuthResponse> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ init_data: initData }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка аутентификации');
        }

        const authData: AuthResponse = await response.json();
        this.setToken(authData.token, authData.user);
        return authData;
    }

    // Получение тестового токена (только для разработки)
    static async getTestToken(userId: string): Promise<AuthResponse> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/test-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка получения тестового токена');
        }

        const data = await response.json();

        // Создаем объект пользователя
        const user = {
            id: data.user_id || userId,
            first_name: 'Test',
            last_name: 'User',
            username: 'test_user',
            avatar_url: '',
        };

        // Сохраняем токен и данные пользователя
        this.setToken(data.jwt_token, user);

        return {
            token: data.jwt_token,
            user: user
        };
    }

    // Выполнение защищенного запроса к API
    static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Пользователь не аутентифицирован');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Если получили 401 (Unauthorized), токен истек или недействителен
        if (response.status === 401) {
            // Будем считать, что любой 401 означает истечение токена
            console.log("Токен истек, попытка повторной аутентификации...");

            // Очищаем текущий токен
            localStorage.removeItem(this.TOKEN_KEY);

            // Редиректим на страницу, которая выполнит повторную аутентификацию
            // (например, профиль или страница входа)
            if (typeof window !== 'undefined') {
                window.location.href = "/profile";
            }

            throw new Error('Сессия истекла, требуется повторная аутентификация');
        }

        return response;
    }

    // Выход из системы - очищаем хранилище
    static logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}