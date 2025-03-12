"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTrades } from "@/hooks/useTrades";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Получаем данные обмена для отображения чата
  const { trades, loading, error } = useTrades();
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState<{
    otherUser: { name: string; avatar: string };
    tradeItems: { sender: string; receiver: string };
  } | null>(null);

  // При загрузке данных обмена, находим нужный по ID
  useEffect(() => {
    if (!loading && trades.length > 0) {
      const trade = trades.find((t) => t.id === tradeId);

      if (trade) {
        // Инициализируем сообщения для чата
        setMessages([
          {
            text: "Здравствуйте! Давайте обсудим детали обмена.",
            sender: "system",
          },
        ]);

        // Определяем данные второго участника чата и игрушки
        const sender = trade.sender || {
          first_name: "Пользователь",
          avatar_url: "",
        };
        const receiver = trade.receiver || {
          first_name: "Пользователь",
          avatar_url: "",
        };

        const senderItem = trade.sender_listing?.title || "Игрушка";
        const receiverItem = trade.receiver_listing?.title || "Игрушка";

        setChatInfo({
          otherUser: {
            name: sender ? sender.first_name || "Пользователь" : "Пользователь",
            avatar: sender
              ? sender.avatar_url || "https://via.placeholder.com/40"
              : "https://via.placeholder.com/40",
          },
          tradeItems: {
            sender: senderItem,
            receiver: receiverItem,
          },
        });
      } else {
        // Если обмен не найден, перенаправляем на страницу обменов
        router.push("/trades");
      }
    }
  }, [trades, loading, tradeId, router]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "Вы" }]);
      setNewMessage("");

      // Имитация ответа через 1-2 секунды (будет заменено на реальный API)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Спасибо за сообщение! Я скоро отвечу.",
            sender: chatInfo?.otherUser.name || "Пользователь",
          },
        ]);
      }, 1000 + Math.random() * 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Загрузка чата...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
        <Link href="/trades" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Вернуться к обменам
        </Link>
      </div>
    );
  }

  if (!chatInfo) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">Чат не найден</p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/trades"
            className="text-blue-500 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Вернуться к обменам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Заголовок */}
      <div className="p-4 border-b flex items-center gap-3 bg-white shadow-md">
        <Link href="/trades">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
        </Link>
        <img
          src={chatInfo.otherUser.avatar}
          alt={chatInfo.otherUser.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="text-lg font-semibold">{chatInfo.otherUser.name}</p>
          <p className="text-xs text-gray-500">
            Обмен: {chatInfo.tradeItems.sender} ↔ {chatInfo.tradeItems.receiver}
          </p>
        </div>
      </div>

      {/* Список сообщений */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg max-w-[75%] ${
              msg.sender === "Вы"
                ? "bg-blue-500 text-white ml-auto"
                : msg.sender === "system"
                ? "bg-gray-100 text-gray-800 mx-auto max-w-[90%] text-center"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.sender !== "Вы" && msg.sender !== "system" && (
              <div className="text-xs text-gray-500 mb-1">{msg.sender}</div>
            )}
            {msg.text}
          </div>
        ))}
      </div>

      {/* Форма ввода */}
      <div className="p-4 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Напишите сообщение..."
          className="flex-1 p-2 border rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
