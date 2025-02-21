"use client";

import ProductCard from "@/components/ProductCard";
import BottomNavigation from "@/components/BottomNavigation";

const products = [
  {
    id: 1,
    name: "Плюшевый мишка",
    description: "Большой плюшевый мишка, мягкий и приятный на ощупь.",
    images: [
      "https://img.freepik.com/premium-photo/toys-kids-play-time-colorful-fun-composition_594847-3791.jpg",
    ],
  },
  {
    id: 2,
    name: "Конструктор LEGO",
    description: "Набор LEGO для создания замка.",
    images: [
      "https://img.freepik.com/premium-photo/lego-star-wars-figures-are-standing-table-with-gun-generative-ai_958138-93159.jpg",
    ],
  },
];

export default function Marketplace() {
  return (
    <div className="pb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <BottomNavigation />
    </div>
  );
}
