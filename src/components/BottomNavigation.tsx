"use client";

import { Home, PlusCircle, MessageCircle, User, Heart } from "lucide-react";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-around p-3 border-t border-gray-300">
      <button className="flex flex-col items-center text-gray-700">
        <Home className="w-6 h-6" />
        <span className="text-xs">Главная</span>
      </button>
      <button className="flex flex-col items-center text-gray-700">
        <Heart className="w-6 h-6" />
        <span className="text-xs">Избранное</span>
      </button>
      <button className="flex flex-col items-center text-gray-700">
        <PlusCircle className="w-6 h-6" />
        <span className="text-xs">Новое</span>
      </button>
      <button className="flex flex-col items-center text-gray-700">
        <MessageCircle className="w-6 h-6" />
        <span className="text-xs">Сообщения</span>
      </button>
      <button className="flex flex-col items-center text-gray-700">
        <User className="w-6 h-6" />
        <span className="text-xs">Профиль</span>
      </button>
    </div>
  );
}
