// src/components/ProductCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthContext } from "@/contexts/AuthContext";

// Обновленный интерфейс для изображений с поддержкой preview_url
interface ProductImage {
  url: string;
  preview_url?: string;
}

interface ProductProps {
  product: {
    id: string | number;
    name: string;
    description: string;
    // Обновленный тип для изображений - теперь может быть как строка, так и объект с url и preview_url
    images: (string | ProductImage)[];
    condition?: string;
    categories?: string[];
    createdAt?: string;
    owner?: {
      name: string;
      avatar: string;
      id: string;
      rating?: number;
      joinedDate?: string;
    };
    allowSale?: boolean;
    ageGroup?: string;
    location?: string;
  };
  userToys: { id: number | string; name: string; image: string }[];
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function ProductCard({
  product,
  userToys,
  isFavorite: initialIsFavorite,
  onFavoriteToggle,
}: ProductProps) {
  const [favorite, setFavorite] = useState(initialIsFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { addToFavorites, removeFromFavorites } = useFavorites();

  // Состояние для показа сообщений об ошибках/успехе
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Обновляем состояние, когда изменяется входное свойство isFavorite
  useEffect(() => {
    if (initialIsFavorite !== undefined) {
      setFavorite(initialIsFavorite);
    }
  }, [initialIsFavorite]);

  // Очистка сообщений через определенное время
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

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
    },
  };

  // Пользовательские CSS-переменные для Swiper
  const swiperStyle = {
    "--swiper-pagination-color": "#ffffff",
    "--swiper-pagination-bullet-inactive-color": "rgba(255, 255, 255, 0.6)",
    "--swiper-pagination-bullet-active-opacity": "1",
    "--swiper-pagination-bullet-size": "8px",
  } as React.CSSProperties;

  // Стили для уведомлений
  const notificationStyles = {
    animation: "fadeInOut 3s ease-in-out forwards",
  };

  // Определяем стили для анимации keyframes в строке
  const animationKeyframes = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -10px); }
      10% { opacity: 1; transform: translate(-50%, 0); }
      90% { opacity: 1; transform: translate(-50%, 0); }
      100% { opacity: 0; transform: translate(-50%, -10px); }
    }
  `;

  const handleCardClick = () => {
    router.push(`/listing/${product.id}`);
  };

  // Функция для определения URL изображения, предпочитая preview_url для карточек
  const getImageUrl = (image: string | ProductImage): string => {
    if (typeof image === "string") {
      return image;
    }
    // Если есть preview_url, используем его, иначе используем полный url
    return image.preview_url || image.url;
  };

  // Функция для переключения состояния избранного
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setErrorMessage("Авторизуйтесь, чтобы добавить в избранное");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Вызываем переданную функцию-обработчик, если она есть
      if (onFavoriteToggle) {
        onFavoriteToggle();

        // Локально обновляем UI для лучшего UX
        setFavorite(!favorite);
        setSuccessMessage(
          favorite ? "Удалено из избранного" : "Добавлено в избранное"
        );
      } else {
        // Стандартная логика, если обработчик не передан
        const success = favorite
          ? await removeFromFavorites(product.id.toString())
          : await addToFavorites(product.id.toString());

        if (success) {
          setFavorite(!favorite);
          setSuccessMessage(
            favorite ? "Удалено из избранного" : "Добавлено в избранное"
          );
        } else {
          setErrorMessage("Не удалось выполнить операцию");
        }
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса избранного:", error);
      setErrorMessage("Произошла ошибка. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Добавляем стили для анимации вне компонента */}
      <style dangerouslySetInnerHTML={{ __html: animationKeyframes }} />

      <div
        onClick={handleCardClick}
        className="relative w-full shadow-lg rounded-2xl flex flex-col overflow-hidden cursor-pointer h-[320px]"
      >
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
              onClick={(_, event) => event?.stopPropagation()} // Предотвращаем всплытие события при клике на Swiper
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.name} - изображение ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImage;
                    }}
                  />
                </SwiperSlide>
              ))}

              {/* Градиентная затемненная полоса внизу изображения */}
              <div
                className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)",
                }}
              ></div>

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
            className={`absolute top-2.5 right-2.5 z-30`}
            onClick={toggleFavorite}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
            ) : (
              <Heart
                className={
                  favorite
                    ? "text-red-500 stroke-2 stroke-white"
                    : "text-black stroke-2 stroke-black"
                }
                fill={favorite ? "red" : "white"}
                // size={20}
              />
            )}
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
                router.push(`/listing/${product.id}`);
              }}
            >
              К обмену
            </button>
          </div>
        </div>

        {/* Всплывающие сообщения */}
        {errorMessage && (
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
            style={notificationStyles}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
            style={notificationStyles}
          >
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
}
