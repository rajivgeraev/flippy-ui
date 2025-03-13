import { useState, useEffect } from 'react';
import { Listing } from '@/types/listings';
import { ListingService } from '@/services/listingService';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Хук для получения списка объявлений пользователя для обмена
 */
export function useMyListingsForTrade() {
    const [listings, setListings] = useState<{ id: string; name: string; image: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuthContext();

    useEffect(() => {
        const fetchListings = async () => {
            if (!isAuthenticated) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Получаем только активные объявления
                const response = await ListingService.getMyListings('active', 0);

                // Преобразуем данные в формат, необходимый для компонента TradeModal
                const formattedListings = response.listings.map((listing: Listing) => ({
                    id: listing.id,
                    name: listing.title,
                    image: listing.images && listing.images.length > 0
                        ? listing.images[0].url
                        : "https://via.placeholder.com/150?text=Нет+изображения"
                }));

                setListings(formattedListings);
            } catch (err) {
                console.error('Ошибка при загрузке объявлений для обмена:', err);
                setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке ваших объявлений');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [isAuthenticated]);

    return {
        userToys: listings,
        loading,
        error
    };
}