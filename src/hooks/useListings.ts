// src/hooks/useListings.ts
import { useState, useEffect, useCallback } from 'react';
import { ListingService } from '@/services/listingService';
import { Listing, CreateListingData } from '@/types/listings';

export function useMyListings(initialStatus = 'all') {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState(initialStatus);
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

            const response = await ListingService.getMyListings(status, newOffset);

            if (resetOffset) {
                setListings(response.listings);
            } else {
                setListings(prev => [...prev, ...response.listings]);
            }

            setTotal(response.total);
            setHasMore(newOffset + response.limit < response.total);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке объявлений');
        } finally {
            setLoading(false);
        }
    }, [status, offset]);

    // Загрузка первой страницы при изменении статуса
    useEffect(() => {
        fetchListings(true);
    }, [status]);

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

    // Функция для изменения фильтра статуса
    const changeStatus = useCallback((newStatus: string) => {
        if (newStatus !== status) {
            setStatus(newStatus);
        }
    }, [status]);

    // Функция для обновления списка после создания/редактирования/удаления
    const refreshListings = useCallback(() => {
        fetchListings(true);
    }, [fetchListings]);

    return {
        listings,
        loading,
        error,
        status,
        changeStatus,
        loadMore,
        hasMore,
        total,
        refreshListings
    };
}

// Хук для работы с одним объявлением
export function useListing(id: string) {
    const [listing, setListing] = useState<Listing | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchListing = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await ListingService.getListing(id);

            setListing(response.listing);
            setUser(response.user);
            setIsOwner(response.is_owner);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке объявления');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchListing();
    }, [fetchListing]);

    // Функция для обновления объявления
    const updateListing = useCallback(async (data: CreateListingData) => {
        try {
            setLoading(true);
            setError(null);

            await ListingService.updateListing(id, data);

            // После успешного обновления, получаем свежие данные
            await fetchListing();

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении объявления');
            return false;
        } finally {
            setLoading(false);
        }
    }, [id, fetchListing]);

    // Функция для удаления объявления
    const deleteListing = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            await ListingService.deleteListing(id);

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при удалении объявления');
            return false;
        } finally {
            setLoading(false);
        }
    }, [id]);

    return {
        listing,
        user,
        isOwner,
        loading,
        error,
        refreshListing: fetchListing,
        updateListing,
        deleteListing
    };
}