// src/components/Marketplace.tsx
"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { usePublicListings } from "@/hooks/usePublicListings";
import { useMyListingsForTrade } from "@/hooks/useMyListingsForTrade";
import { useFavorites } from "@/hooks/useFavorites";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Marketplace() {
  const { listings, loading, error, loadMore, hasMore } = usePublicListings();
  const {
    userToys,
    loading: toysLoading,
    error: toysError,
  } = useMyListingsForTrade();

  const { isAuthenticated } = useAuthContext();
  const { checkFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [favoriteStatuses, setFavoriteStatuses] = useState<
    Record<string, boolean>
  >({});
  const [isCheckingFavorites, setIsCheckingFavorites] = useState(false);
  const checkedListingIds = useRef<Set<string>>(new Set());

  // Для бесконечной прокрутки
  const observer = useRef<IntersectionObserver | null>(null);
  const lastListingElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  // Оптимизированная проверка избранных объявлений
  useEffect(() => {
    // Если не авторизован или загрузка - пропускаем
    if (!isAuthenticated || listings.length === 0 || isCheckingFavorites)
      return;

    const checkNewFavorites = async () => {
      // Проверяем, есть ли новые объявления, которые еще не проверены
      const newListings = listings.filter(
        (listing) => !checkedListingIds.current.has(listing.id.toString())
      );

      // Если нет новых объявлений - пропускаем
      if (newListings.length === 0) return;

      setIsCheckingFavorites(true);

      try {
        const newStatuses: Record<string, boolean> = {};

        // Проверяем только новые, ранее не проверенные объявления
        for (const listing of newListings) {
          const listingId = listing.id.toString();
          const isFavorite = await checkFavorite(listingId);
          newStatuses[listingId] = isFavorite;

          // Отмечаем, что это объявление уже проверено
          checkedListingIds.current.add(listingId);
        }

        // Обновляем статусы только для новых объявлений
        setFavoriteStatuses((prev) => ({ ...prev, ...newStatuses }));
      } catch (err) {
        console.error("Ошибка при проверке избранных объявлений:", err);
      } finally {
        setIsCheckingFavorites(false);
      }
    };

    checkNewFavorites();
  }, [isAuthenticated, listings, checkFavorite, isCheckingFavorites]);

  // Функция для обработки переключения избранного
  const handleFavoriteToggle = async (
    listingId: string,
    isFavorite: boolean
  ) => {
    try {
      let success = false;

      if (isFavorite) {
        // Если уже в избранном - удаляем
        success = await removeFromFavorites(listingId);
      } else {
        // Если не в избранном - добавляем
        success = await addToFavorites(listingId);
      }

      // Если операция успешна, обновляем локальное состояние
      if (success) {
        setFavoriteStatuses((prev) => ({
          ...prev,
          [listingId]: !isFavorite,
        }));
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса избранного:", error);
    }
  };

  return (
    <div className="pb-16">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg mx-4">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}

      {/* Ошибка загрузки объявлений пользователя для обмена */}
      {toysError && (
        <div className="bg-yellow-100 text-yellow-700 p-3 mb-4 rounded-lg mx-4 text-sm">
          {toysError}
        </div>
      )}

      {listings.length === 0 && !loading ? (
        <div className="text-center p-10 text-gray-500">
          Объявления не найдены. Будьте первым, кто добавит объявление!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {listings.map((listing, index) => {
            const isLastElement = index === listings.length - 1;
            const listingId = listing.id.toString();
            const isFavorite = favoriteStatuses[listingId] || false;

            // Преобразуем данные для ProductCard
            const productData = {
              id: listing.id,
              name: listing.title,
              description: listing.description,
              images: listing.images.map((img) => ({
                url: img.url,
                preview_url: img.preview_url || img.url,
              })),
              allowSale: false, // пока не поддерживаем продажу
            };

            return (
              <div
                key={listing.id}
                ref={isLastElement ? lastListingElementRef : null}
              >
                <ProductCard
                  product={productData}
                  userToys={userToys}
                  isFavorite={isFavorite}
                  onFavoriteToggle={() =>
                    handleFavoriteToggle(listingId, isFavorite)
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="flex justify-center items-center my-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Индикатор при загрузке объявлений пользователя */}
      {toysLoading && !loading && (
        <div className="fixed bottom-20 right-4 bg-white shadow-lg rounded-full p-2 z-10">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
