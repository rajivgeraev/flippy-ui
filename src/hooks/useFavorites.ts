// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthService } from '@/services/auth';
import { useAuthContext } from '@/contexts/AuthContext';

// Интерфейс для избранного объявления
interface Favorite {
    id: string;
    user_id: string;
    listing_id: string;
    created_at: string;
    listing?: {
        id: string;
        title: string;
        description: string;
        images: {
            url: string;
            preview_url?: string;
            is_main: boolean;
        }[];
        [key: string]: any; // Для дополнительных полей
    };
}

// Интерфейс для ответа API со списком избранных объявлений
interface FavoritesResponse {
    favorites: Favorite[];
    total: number;
    limit: number;
    offset: number;
}

// Интерфейс для ответа API при проверке избранного
interface CheckFavoriteResponse {
    is_favorite: boolean;
    favorite_id?: string;
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const { isAuthenticated } = useAuthContext();

    // Кэш для хранения статусов избранных объявлений
    const favoritesCache = useRef<Record<string, { status: boolean; timestamp: number }>>({});
    // Кэш для избежания дублирования запросов
    const pendingChecks = useRef<Record<string, Promise<boolean>>>({});

    // Функция для загрузки избранных объявлений
    const fetchFavorites = useCallback(async (resetOffset = false) => {
        if (!isAuthenticated) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const newOffset = resetOffset ? 0 : offset;
            if (resetOffset) {
                setOffset(0);
                setFavorites([]);
            }

            // Параметры запроса
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`);
            url.searchParams.append('offset', newOffset.toString());

            // Выполняем запрос к API
            const response = await AuthService.fetchWithAuth(url.toString());

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении избранных объявлений');
            }

            const data: FavoritesResponse = await response.json();

            if (resetOffset) {
                setFavorites(data.favorites);
            } else {
                setFavorites(prev => [...prev, ...data.favorites]);
            }

            setTotal(data.total);
            setHasMore(newOffset + data.limit < data.total);

            // Обновляем кэш для всех полученных объявлений
            data.favorites.forEach(favorite => {
                favoritesCache.current[favorite.listing_id] = {
                    status: true,
                    timestamp: Date.now()
                };
            });

        } catch (err) {
            console.error('Ошибка при загрузке избранных объявлений:', err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке избранных объявлений');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, offset]);

    // Функция для загрузки следующей страницы
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setOffset(prevOffset => prevOffset + 20); // По умолчанию 20 объявлений на страницу
        }
    }, [loading, hasMore]);

    // Функция для проверки, находится ли объявление в избранном
    const checkFavorite = useCallback(async (listingId: string): Promise<boolean> => {
        if (!isAuthenticated || !listingId) {
            return false;
        }

        // Проверяем, есть ли актуальная информация в кэше (не старше 5 минут)
        const cachedData = favoritesCache.current[listingId];
        const now = Date.now();
        const cacheExpirationTime = 5 * 60 * 1000; // 5 минут

        if (cachedData && (now - cachedData.timestamp) < cacheExpirationTime) {
            return cachedData.status;
        }

        // Проверяем, не выполняется ли уже запрос для этого объявления
        if (listingId in pendingChecks.current) {
            // Дожидаемся результата уже запущенного запроса
            return await pendingChecks.current[listingId];
        }

        // Создаем новый запрос и сохраняем его Promise в pendingChecks
        const checkPromise = (async () => {
            try {
                const response = await AuthService.fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${listingId}/check`
                );

                // Если ошибка 404, значит объявление не в избранном
                if (!response.ok) {
                    if (response.status === 404) {
                        favoritesCache.current[listingId] = { status: false, timestamp: now };
                        return false;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Ошибка при проверке избранного');
                }

                const data: CheckFavoriteResponse = await response.json();

                // Сохраняем результат в кэше
                favoritesCache.current[listingId] = {
                    status: data.is_favorite,
                    timestamp: now
                };

                return data.is_favorite;
            } catch (err) {
                console.error('Ошибка при проверке избранного:', err);
                return false;
            } finally {
                // Удаляем запрос из списка ожидающих после его завершения
                delete pendingChecks.current[listingId];
            }
        })();

        // Сохраняем Promise в кэше ожидающих запросов
        pendingChecks.current[listingId] = checkPromise;

        return checkPromise;
    }, [isAuthenticated]);

    // Функция для добавления объявления в избранное
    const addToFavorites = useCallback(async (listingId: string): Promise<boolean> => {
        if (!isAuthenticated || !listingId) {
            return false;
        }

        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ listing_id: listingId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении в избранное');
            }

            // Обновляем кэш
            favoritesCache.current[listingId] = { status: true, timestamp: Date.now() };

            // Обновляем список избранных объявлений
            fetchFavorites(true);
            return true;
        } catch (err) {
            console.error('Ошибка при добавлении в избранное:', err);
            return false;
        }
    }, [isAuthenticated, fetchFavorites]);

    // Функция для удаления объявления из избранного
    const removeFromFavorites = useCallback(async (listingId: string): Promise<boolean> => {
        if (!isAuthenticated || !listingId) {
            return false;
        }

        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${listingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при удалении из избранного');
            }

            // Обновляем кэш
            favoritesCache.current[listingId] = { status: false, timestamp: Date.now() };

            // Обновляем список избранных объявлений, удаляя нужное объявление
            setFavorites(prev => prev.filter(fav => fav.listing_id !== listingId));
            return true;
        } catch (err) {
            console.error('Ошибка при удалении из избранного:', err);
            return false;
        }
    }, [isAuthenticated]);

    // Загружаем избранные объявления при монтировании компонента
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites(true);
        }
    }, [isAuthenticated, fetchFavorites]);

    // При изменении offset загружаем следующую страницу
    useEffect(() => {
        if (offset > 0) {
            fetchFavorites(false);
        }
    }, [offset, fetchFavorites]);

    return {
        favorites,
        loading,
        error,
        total,
        hasMore,
        loadMore,
        checkFavorite,
        addToFavorites,
        removeFromFavorites,
        refreshFavorites: () => fetchFavorites(true)
    };
}