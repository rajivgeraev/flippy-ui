"use client";

import { useState } from "react";
import { Heart, Eye } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import TradeModal from "@/components/TradeModal";
import Link from "next/link";

interface ProductProps {
  product: {
    id: string | number;
    name: string;
    description: string;
    images: string[];
    allowSale?: boolean;
  };
  userToys: { id: number | string; name: string; image: string }[];
}

export default function ProductCard({ product, userToys }: ProductProps) {
  const [favorite, setFavorite] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  // Используем значение по умолчанию для изображения, если массив пуст
  const defaultImage =
    "https://via.placeholder.com/300x300?text=Нет+изображения";
  const hasImages = product.images && product.images.length > 0;

  // Обрезаем описание, если оно слишком длинное
  const shortDescription =
    product.description && product.description.length > 100
      ? `${product.description.substring(0, 100)}...`
      : product.description;

  return (
    <div
      className="relative w-full shadow-lg rounded-2xl flex flex-col overflow-hidden cursor-pointer"
      onClick={() => {}}
    >
      <div className="relative w-full h-52">
        {hasImages ? (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            loop={hasImages && product.images.length > 1}
            className="w-full h-full"
          >
            {product.images.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`${product.name} - изображение ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    // Заменяем битые изображения на placeholder
                    (e.target as HTMLImageElement).src = defaultImage;
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src={defaultImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        )}
        <button
          className="absolute top-2.5 right-2.5 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setFavorite(!favorite);
          }}
        >
          <Heart
            className={
              favorite
                ? "text-red-500 stroke-2 stroke-white"
                : "text-black stroke-2 stroke-black"
            }
            fill={favorite ? "red" : "white"}
          />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">
          {shortDescription || "Нет описания"}
        </p>
        <div className="mt-auto pb-1 flex space-x-2">
          <button
            className="w-full bg-blue-500 text-white rounded-lg p-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsTradeOpen(true);
            }}
          >
            К обмену
          </button>
        </div>
      </div>

      {/* Модальное окно "Предложить обмен" */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        userToys={userToys}
        receiverListingId={product.id.toString()}
        allowSale={product.allowSale}
      />
    </div>
  );
}
