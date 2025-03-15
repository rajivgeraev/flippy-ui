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

  // Настройки пагинации
  const paginationOptions = {
    clickable: true,
    renderBullet: function (index: number, className: string) {
      return `<span class="${className}" 
                style="width: 8px; 
                       height: 8px; 
                       margin: 0 4px; 
                       background-color: white;
                       opacity: 0.6;
                       transition: opacity 0.3s, transform 0.3s;">
              </span>`;
    }
  };

  // Пользовательские CSS-переменные для Swiper
  const swiperStyle = {
    "--swiper-pagination-color": "#ffffff",
    "--swiper-pagination-bullet-inactive-color": "rgba(255, 255, 255, 0.6)",
    "--swiper-pagination-bullet-active-opacity": "1",
    "--swiper-pagination-bullet-size": "8px",
  } as React.CSSProperties;

  return (
    <div className="relative w-full shadow-lg rounded-2xl flex flex-col overflow-hidden cursor-pointer h-[320px]">
      <div className="relative w-full h-40">
        {hasImages ? (
          <Swiper
            modules={[Pagination]}
            pagination={paginationOptions}
            spaceBetween={10}
            slidesPerView={1}
            loop={hasImages && product.images.length > 1}
            className="w-full h-full"
            style={swiperStyle}
          >
            {product.images.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`${product.name} - изображение ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultImage;
                  }}
                />
              </SwiperSlide>
            ))}
            
            {/* Градиентная затемненная полоса внизу изображения */}
            <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
                 style={{
                   background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)'
                 }}>
            </div>
            
            {/* Дополнительные стили для пагинации */}
            <style jsx global>{`
              .swiper-pagination {
                bottom: 10px !important;
                z-index: 20;
              }
              .swiper-pagination-bullet-active {
                opacity: 1 !important;
                transform: scale(1.2);
              }
            `}</style>
          </Swiper>
        ) : (
          <img
            src={defaultImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        )}
        <button
          className="absolute top-2.5 right-2.5 z-30"
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
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 flex-1 overflow-hidden line-clamp-2">
          {product.description || "Нет описания"}
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