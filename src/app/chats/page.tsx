"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistance } from "date-fns";
import { ru } from "date-fns/locale";
import { formatRelativeTime } from "@/utils/dateUtils";

export default function ChatsPage() {
  const router = useRouter();
  const { chats, loading, error } = useChats();
  const {
    isAuthenticated,
    isLoading: authLoading,
    userDetails,
  } = useAuthContext();

  // Форматирование даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return formatRelativeTime(dateString);
  };

  // Получение другого участника чата (не текущего пользователя)
  const getOtherUser = (chat: any) => {
    if (!userDetails) return null;

    if (chat.sender_id === userDetails.id) {
      return chat.receiver;
    } else {
      return chat.sender;
    }
  };

  // Если не авторизован, показываем сообщение
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg shadow m-4">
        <AlertCircle className="w-5 h-5 inline-block mr-2" />
        Для доступа к чатам необходимо авторизоваться
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Чаты
      </h1>

      {/* Обработка ошибок */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Список чатов */}
      {!loading && chats.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          У вас пока нет активных чатов
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {chats.map((chat) => {
            const otherUser = getOtherUser(chat);

            return (
              <button
                key={chat.id}
                className="p-4 bg-white shadow-md rounded-lg flex items-start gap-3 border text-left"
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                {/* Аватар */}
                <div className="relative">
                  <img
                    src={
                      otherUser?.avatar_url || "https://via.placeholder.com/40"
                    }
                    alt={otherUser?.first_name || "Пользователь"}
                    className="w-12 h-12 rounded-full"
                  />
                  {chat.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread_count}
                    </div>
                  )}
                </div>

                {/* Информация о чате */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {otherUser?.first_name || "Пользователь"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(chat.last_message_time || chat.created_at)}
                    </p>
                  </div>

                  {/* Последнее сообщение */}
                  {chat.last_message_text ? (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {chat.last_message_text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Нет сообщений
                    </p>
                  )}

                  {/* Информация об обмене, если есть */}
                  {chat.trade && (
                    <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full inline-block">
                      Обмен:{" "}
                      {chat.trade.status === "accepted"
                        ? "Принят"
                        : chat.trade.status}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
