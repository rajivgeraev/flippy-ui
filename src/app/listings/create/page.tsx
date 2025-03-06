"use client";

import { useState, useRef, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import {
  Upload,
  X,
  Plus,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

const MAX_IMAGES = 10;

export default function CreateListingPage() {
  const { categories, loading, error } = useCategories();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [condition, setCondition] = useState("new");
  const [allowTrade, setAllowTrade] = useState(true);
  const [images, setImages] = useState<File[]>([]);

  // Функция для закрытия дропдауна при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Функция для проверки, выбрана ли категория
  const isCategorySelected = (slug: string) =>
    selectedCategories.includes(slug);

  // Функция для переключения выбора категории
  const toggleCategory = (slug: string) => {
    if (isCategorySelected(slug)) {
      setSelectedCategories(selectedCategories.filter((s) => s !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  // Удаление категории из выбранных
  const removeCategory = (slug: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Предотвращаем срабатывание родительского onClick
    }
    setSelectedCategories(selectedCategories.filter((s) => s !== slug));
  };

  const handleSubmit = async () => {
    // Валидация формы
    if (!title.trim()) {
      alert("Пожалуйста, укажите название");
      return;
    }

    if (!description.trim()) {
      alert("Пожалуйста, добавьте описание");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Пожалуйста, выберите хотя бы одну категорию");
      return;
    }

    if (images.length === 0) {
      alert("Пожалуйста, добавьте хотя бы одно изображение");
      return;
    }

    // Формирование данных и отправка
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("categories", JSON.stringify(selectedCategories));
    formData.append("condition", condition);
    formData.append("allowTrade", allowTrade.toString());
    images.forEach((file, index) => formData.append(`images[${index}]`, file));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при создании объявления");
      }

      alert("Объявление успешно создано!");
      // Можно добавить редирект на страницу объявлений
    } catch (error) {
      alert(
        `Ошибка: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    }
  };

  // Фильтрованные категории
  const filteredCategories = categories.filter(
    (category) =>
      category.name_ru.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      category.name_en.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  // Получаем выбранные категории как объекты
  const selectedCategoryObjects = selectedCategories
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);

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
        placeholder="Введите название игрушки"
      />

      {/* Описание */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Описание
      </label>
      <textarea
        className="w-full border rounded-lg p-2 mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Опишите игрушку, её особенности и состояние"
      />

      {/* Категории - мультиселект с интегрированными тегами */}
      <div className="mb-4 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категории
        </label>

        {/* Селектор с интегрированными тегами */}
        <div
          className="w-full min-h-10 border rounded-lg bg-white cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex flex-wrap items-center p-1 gap-1">
            {selectedCategoryObjects.length > 0 ? (
              selectedCategoryObjects.map(
                (category) =>
                  category && (
                    <span
                      key={category.slug}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 m-1 rounded-full flex items-center"
                      onClick={(e) => e.stopPropagation()} // Предотвращаем открытие/закрытие дропдауна при клике на тег
                    >
                      {category.name_ru}
                      <button
                        onClick={(e) => removeCategory(category.slug, e)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  )
              )
            ) : (
              <span className="p-2 text-gray-500">Выберите категории</span>
            )}

            {/* Показываем либо подсказку, либо стрелку в зависимости от наличия выбранных категорий */}
            <div className="ml-auto p-2">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Выпадающий список категорий */}
        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Поиск категорий */}
            <div className="p-2 border-b sticky top-0 bg-white">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск категории..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded-lg p-2 pl-8"
                  onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие дропдауна при клике на поле поиска
                />
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Список категорий */}
            {loading ? (
              <p className="p-3 text-center text-gray-500">
                Загрузка категорий...
              </p>
            ) : error ? (
              <p className="p-3 text-center text-red-500">{error}</p>
            ) : filteredCategories.length > 0 ? (
              <ul className="py-1">
                {filteredCategories.map((category) => (
                  <li key={category.slug}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем закрытие дропдауна
                        toggleCategory(category.slug);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 ${
                        isCategorySelected(category.slug) ? "bg-blue-50" : ""
                      }`}
                    >
                      <div
                        className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                          isCategorySelected(category.slug)
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isCategorySelected(category.slug) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span>{category.name_ru}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-center text-gray-500">Ничего не найдено</p>
            )}
          </div>
        )}
      </div>

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
          className="h-4 w-4 text-blue-600"
        />
        <span>Возможен обмен</span>
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
              className="w-20 h-20 object-cover rounded-lg"
              alt="preview"
            />
            <button
              type="button"
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              onClick={() => removeImage(index)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="w-20 h-20 flex items-center justify-center border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <Plus size={24} className="text-gray-400" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 mb-4">
        Максимум {MAX_IMAGES} изображений
      </p>

      {/* Кнопка отправки */}
      <button
        className="w-full bg-blue-500 text-white rounded-lg p-3 font-medium hover:bg-blue-600 transition-colors"
        onClick={handleSubmit}
      >
        Опубликовать объявление
      </button>
    </div>
  );
}
