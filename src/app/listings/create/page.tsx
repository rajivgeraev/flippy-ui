// src/app/listings/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListingService } from "@/services/listingService";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ListingForm from "@/components/ListingForm";

export default function CreateListingPage() {
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (formData: any) => {
    setFormSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await ListingService.createListing(formData);

      if (response.success) {
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
          : "Произошла ошибка при создании объявления"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/listings" className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Создать объявление</h1>
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
            Объявление успешно создано! Переадресация на страницу объявлений...
          </p>
        </div>
      )}

      <ListingForm
        onSubmit={handleSubmit}
        isSubmitting={formSubmitting}
        isEdit={false}
      />
    </div>
  );
}
