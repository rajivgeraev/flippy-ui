"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Inbox,
  Send,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useTrades } from "@/hooks/useTrades";
import { TradeStatusLabels, TradeStatusColors } from "@/types/trades";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistance } from "date-fns";
import { ru } from "date-fns/locale";

// Типы вкладок
type TabType = "incoming" | "outgoing" | "chats";

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("incoming");
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  // Используем хук для работы с обменами
  const {
    trades,
    loading,
    error,
    updateTradeStatus,
    filterByType,
    refreshTrades,
  } = useTrades(activeTab === "chats" ? "all" : activeTab);

  // Обработчик смены вкладки
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== "chats") {
      filterByType(tab);
    }
  };

  // Обработчик принятия обмена
  const handleAccept = async (id: string) => {
    try {
      await updateTradeStatus(id, "accepted");
      refreshTrades();
    } catch (error) {
      console.error("Ошибка при принятии обмена:", error);
    }
  };

  // Обработчик отклонения обмена
  const handleReject = async (id: string) => {
    try {
      await updateTradeStatus(id, "rejected");
      refreshTrades();
    } catch (error) {
      console.error("Ошибка при отклонении обмена:", error);
    }
  };

  // Обработчик отмены обмена
  const handleCancel = async (id: string) => {
    try {
      await updateTradeStatus(id, "canceled");
      refreshTrades();
    } catch (error) {
      console.error("Ошибка при отмене обмена:", error);
    }
  };

  // Определяем список предложений в зависимости от активной вкладки
  // Добавляем защиту от null/undefined
  const getFilteredTrades = () => {
    if (!trades) return [];

    if (activeTab === "chats") {
      return trades.filter((trade) => trade.status === "accepted");
    }
    return trades;
  };

  const filteredTrades = getFilteredTrades();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), {
        addSuffix: true,
        locale: ru,
      });
    } catch (error) {
      return "неизвестная дата";
    }
  };

  // Проверка прав на действия с обменом
  const canAcceptOrReject = (trade: any) => {
    if (!isAuthenticated || !trade) return false;
    // Только получатель может принять/отклонить
    return trade.status === "pending";
  };

  const canCancel = (trade: any) => {
    if (!isAuthenticated || !trade) return false;
    // Только отправитель может отменить
    return trade.status === "pending";
  };

  // Если пользователь не авторизован, показываем сообщение
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg shadow m-4">
        <AlertCircle className="w-5 h-5 inline-block mr-2" />
        Для просмотра обменов необходимо авторизоваться
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ArrowRightLeft className="w-6 h-6" />
        Обмены
      </h1>

      {/* Обработка ошибок */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}

      {/* Таб-переключатель */}
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 text-center p-2 flex items-center justify-center gap-2 ${
            activeTab === "incoming"
              ? "border-b-2 border-blue-500 font-bold"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("incoming")}
        >
          <Inbox className="w-5 h-5" /> Входящие
        </button>
        <button
          className={`flex-1 text-center p-2 flex items-center justify-center gap-2 ${
            activeTab === "outgoing"
              ? "border-b-2 border-blue-500 font-bold"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("outgoing")}
        >
          <Send className="w-5 h-5" /> Исходящие
        </button>
        <button
          className={`flex-1 text-center p-2 flex items-center justify-center gap-2 ${
            activeTab === "chats"
              ? "border-b-2 border-blue-500 font-bold"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("chats")}
        >
          <MessageCircle className="w-5 h-5" /> Чаты
        </button>
      </div>

      {/* Индикатор загрузки */}
      {loading && (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Список предложений обмена */}
      {!loading && (!filteredTrades || filteredTrades.length === 0) ? (
        <div className="text-center py-10 text-gray-500">
          {activeTab === "incoming" && "У вас нет входящих предложений обмена"}
          {activeTab === "outgoing" &&
            "Вы не отправили ни одного предложения обмена"}
          {activeTab === "chats" && "У вас пока нет активных чатов"}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTrades &&
            filteredTrades.map((trade) => {
              // Безопасно получаем информацию о пользователях
              const senderAvatar =
                trade.sender?.avatar_url || "https://via.placeholder.com/40";
              const senderName = trade.sender?.first_name || "Пользователь";
              const receiverAvatar =
                trade.receiver?.avatar_url || "https://via.placeholder.com/40";
              const receiverName = trade.receiver?.first_name || "Пользователь";

              // Второй участник чата (не текущий пользователь)
              const chatParticipantAvatar =
                activeTab === "incoming" ? senderAvatar : receiverAvatar;
              const chatParticipantName =
                activeTab === "incoming" ? senderName : receiverName;

              return (
                <div
                  key={trade.id}
                  className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-3 border"
                >
                  {/* Информация об отправителе/получателе */}
                  <div className="flex items-center gap-3 border-b pb-2">
                    {activeTab === "incoming" && (
                      <>
                        <img
                          src={senderAvatar}
                          alt={senderName}
                          className="w-10 h-10 rounded-full"
                        />
                        <p className="text-sm font-medium">
                          {senderName} предлагает обмен
                        </p>
                      </>
                    )}

                    {activeTab === "outgoing" && (
                      <>
                        <img
                          src={receiverAvatar}
                          alt={receiverName}
                          className="w-10 h-10 rounded-full"
                        />
                        <p className="text-sm font-medium">
                          Вы предложили обмен {receiverName}
                        </p>
                      </>
                    )}

                    {activeTab === "chats" && (
                      <>
                        <img
                          src={chatParticipantAvatar}
                          alt={chatParticipantName}
                          className="w-10 h-10 rounded-full"
                        />
                        <p className="text-sm font-medium">
                          Чат с {chatParticipantName}
                        </p>
                      </>
                    )}

                    {/* Статус и время создания */}
                    <div className="ml-auto text-right">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          TradeStatusColors[trade.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {TradeStatusLabels[trade.status] || "Неизвестно"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(trade.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Блок обмена */}
                  <div className="flex justify-between items-center">
                    {/* Игрушка отправителя */}
                    <div className="flex flex-col items-center w-1/2">
                      <p className="text-xs text-gray-500">
                        {activeTab === "incoming"
                          ? "Вы получаете"
                          : "Вы предлагаете"}
                      </p>
                      {trade.sender_listing && (
                        <>
                          <img
                            src={
                              trade.sender_listing.images &&
                              trade.sender_listing.images.length > 0
                                ? trade.sender_listing.images[0].url
                                : "https://via.placeholder.com/150?text=Нет+изображения"
                            }
                            alt={trade.sender_listing.title}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                          <p className="text-sm mt-1 text-center">
                            {trade.sender_listing.title}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Иконка стрелки */}
                    <div className="text-gray-400">➝</div>

                    {/* Игрушка получателя */}
                    <div className="flex flex-col items-center w-1/2">
                      <p className="text-xs text-gray-500">
                        {activeTab === "incoming"
                          ? "Вы отдаете"
                          : "Вы хотите получить"}
                      </p>
                      {trade.receiver_listing && (
                        <>
                          <img
                            src={
                              trade.receiver_listing.images &&
                              trade.receiver_listing.images.length > 0
                                ? trade.receiver_listing.images[0].url
                                : "https://via.placeholder.com/150?text=Нет+изображения"
                            }
                            alt={trade.receiver_listing.title}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                          <p className="text-sm mt-1 text-center">
                            {trade.receiver_listing.title}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Сообщение (если есть) */}
                  {trade.message && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                      <p className="text-sm text-gray-700">{trade.message}</p>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  {activeTab === "incoming" && canAcceptOrReject(trade) && (
                    <div className="flex justify-between mt-2">
                      <button
                        className="flex-1 mx-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
                        onClick={() => handleAccept(trade.id)}
                      >
                        ✅ Принять
                      </button>
                      <button
                        className="flex-1 mx-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                        onClick={() => handleReject(trade.id)}
                      >
                        ❌ Отклонить
                      </button>
                    </div>
                  )}

                  {activeTab === "outgoing" && canCancel(trade) && (
                    <button
                      className="w-full py-2 bg-gray-500 text-white rounded-lg text-sm font-medium mt-2"
                      onClick={() => handleCancel(trade.id)}
                    >
                      🚫 Отменить предложение
                    </button>
                  )}

                  {/* Кнопка перехода в чат */}
                  {activeTab === "chats" && trade.status === "accepted" && (
                    <Link href={`/chat/${trade.id}`} className="w-full">
                      <button className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium mt-2">
                        💬 Открыть чат
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
