"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Pencil, Trash } from "lucide-react";

interface Listing {
  id: number;
  name: string;
  status: "Активное" | "Завершено" | "В ожидании";
  date: string;
  image: string;
}

const userListings: Listing[] = [
  {
    id: 1,
    name: "Плюшевый мишка",
    status: "Активное",
    date: "2024-02-21",
    image:
      "https://img.freepik.com/premium-photo/toys-kids-play-time-colorful-fun-composition_594847-3791.jpg",
  },
  {
    id: 2,
    name: "Конструктор LEGO",
    status: "В ожидании",
    date: "2024-02-19",
    image:
      "https://img.freepik.com/premium-photo/lego-star-wars-figures-are-standing-table-with-gun-generative-ai_958138-93159.jpg",
  },
];

export default function UserListings() {
  const [listings, setListings] = useState(userListings);

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" />
        Мои объявления
      </h1>
      <div className="flex flex-col gap-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex items-center gap-4 p-4 bg-white shadow rounded-lg"
          >
            <img
              src={listing.image}
              alt={listing.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{listing.name}</h2>
              <p className="text-sm text-gray-500">
                {listing.status} • {listing.date}
              </p>
            </div>
            <button className="p-2 text-gray-600 hover:text-blue-500">
              <Pencil className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-500">
              <Trash className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Кнопка "Добавить объявление" ведет на страницу создания */}
      <Link href="/listings/create">
        <button className="fixed bottom-[72px] left-1/2 transform -translate-x-1/2 bg-blue-500 text-white rounded-full p-4 shadow-lg flex items-center gap-2 z-50">
          <Plus className="w-6 h-6" />
          Добавить
        </button>
      </Link>
    </div>
  );
}
