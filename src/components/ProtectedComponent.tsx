import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { AuthService } from "@/services/auth";

export default function ProtectedComponent() {
  const { isAuthenticated, isLoading, userDetails } = useAuthContext();
  const [protectedData, setProtectedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProtectedLoading, setIsProtectedLoading] = useState(false);

  useEffect(() => {
    // Функция для получения защищенных данных
    const fetchProtectedData = async () => {
      if (!isAuthenticated) return;

      setIsProtectedLoading(true);
      try {
        // Отправляем запрос на защищенный endpoint
        const response = await AuthService.fetchWithAuth("/api/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch protected data");
        }

        const data = await response.json();
        setProtectedData(data.message || JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching protected data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsProtectedLoading(false);
      }
    };

    fetchProtectedData();
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        Пожалуйста, авторизуйтесь в приложении
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Информация о профиле</h2>

      {userDetails && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold">Пользователь</h3>
          <p>ID: {userDetails.id}</p>
          <p>
            Имя: {userDetails.first_name} {userDetails.last_name}
          </p>
          <p>Имя пользователя: {userDetails.username}</p>
          {userDetails.avatar_url && (
            <img
              src={userDetails.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full mt-2"
            />
          )}
        </div>
      )}

      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold">Защищенные данные</h3>
        {isProtectedLoading ? (
          <p>Загрузка данных...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>{protectedData || "Нет данных"}</p>
        )}
      </div>
    </div>
  );
}
