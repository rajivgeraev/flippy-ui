"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";

export default function CreateListingPage() {
  const { categories, loading, error } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Создать объявление</h1>

      {/* Категории */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Категория
      </label>
      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <select
          className="w-full border rounded-lg p-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="" disabled>
            Выберите категорию
          </option>
          {categories &&
            categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name_ru}
              </option>
            ))}
        </select>
      )}
    </div>
  );
}
