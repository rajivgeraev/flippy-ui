"use client";

import { useState } from "react";
import { TradeService } from "@/services/tradeService";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToys: { id: number | string; name: string; image: string }[];
  receiverListingId: string;
  onSubmit?: (
    selectedToyId: number | string | null,
    requestSale: boolean
  ) => void;
  allowSale?: boolean;
}

export default function TradeModal({
  isOpen,
  onClose,
  userToys,
  receiverListingId,
  onSubmit,
  allowSale = false,
}: TradeModalProps) {
  const [selectedToy, setSelectedToy] = useState<string | number | null>(null);
  const [requestSale, setRequestSale] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Проверяем авторизацию
    if (!isAuthenticated) {
      setError("Для предложения обмена необходимо авторизоваться");
      return;
    }

    // Проверяем, что выбрана игрушка или запрошена продажа
    if (!selectedToy && !requestSale) {
      setError("Выберите игрушку для обмена или запросите продажу");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Если используем старый callback
      if (onSubmit) {
        onSubmit(selectedToy, requestSale);
        return;
      }

      // Иначе делаем API запрос
      if (selectedToy) {
        const response = await TradeService.createTrade({
          sender_listing_id: selectedToy.toString(),
          receiver_listing_id: receiverListingId,
          message: message,
        });

        setSuccess(
          response.message || "Предложение обмена успешно отправлено!"
        );

        // Закрываем окно после короткой задержки
        setTimeout(() => {
          onClose();
          router.push("/trades");
        }, 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при отправке предложения обмена"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Предложить обмен</h2>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Сообщение об успехе */}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

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
                    className="w-full h-16 object-cover rounded-md"
                  />
                  <span className="text-xs mt-2">{toy.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500 mb-4">
            У вас нет игрушек для обмена. Добавьте новую!
          </p>
        )}

        {/* Добавить игрушку */}
        <button
          className="w-full p-3 border border-dashed rounded-lg text-gray-600 hover:bg-gray-100 mt-2"
          onClick={() => router.push("/listings/create")}
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

        {/* Сообщение для получателя */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сообщение (необязательно)
          </label>
          <textarea
            className="w-full border rounded-lg p-2 mb-4 h-20 resize-none"
            placeholder="Напишите сообщение получателю..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={(!selectedToy && !requestSale) || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
              </>
            ) : (
              "Отправить запрос"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
