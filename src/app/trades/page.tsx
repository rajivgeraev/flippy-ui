"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Inbox,
  Send,
  MessageCircle,
  Check,
  X,
} from "lucide-react";

const tabs = [
  { id: "incoming", name: "Входящие", icon: <Inbox className="w-5 h-5" /> },
  { id: "outgoing", name: "Исходящие", icon: <Send className="w-5 h-5" /> },
  { id: "chats", name: "Чаты", icon: <MessageCircle className="w-5 h-5" /> },
];

// Временные данные: входящие предложения
const incomingTrades = [
  {
    id: 1,
    sender: "Анна",
    senderAvatar: "https://randomuser.me/api/portraits/women/45.jpg",
    offeredToys: [
      {
        id: 101,
        name: "Машинка на радиоуправлении",
        image:
          "https://img.freepik.com/premium-photo/yellow-jeep-with-remote-control-toy-green-grass_1098051-728.jpg",
      },
    ],
    requestedToy: {
      id: 1,
      name: "Плюшевый мишка",
      image:
        "https://img.freepik.com/premium-photo/toys-kids-play-time-colorful-fun-composition_594847-3791.jpg",
    },
    status: "pending", // Возможные статусы: "pending", "accepted", "rejected"
  },
];

// Временные данные: исходящие предложения (что я предложил)
const outgoingTrades = [
  {
    id: 2,
    recipient: "Иван",
    recipientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    offeredToys: [
      {
        id: 201,
        name: "Настольная игра",
        image:
          "https://img.freepik.com/premium-photo/board-games-coins-bills-dice-cards_147448-171.jpg",
      },
    ],
    requestedToy: {
      id: 3,
      name: "Конструктор LEGO",
      image:
        "https://img.freepik.com/premium-photo/lego-star-wars-figures-are-standing-table-with-gun-generative-ai_958138-93159.jpg",
    },
    status: "pending", // Возможные статусы: "pending", "accepted", "rejected"
  },
];

