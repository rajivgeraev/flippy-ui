"use client";

import { useRef, useCallback, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, loading, error, hasMore, loadMore, removeFromFavorites } =
    useFavorites();

  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

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

  // Обработчик для удаления из избранного
  const handleRemoveFromFavorites = async (listingId: string) => {
    await removeFromFavorites(listingId);
  };

  // Если пользователь не авторизован, показываем сообщение
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg shadow m-4">
        <AlertCircle className="w-5 h-5 inline-block mr-2" />
        Для просмотра избранных объявлений необходимо авторизоваться
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 p-4">
        <Heart className="w-6 h-6" />
        Избранное
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg mx-4">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}

      {favorites.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">
            У вас пока нет избранных объявлений
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Перейти к объявлениям
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {favorites.map((favorite, index) => {
            const isLastElement = index === favorites.length - 1;

            if (!favorite.listing) return null;

            // Преобразуем данные для ProductCard
            const productData = {
              id: favorite.listing.id,
              name: favorite.listing.title,
              description: favorite.listing.description,
              images: favorite.listing.images
                ? favorite.listing.images.map((img) => img.url)
                : [],
              allowSale: false, // пока не поддерживаем продажу
            };

            return (
              <div
                key={favorite.id}
                ref={isLastElement ? lastListingElementRef : null}
                className="relative"
              >
                <ProductCard
                  product={productData}
                  userToys={[]}
                  isFavorite={true}
                  onFavoriteToggle={() =>
                    handleRemoveFromFavorites(favorite.listing_id)
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
    </div>
  );
}
