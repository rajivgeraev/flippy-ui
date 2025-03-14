"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ClipboardList,
  MessageCircle,
  User,
  Heart,
  ArrowRightLeft,
} from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { useState, useEffect } from "react";

const BottomNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { chats } = useChats();
  const [unreadCount, setUnreadCount] = useState(0);

  // Список страниц, где скрывать навигацию (если надо)
  const hideNavOnPages = ["/login", "/signup"];

  // Вычисляем общее количество непрочитанных сообщений
  useEffect(() => {
    if (chats) {
      const total = chats.reduce(
        (sum, chat) => sum + (chat.unread_count || 0),
        0
      );
      setUnreadCount(total);
    }
  }, [chats]);

  if (hideNavOnPages.includes(pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-around p-3 border-t border-gray-300 z-50">
      <button
        className={`flex flex-col items-center ${
          pathname === "/" ? "text-blue-500" : "text-gray-700"
        }`}
        onClick={() => router.push("/")}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs">Главная</span>
      </button>
      <button
        className={`flex flex-col items-center ${
          pathname === "/favorites" ? "text-blue-500" : "text-gray-700"
        }`}
        onClick={() => router.push("/favorites")}
      >
        <Heart className="w-6 h-6" />
        <span className="text-xs">Избранное</span>
      </button>
      <button
        className={`flex flex-col items-center ${
          pathname === "/listings" ? "text-blue-500" : "text-gray-700"
        }`}
        onClick={() => router.push("/listings")}
      >
        <ClipboardList className="w-6 h-6" />
        <span className="text-xs">Объявления</span>
      </button>
      <button
        className={`flex flex-col items-center ${
          pathname === "/trades" ? "text-blue-500" : "text-gray-700"
        }`}
        onClick={() => router.push("/trades")}
      >
        <ArrowRightLeft className="w-6 h-6" />
        <span className="text-xs">Обмены</span>
      </button>
      <button
        className={`flex flex-col items-center relative ${
          pathname.startsWith("/chat") || pathname === "/chats"
            ? "text-blue-500"
            : "text-gray-700"
        }`}
        onClick={() => router.push("/chats")}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="text-xs">Чаты</span>
      </button>
      <button
        className={`flex flex-col items-center ${
          pathname === "/profile" ? "text-blue-500" : "text-gray-700"
        }`}
        onClick={() => router.push("/profile")}
      >
        <User className="w-6 h-6" />
        <span className="text-xs">Профиль</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
