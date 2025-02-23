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

const BottomNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Список страниц, где скрывать навигацию (если надо)
  const hideNavOnPages = ["/login", "/signup"];

  if (hideNavOnPages.includes(pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-around p-3 border-t border-gray-300">
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
          pathname === "/ads" ? "text-blue-500" : "text-gray-700"
        }`}
        onClick={() => router.push("/ads")}
      >
        <ClipboardList className="w-6 h-6" />
        <span className="text-xs">Объявления</span>
      </button>
      <button
        className="flex flex-col items-center text-gray-700"
        onClick={() => (window.location.href = "/trades")}
      >
        <ArrowRightLeft className="w-6 h-6" />
        <span className="text-xs">Обмены</span>
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
