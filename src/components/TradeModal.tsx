"use client";

import { useState } from "react";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToys: { id: number; name: string; image: string }[];
  onSubmit: (selectedToyId: number | null, requestSale: boolean) => void;
  allowSale?: boolean;
}

export default function TradeModal({
  isOpen,
  onClose,
  userToys,
  onSubmit,
  allowSale,
}: TradeModalProps) {
  const [selectedToy, setSelectedToy] = useState<number | null>(null);
  const [requestSale, setRequestSale] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Предложить обмен</h2>

        {/* Выбор игрушки */}
        {userToys.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600">
              Выберите игрушку для обмена:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {userToys.map((toy) => (
                <button
                  key={toy.id}
                  className={`p-2 border rounded-lg flex flex-col items-center ${
                    selectedToy === toy.id
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedToy(toy.id);
                    setRequestSale(false);
                  }}
                >
                  <img
                    src={toy.image}
                    alt={toy.name}
                    className="w-full h-16 rounded-md"
                  />
                  <span className="text-xs mt-2">{toy.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">
            У вас нет игрушек для обмена. Добавьте новую!
          </p>
        )}

        {/* Добавить игрушку */}
        <button
          className="w-full p-3 border border-dashed rounded-lg text-gray-600 hover:bg-gray-100 mt-2"
          onClick={() => alert("Переход на страницу добавления игрушки")}
        >
          ➕ Добавить игрушку
        </button>

        {/* Запросить продажу (если разрешено) */}
        {allowSale && (
          <button
            className={`w-full p-3 rounded-lg mt-2 ${
              requestSale
                ? "bg-green-500 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => {
              setRequestSale(!requestSale);
              setSelectedToy(null);
            }}
          >
            {requestSale
              ? "✔ Запрос на покупку выбран"
              : "💰 Запросить продажу"}
          </button>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            onClick={() => onSubmit(selectedToy, requestSale)}
            disabled={!selectedToy && !requestSale}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Отправить запрос
          </button>
        </div>
      </div>
    </div>
  );
}
