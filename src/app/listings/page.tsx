// src/app/listings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMyListings } from "@/hooks/useListings";
import { ListingService } from "@/services/listingService";

export default function UserListings() {
  const router = useRouter();

  const {
    listings,
    loading,
    error,
    status,
    changeStatus,
    loadMore,
    hasMore,
    refreshListings,
  } = useMyListings();

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const handleStatusChange = (newStatus: string) => {
    changeStatus(newStatus);
  };

  const handleDeleteClick = (id: string) => {
    setListingToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!listingToDelete) return;

    setDeleteLoading(listingToDelete);
    try {
      await ListingService.deleteListing(listingToDelete);
      setShowConfirmModal(false);
      refreshListings();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    } finally {
      setDeleteLoading(null);
      setListingToDelete(null);
    }
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" />
        Мои объявления
      </h1>

      {/* Фильтр по статусу */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${
            status === "all"
              ? "border-b-2 border-blue-500 text-blue-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => handleStatusChange("all")}
        >
          Все
        </button>
        <button
          className={`px-4 py-2 ${
            status === "active"
              ? "border-b-2 border-blue-500 text-blue-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => handleStatusChange("active")}
        >
          Активные
        </button>
        <button
          className={`px-4 py-2 ${
            status === "draft"
              ? "border-b-2 border-blue-500 text-blue-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => handleStatusChange("draft")}
        >
          Черновики
        </button>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (!listings || listings.length === 0) && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Список объявлений */}
      <div className="flex flex-col gap-4">
        {!loading && listings && listings.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            У вас пока нет объявлений. Создайте новое!
          </p>
        ) : listings && listings.length > 0 ? (
          listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-4 p-4 bg-white shadow rounded-lg"
            >
              <img
                src={
                  listing.images && listing.images.length > 0
                    ? listing.images[0].url
                    : "https://via.placeholder.com/150"
                }
                alt={listing.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <p className="text-sm text-gray-500">
                  {listing.status === "active" ? "Активное" : "Черновик"} •{" "}
                  {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/listings/edit/${listing.id}`}
                className="p-2 text-gray-600 hover:text-blue-500"
              >
                <Pencil className="w-5 h-5" />
              </Link>
              <button
                className="p-2 text-gray-600 hover:text-red-500"
                onClick={() => handleDeleteClick(listing.id)}
                disabled={deleteLoading === listing.id}
              >
                {deleteLoading === listing.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash className="w-5 h-5" />
                )}
              </button>
            </div>
          ))
        ) : null}
      </div>

      {/* Кнопка "Загрузить еще" */}
      {hasMore && listings && listings.length > 0 && (
        <button
          className="w-full mt-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Загрузка...
            </span>
          ) : (
            "Загрузить еще"
          )}
        </button>
      )}

      {/* Кнопка "Добавить объявление" */}
      <Link href="/listings/create">
        <button className="fixed bottom-[72px] left-1/2 transform -translate-x-1/2 bg-blue-500 text-white rounded-full p-4 shadow-lg flex items-center gap-2 z-50">
          <Plus className="w-6 h-6" />
          Добавить
        </button>
      </Link>

      {/* Модальное окно подтверждения удаления */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4">Удалить объявление?</h3>
            <p className="mb-6 text-gray-600">
              Это действие нельзя будет отменить. Объявление будет удалено
              навсегда.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => setShowConfirmModal(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                onClick={confirmDelete}
                disabled={deleteLoading !== null}
              >
                {deleteLoading !== null ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Удаление...
                  </>
                ) : (
                  <>Удалить</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
