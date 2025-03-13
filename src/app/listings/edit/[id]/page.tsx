// src/app/listings/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useListing } from "@/hooks/useListings";
import { useCategories } from "@/hooks/useCategories";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useFilePreview } from "@/hooks/useFilePreview";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import ListingForm from "@/components/ListingForm";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const {
    listing,
    loading: listingLoading,
    error: listingError,
    updateListing,
  } = useListing(id);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Обработчик отправки формы
  const handleSubmit = async (formData: any) => {
    setFormSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const success = await updateListing(formData);

      if (success) {
        setSubmitSuccess(true);
        // Показываем сообщение об успехе на 2 секунды, затем возвращаемся к списку
        setTimeout(() => {
          router.push("/listings");
        }, 2000);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при обновлении объявления"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  if (listingLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Загрузка объявления...</p>
      </div>
    );
  }

  if (listingError) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{listingError}</p>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/listings"
            className="text-blue-500 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Вернуться к списку объявлений
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
          <p>Объявление не найдено</p>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/listings"
            className="text-blue-500 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Вернуться к списку объявлений
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/listings" className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Редактирование объявления</h1>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-4 bg-green-100 text-green-700 p-3 rounded-lg">
          <p>
            Объявление успешно обновлено! Переадресация на страницу
            объявлений...
          </p>
        </div>
      )}

      <ListingForm
        initialData={listing}
        onSubmit={handleSubmit}
        isSubmitting={formSubmitting}
        isEdit={true}
      />
    </div>
  );
}
