"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    images: string[];
  };
}

export default function ProductCard({ product }: ProductProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <div
      className="relative w-full shadow-lg rounded-2xl flex flex-col overflow-hidden cursor-pointer"
      onClick={() => {}}
    >
      <div className="relative w-full h-64">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1}
          className="w-full h-full"
        >
          {product.images.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setFavorite(!favorite);
          }}
        >
          <Heart
            className={
              favorite
                ? "text-red-500 stroke-2 stroke-white"
                : "text-gray-900 stroke-2 stroke-black"
            }
            fill={favorite ? "red" : "white"}
          />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
        <div className="mt-auto pb-1">
          <button className="w-full bg-blue-500 text-white rounded-lg p-2">
            К обмену
          </button>
        </div>
      </div>
    </div>
  );
}
