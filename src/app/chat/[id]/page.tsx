"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

// Временные данные чатов
const chats = [
  {
    id: 1,
    user: "Анна",
    userAvatar: "https://randomuser.me/api/portraits/women/45.jpg",
    messages: [
      { text: "Привет! Давай обсудим обмен.", sender: "system" },
      { text: "Привет! Где удобно встретиться?", sender: "Анна" },
      { text: "Как насчёт завтра в центре?", sender: "Вы" },
    ],
  },
];

export default function ChatPage() {
  const { id } = useParams(); // Получаем ID чата из URL
  const chat = chats.find((c) => c.id === Number(id));

  const [messages, setMessages] = useState(chat?.messages || []);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "Вы" }]);
      setNewMessage("");
    }
  };

  if (!chat) {
    return <p className="text-center text-gray-500">Чат не найден</p>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Заголовок */}
      <div className="p-4 border-b flex items-center gap-3 bg-white shadow-md">
        <Link href="/trades">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
        </Link>
        <img
          src={chat.userAvatar}
          alt={chat.user}
          className="w-10 h-10 rounded-full"
        />
        <p className="text-lg font-semibold">{chat.user}</p>
      </div>

      {/* Список сообщений */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg max-w-[75%] ${
              msg.sender === "Вы"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
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
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-lg"
          onClick={sendMessage}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
