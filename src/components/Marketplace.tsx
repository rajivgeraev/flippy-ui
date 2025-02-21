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
      "https://img.freepik.com/premium-photo/toys-collection-isolated-background_488220-1075.jpg",
      "https://img.freepik.com/premium-photo/colorful-educational-toys-children-white-surface_168508-305.jpg",
    ],
  },
  {
    id: 2,
    name: "Конструктор LEGO",
    description: "Набор LEGO для создания замка.",
    images: [
      "https://img.freepik.com/premium-photo/lego-star-wars-figures-are-standing-table-with-gun-generative-ai_958138-93159.jpg",
      "https://img.freepik.com/premium-photo/quotare-you-lookingquot_1025557-12229.jpg",
      "https://img.freepik.com/premium-photo/space-station-soiree-birthday-cake_1170794-26264.jpg",
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
