import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

interface FullscreenImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
}

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState<boolean[]>([]);

  // Настраиваем начальный массив статусов загрузки
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setLoading(new Array(images.length).fill(true));

      // Блокируем прокрутку на основной странице
      document.body.style.overflow = "hidden";
    }

    // Восстанавливаем прокрутку при закрытии
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex, images.length]);

  // Обработчик загрузки изображения
  const handleImageLoad = (index: number) => {
    setLoading((prev) => {
      const newLoading = [...prev];
      newLoading[index] = false;
      return newLoading;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Верхняя панель с кнопкой закрытия */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-10">
        <div className="text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Swiper для просмотра изображений */}
      <Swiper
        modules={[Navigation, Pagination, Zoom]}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        zoom={{ maxRatio: 3, minRatio: 1 }}
        initialSlide={initialIndex}
        spaceBetween={0}
        slidesPerView={1}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="flex items-center justify-center">
            <div className="swiper-zoom-container w-full h-full flex items-center justify-center">
              {loading[index] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={image}
                alt={`Изображение ${index + 1}`}
                className="max-w-full max-h-[calc(100vh-80px)] object-contain"
                onLoad={() => handleImageLoad(index)}
                style={{ opacity: loading[index] ? 0 : 1 }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Кнопки навигации */}
      <div className="swiper-button-prev !text-white !opacity-70 !left-2 !w-10 !h-10 hover:!opacity-100 transition">
        <ChevronLeft size={40} />
      </div>
      <div className="swiper-button-next !text-white !opacity-70 !right-2 !w-10 !h-10 hover:!opacity-100 transition">
        <ChevronRight size={40} />
      </div>
    </div>
  );
};

export default FullscreenImageViewer;
