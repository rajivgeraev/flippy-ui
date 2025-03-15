"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistance } from "date-fns";
import { ru } from "date-fns/locale";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatIdRaw = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!chatIdRaw) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <AlertCircle className="w-5 h-5 inline-block mr-2" />
        Ошибка: ID чата не найден
      </div>
    );
  }

  const chatId: string = chatIdRaw;
  const {
    isAuthenticated,
    isLoading: authLoading,
    userDetails,
  } = useAuthContext();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, error, initialized, sendMessage } =
    useChatMessages(chatId);

  useEffect(() => {
    if (messagesEndRef.current && messages?.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      alert("Не удалось отправить сообщение. Попробуйте еще раз.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), {
        addSuffix: true,
        locale: ru,
      });
    } catch {
      return "недавно";
    }
  };

  const isOwnMessage = (senderId: string) =>
    userDetails && userDetails.id === senderId;

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg shadow m-4">
        <AlertCircle className="w-5 h-5 inline-block mr-2" />
        Для доступа к чату необходимо авторизоваться
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Инициализация чата...</p>
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
        <Link href="/chats" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Вернуться к чатам
        </Link>
      </div>
    );
  }

  const otherUserInfo =
    messages?.find((msg) => !isOwnMessage(msg.sender_id))?.sender || null;

  return (
    <div className="flex flex-col h-screen">
      {/* Фиксированная верхняя панель */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4 border-b flex items-center gap-3 bg-white shadow-md">
        <Link href="/chats">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
        </Link>
        <img
          src={otherUserInfo?.avatar_url || "https://via.placeholder.com/40"}
          alt={otherUserInfo?.first_name || "Пользователь"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="text-lg font-semibold">
            {otherUserInfo?.first_name || "Пользователь"}
          </p>
          {otherUserInfo?.username && (
            <p className="text-xs text-gray-500">@{otherUserInfo.username}</p>
          )}
        </div>
      </div>

      <div className="flex-1 pt-[88px] pb-[124px] px-4 overflow-y-auto flex flex-col-reverse">
        <div ref={messagesEndRef}></div>
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-500 my-10">
            Начните общение, отправив сообщение
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 ${isOwnMessage(msg.sender_id) ? "ml-auto" : ""}`}
            >
              <div
                className={`p-3 rounded-lg ${
                  isOwnMessage(msg.sender_id)
                    ? "bg-blue-500 text-white ml-auto max-w-[75%]"
                    : "bg-gray-200 text-black max-w-[75%]"
                }`}
              >
                {msg.text}
              </div>
              <div
                className={`text-xs text-gray-500 mt-1 ${
                  isOwnMessage(msg.sender_id) ? "text-right" : ""
                }`}
              >
                {formatDate(msg.created_at)}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          className="flex-1 p-2 border rounded-lg"
          disabled={sending}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
