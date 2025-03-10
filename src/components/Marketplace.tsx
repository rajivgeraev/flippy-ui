// src/components/Marketplace.tsx
"use client";

import { useRef, useCallback, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { usePublicListings } from "@/hooks/usePublicListings";
import { Loader2 } from "lucide-react";

export default function Marketplace() {
  const { listings, loading, error, loadMore, hasMore } = usePublicListings();

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
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg">
          {error}
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
            const productData = {
              id: listing.id,
              name: listing.title,
              description: listing.description,
              images: listing.images.map((img) => img.url),
              allowSale: false, // пока не поддерживаем продажу
            };

            return (
              <div
                key={listing.id}
                ref={isLastElement ? lastListingElementRef : null}
              >
                <ProductCard
                  product={productData}
                  userToys={[]} // здесь будут игрушки пользователя, когда добавим функционал
                />
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center my-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
