"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import ProtectedComponent from "@/components/ProtectedComponent";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, isLoading, error, retry } = useAuthContext();

  // Автоматическая попытка повторной аутентификации при ошибке
  useEffect(() => {
    if (!isAuthenticated && !isLoading && error) {
      // Повторная попытка будет выполнена автоматически через хук useAuth
    }
  }, [isAuthenticated, isLoading, error]);

  return (
    <div className="pb-16">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 p-4">
        <User className="w-6 h-6" />
        Мой профиль
      </h1>

      {error && (
        <div className="m-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p>Ошибка аутентификации. Пробуем подключиться снова...</p>
          <p className="text-sm mt-2 text-gray-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ProtectedComponent />
      )}
    </div>
  );
}
