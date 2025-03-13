// src/hooks/usePublicListings.ts
import { useState, useEffect, useCallback } from 'react';
import { Listing } from '@/types/listings';
import { AuthService } from '@/services/auth';

export function usePublicListings() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchListings = useCallback(async (resetOffset = false) => {
        try {
            setLoading(true);
            setError(null);

            const newOffset = resetOffset ? 0 : offset;
            if (resetOffset) {
                setOffset(0);
                setListings([]);
            }

            // Используем API с сервера
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings?offset=${newOffset}`);

            if (!response.ok) {
                throw new Error('Не удалось загрузить объявления');
            }

            const data = await response.json();

            if (resetOffset) {
                setListings(data.listings);
            } else {
                setListings(prev => [...prev, ...data.listings]);
            }

            setTotal(data.total);
            setHasMore(newOffset + data.limit < data.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке объявлений');
        } finally {
            setLoading(false);
        }
    }, [offset]);

    // Загрузка первой страницы при монтировании
    useEffect(() => {
        fetchListings(true);
    }, []);

    // При изменении offset загружаем следующую страницу
    useEffect(() => {
        if (offset > 0) {
            fetchListings(false);
        }
    }, [offset]);

    // Функция для загрузки следующей страницы
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setOffset(prevOffset => prevOffset + 20); // Предполагаем, что лимит равен 20
        }
    }, [loading, hasMore]);

    // Функция для обновления списка
    const refreshListings = useCallback(() => {
        fetchListings(true);
    }, [fetchListings]);

    return {
        listings,
        loading,
        error,
        loadMore,
        hasMore,
        total,
        refreshListings
    };
}