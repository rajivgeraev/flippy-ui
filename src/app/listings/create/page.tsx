"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Upload, X, Plus, CheckCircle } from "lucide-react";

const MAX_IMAGES = 10;

export default function CreateListingPage() {
  const { categories, loading, error } = useCategories();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [allowTrade, setAllowTrade] = useState(true);
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileArray = Array.from(event.target.files);
      if (images.length + fileArray.length > MAX_IMAGES) {
        alert("Максимальное количество изображений: 10");
        return;
      }
      setImages([...images, ...fileArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", selectedCategory);
    formData.append("condition", condition);
    formData.append("allowTrade", allowTrade.toString());
    images.forEach((file, index) => formData.append(`images[${index}]`, file));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/create`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      alert("Ошибка при создании объявления");
      return;
    }

    alert("Объявление создано!");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Создать объявление</h1>

      {/* Название */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Название
      </label>
      <input
        className="w-full border rounded-lg p-2 mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Описание */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Описание
      </label>
      <textarea
        className="w-full border rounded-lg p-2 mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

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
          className="w-full border rounded-lg p-2 mb-4"
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

      {/* Состояние игрушки */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Состояние
      </label>
      <select
        className="w-full border rounded-lg p-2 mb-4"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
      >
        <option value="new">Новое</option>
        <option value="used">Б/у</option>
        <option value="damaged">Поврежденное</option>
      </select>

      {/* Возможен обмен */}
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={allowTrade}
          onChange={(e) => setAllowTrade(e.target.checked)}
        />
        Возможен обмен
      </label>

      {/* Загрузка изображений */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Фотографии
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((file, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(file)}
              className="w-16 h-16 object-cover rounded-lg"
              alt="preview"
            />
            <button
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              onClick={() => removeImage(index)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="w-16 h-16 flex items-center justify-center border rounded-lg cursor-pointer">
            <Plus size={20} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>

      {/* Кнопка отправки */}
      <button
        className="w-full bg-blue-500 text-white rounded-lg p-2 mt-4"
        onClick={handleSubmit}
      >
        Опубликовать
      </button>
    </div>
  );
}
