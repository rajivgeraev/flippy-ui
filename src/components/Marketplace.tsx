"use client";

import { useRef, useCallback, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { usePublicListings } from "@/hooks/usePublicListings";
import { useMyListingsForTrade } from "@/hooks/useMyListingsForTrade";
import { Loader2, AlertCircle } from "lucide-react";

export default function Marketplace() {
  const { listings, loading, error, loadMore, hasMore } = usePublicListings();
  const {
    userToys,
    loading: toysLoading,
    error: toysError,
  } = useMyListingsForTrade();

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

            // Преобразуем данные для ProductCard
            // Теперь передаем полный объект изображения с url и preview_url
            const productData = {
              id: listing.id,
              name: listing.title,
              description: listing.description,
              // Передаем объекты изображений с preview_url вместо только url
              images: listing.images.map((img) => ({
                url: img.url,
                preview_url: img.preview_url,
              })),
              condition: listing.condition,
              categories: listing.categories,
              createdAt: listing.created_at,
              allowSale: false, // пока не поддерживаем продажу
            };

            return (
              <div
                key={listing.id}
                ref={isLastElement ? lastListingElementRef : null}
              >
                <ProductCard product={productData} userToys={userToys} />
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
