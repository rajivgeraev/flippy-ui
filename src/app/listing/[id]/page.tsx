"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/zoom";
import TradeModal from "@/components/TradeModal";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import { useMyListingsForTrade } from "@/hooks/useMyListingsForTrade";
import { useAuthContext } from "@/contexts/AuthContext";
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

  const [favorite, setFavorite] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [authRequired, setAuthRequired] = useState(false);

  // Состояние для полноэкранного просмотра
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Получаем список игрушек пользователя для обмена
  const { userToys, loading: toysLoading } = useMyListingsForTrade();

  // Загружаем детали объявления
  useEffect(() => {
    if (!authLoading) {
      fetchListing();
    }
  }, [listingId, isAuthenticated, authLoading]);

  // Функция для загрузки данных объявления
  const fetchListing = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      setError(null);

      // Используем сервис ListingService для получения данных объявления
      const response = await ListingService.getListing(listingId).catch(
        (err) => {
          // Если ошибка связана с авторизацией, устанавливаем флаг
          if (err.message.includes("авторизация")) {
            setAuthRequired(true);
          }
          throw err;
        }
      );

      // Форматируем данные для отображения
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
          // Добавляем доп. информацию о пользователе, если доступна
          joinedDate: response.user.created_at,
        },
      });

      // Инициализируем массив для отслеживания загрузки изображений
      if (response.listing.images && response.listing.images.length > 0) {
        setImagesLoaded(new Array(response.listing.images.length).fill(false));
      }
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

  // Обработчик завершения загрузки изображения
  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
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

  // Показываем экран авторизации, если требуется
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

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Показываем сообщение об ошибке
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

  // Показываем сообщение, если объявление не найдено
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

  // Используем значение по умолчанию для изображения, если массив пуст
  const defaultImage =
    "https://via.placeholder.com/400x400?text=Нет+изображения";
  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="pb-32">
      {/* Верхняя панель */}
      <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white shadow-sm">
        <button onClick={handleGoBack} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setFavorite(!favorite)} className="p-1">
            <Heart
              className={favorite ? "text-red-500" : "text-gray-500"}
              fill={favorite ? "red" : "none"}
            />
          </button>
          <button className="p-1">
            <Share2 className="w-6 h-6 text-gray-500" />
          </button>
          <button className="p-1">
            <Flag className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Галерея изображений */}
      <div className="w-full h-72 bg-gray-100 relative">
        {hasImages ? (
          <>
            {/* Кнопка для перехода в полноэкранный режим */}
            <button
              className="absolute top-2 right-2 z-20 bg-black bg-opacity-50 text-white p-1.5 rounded-md"
              onClick={() => handleOpenFullscreen(0)}
            >
              <Maximize className="w-5 h-5" />
            </button>

            <Swiper
              modules={[Pagination, Navigation, Zoom]}
              pagination={{ clickable: true }}
              navigation
              zoom={true}
              className="w-full h-full"
              spaceBetween={0}
              slidesPerView={1}
              onSlideChange={(swiper) =>
                setActiveImageIndex(swiper.activeIndex)
              }
            >
              {product.images.map((img: string, index: number) => (
                <SwiperSlide key={index}>
                  <div
                    className="w-full h-full flex items-center justify-center"
                    onClick={() => handleOpenFullscreen(index)}
                  >
                    {!imagesLoaded[index] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-8 h-8 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <div className="swiper-zoom-container">
                      <img
                        src={img}
                        alt={`${product.name} - изображение ${index + 1}`}
                        className={`w-full h-full object-contain ${
                          !imagesLoaded[index] ? "opacity-0" : "opacity-100"
                        }`}
                        onLoad={() => handleImageLoad(index)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultImage;
                          handleImageLoad(index);
                        }}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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

        {/* Основная информация */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Состояние */}
          {product.condition && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
              <Info className="w-3 h-3" />
              {conditionLabels[product.condition] || product.condition}
            </span>
          )}

          {/* Дата публикации */}
          {product.createdAt && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1 ml-auto">
              <Calendar className="w-3 h-3" />
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Местоположение */}
        {product.location && (
          <div className="mb-4 text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            {product.location}
          </div>
        )}

        {/* Описание */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Описание</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {product.description || "Описание отсутствует"}
          </p>
        </div>

        {/* Категории */}
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

        {/* Возрастная группа */}
        {product.ageGroup && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Возрастная группа</h2>
            <p className="text-gray-700">{product.ageGroup}</p>
          </div>
        )}

        {/* Информация о владельце */}
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