// Временные данные: чаты
const initialChats: any[] | (() => any[]) = [];

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [trades, setTrades] = useState(incomingTrades);
  const [chats, setChats] = useState(initialChats);

  // Принятие обмена и создание чата
  const handleAccept = (id: number) => {
    setTrades((prev) =>
      prev.map((trade) =>
        trade.id === id ? { ...trade, status: "accepted" } : trade
      )
    );

    const trade = trades.find((t) => t.id === id);
    if (trade) {
      startChat(trade);
    }
  };

  const handleReject = (id: number) => {
    setTrades((prev) =>
      prev.map((trade) =>
        trade.id === id ? { ...trade, status: "rejected" } : trade
      )
    );
  };

  // Создание чата после принятия обмена
  const startChat = (trade: { id: number; sender: string; senderAvatar: string }) => {
    setChats((prev) => [
      ...prev,
      {
        id: trade.id,
        user: trade.sender,
        userAvatar: trade.senderAvatar,
        messages: [{ text: "Привет! Давай обсудим обмен.", sender: "system" }],
      },
    ]);
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ArrowRightLeft className="w-6 h-6" />
        Обмены
      </h1>

      {/* Таб-переключатель */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 text-center p-2 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Входящие предложения */}
      {activeTab === "incoming" && (
        <div className="flex flex-col gap-4">
          {trades.length === 0 ? (
            <p className="text-center text-gray-500">
              Нет входящих предложений
            </p>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-3 border"
              >
                {/* Информация об отправителе */}
                <div className="flex items-center gap-3 border-b pb-2">
                  <img
                    src={trade.senderAvatar}
                    alt={trade.sender}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="text-sm font-medium">
                    {trade.sender} предлагает обмен
                  </p>
                </div>

                {/* Блок обмена */}
                <div className="flex justify-between items-center">
                  {/* Вы отдаёте */}
                  <div className="flex flex-col items-center w-1/2">
                    <p className="text-xs text-gray-500">Вы отдаёте</p>
                    <img
                      src={trade.requestedToy.image}
                      alt={trade.requestedToy.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <p className="text-sm mt-1 text-center">
                      {trade.requestedToy.name}
                    </p>
                  </div>

                  {/* Иконка стрелки */}
                  <div className="text-gray-400">➝</div>

                  {/* Вы получаете */}
                  <div className="flex flex-col items-center w-1/2">
                    <p className="text-xs text-gray-500">Вы получаете</p>
                    <img
                      src={trade.offeredToys[0].image}
                      alt={trade.offeredToys[0].name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <p className="text-sm mt-1 text-center">
                      {trade.offeredToys[0].name}
                    </p>
                  </div>
                </div>

                {/* Кнопки действий */}
                {trade.status === "pending" ? (
                  <div className="flex justify-between">
                    <button
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg flex-1 mx-2"
                      onClick={() => handleAccept(trade.id)}
                    >
                      ✅ Принять
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg flex-1 mx-2"
                      onClick={() => handleReject(trade.id)}
                    >
                      ❌ Отклонить
                    </button>
                  </div>
                ) : trade.status === "accepted" ? (
                  <p className="text-green-600 font-medium text-center">
                    ✅ Обмен принят
                  </p>
                ) : (
                  <p className="text-red-600 font-medium text-center">
                    ❌ Обмен отклонён
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Исходящие предложения */}
      {activeTab === "outgoing" && (
        <div className="flex flex-col gap-4">
          {outgoingTrades.length === 0 ? (
            <p className="text-center text-gray-500">
              Вы ещё не отправили ни одного предложения
            </p>
          ) : (
            outgoingTrades.map((trade) => (
              <div
                key={trade.id}
                className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-3 border"
              >
                {/* Информация о получателе */}
                <div className="flex items-center gap-3 border-b pb-2">
                  <img
                    src={trade.recipientAvatar}
                    alt={trade.recipient}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="text-sm font-medium">
                    Вы предложили обмен {trade.recipient}
                  </p>
                </div>

                {/* Блок обмена */}
                <div className="flex justify-between items-center gap-4">
                  {/* Вы предложили */}
                  <div className="flex flex-col items-center w-1/2">
                    <p className="text-xs text-gray-500">Вы предложили</p>
                    <img
                      src={trade.offeredToys[0].image}
                      alt={trade.offeredToys[0].name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <p className="text-sm mt-1 text-center">
                      {trade.offeredToys[0].name}
                    </p>
                  </div>

                  {/* Иконка стрелки */}
                  <div className="text-gray-400">➝</div>

                  {/* Вы хотите получить */}
                  <div className="flex flex-col items-center w-1/2">
                    <p className="text-xs text-gray-500">Вы хотите получить</p>
                    <img
                      src={trade.requestedToy.image}
                      alt={trade.requestedToy.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <p className="text-sm mt-1 text-center">
                      {trade.requestedToy.name}
                    </p>
                  </div>
                </div>

                {/* Статус обмена */}
                {trade.status === "pending" ? (
                  <p className="text-yellow-500 font-medium text-center">
                    🟡 Ожидает ответа
                  </p>
                ) : trade.status === "accepted" ? (
                  <p className="text-green-600 font-medium text-center">
                    ✅ Обмен принят
                  </p>
                ) : (
                  <p className="text-red-600 font-medium text-center">
                    ❌ Обмен отклонён
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Чаты */}
      {activeTab === "chats" && (
        <div className="flex flex-col gap-4">
          {chats.length === 0 ? (
            <p className="text-center text-gray-500">
              У вас пока нет активных чатов
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 bg-white shadow-md rounded-lg flex items-center gap-3 border cursor-pointer"
                onClick={() => alert(`Открываем чат с ${chat.user}`)}
              >
                <img
                  src={chat.userAvatar}
                  alt={chat.user}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{chat.user}</p>
                  <p className="text-xs text-gray-500">
                    Нажмите, чтобы обсудить обмен
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
