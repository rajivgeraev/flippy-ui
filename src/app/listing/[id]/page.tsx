// src/app/listing/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  Share2,
  ArrowLeft,
  MessageCircle,
  ArrowRightLeft,
  Flag,
  MapPin,
  Calendar,
  Info,
  Maximize,
  Loader2,
} from "lucide-react";
import { Swiper, SwiperSlide, SwiperClass } from "swiper/react";
import { Pagination, Navigation, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/zoom";
import TradeModal from "@/components/TradeModal";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import { useMyListingsForTrade } from "@/hooks/useMyListingsForTrade";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { ListingService } from "@/services/listingService";
import Link from "next/link";

// Типы состояний игрушек с названиями
const conditionLabels: Record<string, string> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  used: "Б/у",
  needs_repair: "Требует ремонта",
  damaged: "Поврежденное",
};

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { checkFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const [favorite, setFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [authRequired, setAuthRequired] = useState(false);

  // Состояние для полноэкранного просмотра
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Ref для управления Swiper
  const swiperRef = useRef<SwiperClass | null>(null);

  // Получаем список игрушек пользователя для обмена
  const { userToys, loading: toysLoading } = useMyListingsForTrade();

  // Загружаем детали объявления и проверяем статус избранного
  useEffect(() => {
    if (!authLoading && listingId) {
      fetchListing();
      if (isAuthenticated) {
        checkFavoriteStatus();
      }
    }
  }, [listingId, isAuthenticated, authLoading]);

  // Очистка сообщений через 3 секунды
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Функция для загрузки данных объявления
  const fetchListing = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await ListingService.getListing(listingId).catch(
        (err) => {
          if (err.message.includes("авторизация")) {
            setAuthRequired(true);
          }
          throw err;
        }
      );

      setProduct({
        id: response.listing.id,
        name: response.listing.title,
        description: response.listing.description,
        images: response.listing.images.map((img: any) => img.url),
        condition: response.listing.condition,
        categories: response.listing.categories,
        createdAt: response.listing.created_at,
        allowTrade: response.listing.allow_trade,
        owner: {
          id: response.user.id,
          name: `${response.user.first_name || ""} ${
            response.user.last_name || ""
          }`.trim(),
          avatar: response.user.avatar_url,
          joinedDate: response.user.created_at,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при загрузке объявления"
      );
    } finally {
      setLoading(false);
    }
  };

  // Проверка статуса избранного
  const checkFavoriteStatus = async () => {
    try {
      const isFavorite = await checkFavorite(listingId);
      setFavorite(isFavorite);
    } catch (err) {
      console.error("Ошибка при проверке статуса избранного:", err);
    }
  };

  // Обработчик переключения избранного
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setErrorMessage("Авторизуйтесь, чтобы добавить в избранное");
      return;
    }

    setIsLoadingFavorite(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const success = favorite
        ? await removeFromFavorites(listingId)
        : await addToFavorites(listingId);

      if (success) {
        setFavorite(!favorite);
        setSuccessMessage(
          favorite ? "Удалено из избранного" : "Добавлено в избранное"
        );
      } else {
        setErrorMessage("Не удалось выполнить операцию");
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса избранного:", error);
      setErrorMessage("Произошла ошибка. Попробуйте еще раз.");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Обработчик открытия полноэкранного просмотра
  const handleOpenFullscreen = (index: number) => {
    setActiveImageIndex(index);
    setFullscreenOpen(true);
  };

  // Возвращаемся на предыдущую страницу
  const handleGoBack = () => {
    router.back();
  };

  // Стили для уведомлений
  const notificationStyles = {
    animation: "fadeInOut 3s ease-in-out forwards",
  };

  const animationKeyframes = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -10px); }
      10% { opacity: 1; transform: translate(-50%, 0); }
      90% { opacity: 1; transform: translate(-50%, 0); }
      100% { opacity: 0; transform: translate(-50%, -10px); }
    }
  `;

  if (authRequired && !isAuthenticated) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-10 bg-yellow-50 rounded-lg">
        <h1 className="text-xl font-bold text-yellow-700 mb-4">
          Требуется авторизация
        </h1>
        <p className="text-yellow-600 mb-6">
          Для просмотра этого объявления необходимо авторизоваться.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-blue-600"
          >
            <ArrowLeft size={16} /> Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-10 bg-red-50 rounded-lg">
        <h1 className="text-xl font-bold text-red-700 mb-4">Ошибка</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-blue-600"
        >
          <ArrowLeft size={16} /> Вернуться назад
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-10 bg-yellow-50 rounded-lg">
        <h1 className="text-xl font-bold text-yellow-700 mb-4">
          Объявление не найдено
        </h1>
        <p className="text-yellow-600 mb-4">
          Объявление не существует или было удалено.
        </p>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-blue-600"
        >
          <ArrowLeft size={16} /> Вернуться на главную
        </button>
      </div>
    );
  }

  const defaultImage =
    "https://via.placeholder.com/400x400?text=Нет+изображения";
  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="pb-32">
      {/* Добавляем стили для анимации */}
      <style dangerouslySetInnerHTML={{ __html: animationKeyframes }} />

      {/* Верхняя панель */}
      <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white shadow-sm">
        <button onClick={handleGoBack} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className={`p-1 ${
              isLoadingFavorite ? "opacity-50 cursor-wait" : ""
            }`}
            disabled={isLoadingFavorite}
          >
            {isLoadingFavorite ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            ) : (
              <Heart
                className={favorite ? "text-red-500" : "text-gray-500"}
                fill={favorite ? "red" : "none"}
              />
            )}
          </button>
          <button className="p-1">
            <Share2 className="w-6 h-6 text-gray-500" />
          </button>
          <button className="p-1">
            <Flag className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Блок изображений с превью */}
      <div className="w-full bg-gray-100 relative z-0">
        {hasImages ? (
          <div className="flex flex-col md:flex-row md:gap-4 max-w-7xl mx-auto">
            {/* Основной Swiper */}
            <div className="w-full h-72 md:h-[400px] md:max-w-[calc(100%-96px)] relative">
              <button
                className="absolute top-2 right-2 z-20 bg-black bg-opacity-50 text-white p-1.5 rounded-md"
                onClick={() => handleOpenFullscreen(0)}
              >
                <Maximize className="w-5 h-5" />
              </button>

              <Swiper
                modules={[Pagination, Navigation, Zoom]}
                // pagination={{ clickable: true }}
                // navigation
                zoom={true}
                observer={true}
                observeParents={true}
                className="w-full h-full"
                spaceBetween={0}
                slidesPerView={1}
                onSlideChange={(swiper) =>
                  setActiveImageIndex(swiper.activeIndex)
                }
                onSwiper={(swiper) => (swiperRef.current = swiper)}
              >
                {product.images.map((img: string, index: number) => (
                  <SwiperSlide key={index}>
                    <div
                      className="w-full h-full flex items-center justify-center"
                      onClick={() => handleOpenFullscreen(index)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - изображение ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultImage;
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Превью изображений */}
            <div className="flex md:flex-col gap-2 p-2 overflow-x-auto md:overflow-y-auto md:w-24 md:h-[400px] bg-white">
              {product.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`Превью ${index + 1}`}
                  className={`w-16 h-16 md:w-20 md:h-20 object-cover rounded-md cursor-pointer transition-opacity ${
                    activeImageIndex === index
                      ? "opacity-100 border-2 border-blue-500"
                      : "opacity-60 hover:opacity-80"
                  }`}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/100x100?text=Нет+превью";
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-72 flex items-center justify-center">
            <img
              src={defaultImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {product.condition && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
              <Info className="w-3 h-3" />
              {conditionLabels[product.condition] || product.condition}
            </span>
          )}
          {product.createdAt && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1 ml-auto">
              <Calendar className="w-3 h-3" />
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {product.location && (
          <div className="mb-4 text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            {product.location}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Описание</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {product.description || "Описание отсутствует"}
          </p>
        </div>

        {product.categories && product.categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Категории</h2>
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.ageGroup && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Возрастная группа</h2>
            <p className="text-gray-700">{product.ageGroup}</p>
          </div>
        )}

        {product.owner && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Владелец</h2>
            <div className="flex items-center gap-3">
              <img
                src={product.owner.avatar || "https://via.placeholder.com/40"}
                alt={product.owner.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">{product.owner.name}</p>
                {product.owner?.rating !== undefined && (
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(product.owner?.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      {(product.owner.rating || 0).toFixed(1)}
                    </span>
                  </div>
                )}
                {product.owner?.joinedDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    На платформе с{" "}
                    {new Date(product.owner.joinedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Фиксированная панель снизу */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white border-t flex gap-2 shadow-md">
        <button
          className="flex-1 bg-gray-100 text-gray-800 rounded-lg p-3 flex items-center justify-center gap-2"
          onClick={() => {
            // Здесь будет логика для чата
          }}
        >
          <MessageCircle className="w-5 h-5" />
          Написать
        </button>
        <button
          className="flex-1 bg-blue-500 text-white rounded-lg p-3 flex items-center justify-center gap-2"
          onClick={() => setIsTradeOpen(true)}
        >
          <ArrowRightLeft className="w-5 h-5" />
          Предложить обмен
        </button>
      </div>

      {/* Всплывающие сообщения */}
      {errorMessage && (
        <div
          className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
          style={notificationStyles}
        >
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div
          className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
          style={notificationStyles}
        >
          {successMessage}
        </div>
      )}

      {/* Модальное окно "Предложить обмен" */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        userToys={userToys}
        receiverListingId={product.id.toString()}
        allowSale={false}
      />

      {/* Полноэкранный просмотр изображений */}
      {hasImages && (
        <FullscreenImageViewer
          isOpen={fullscreenOpen}
          onClose={() => setFullscreenOpen(false)}
          images={product.images}
          initialIndex={activeImageIndex}
        />
      )}
    </div>
  );
}
