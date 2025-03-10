// src/components/ListingForm.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useFilePreview } from "@/hooks/useFilePreview";
import { Listing, UploadedImage } from "@/types/listings";
import {
  Upload,
  X,
  Plus,
  Check,
  ChevronDown,
  Search,
  Loader2,
  Save,
} from "lucide-react";

const MAX_IMAGES = 10;

interface ListingFormProps {
  initialData?: Listing | null;
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export default function ListingForm({
  initialData,
  onSubmit,
  isSubmitting,
  isEdit = false,
}: ListingFormProps) {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    uploadImages,
    uploading,
    progress,
    error: uploadError,
  } = useCloudinaryUpload();

  const { filePreviews, addFiles, removeFile, files, clearFiles } =
    useFilePreview();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories || []
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [condition, setCondition] = useState(initialData?.condition || "new");
  const [allowTrade, setAllowTrade] = useState(
    initialData?.allow_trade ?? true
  );
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadGroupId, setUploadGroupId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const conditionLabels: Record<string, string> = {
    new: "Новое",
    excellent: "Отличное",
    good: "Хорошее",
    used: "Б/у",
    needs_repair: "Требует ремонта",
    damaged: "Поврежденное",
  };

  // Инициализация изображений из initialData, если это режим редактирования
  useEffect(() => {
    if (
      isEdit &&
      initialData &&
      initialData.images &&
      initialData.images.length > 0
    ) {
      // Преобразуем изображения из API в формат, понятный форме
      const transformedImages: UploadedImage[] = initialData.images.map(
        (img, index) => ({
          url: img.url,
          preview_url: img.preview_url || img.url,
          public_id: img.public_id,
          file_name: img.file_name || `image_${index + 1}`,
          isMain: img.is_main,
          cloudinary_response: null, // Если необходимо, заполните с данными из API
        })
      );

      setUploadedImages(transformedImages);

      // Создаем превью для загруженных изображений
      transformedImages.forEach((img) => {
        // Не добавляем реальные файлы, только превью URL
        // Это именно то место, которое нужно доработать для редактирования
      });
    }
  }, [isEdit, initialData]);

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

  // Мемоизируем функцию обработки загрузки изображений
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const fileArray = Array.from(event.target.files);

        if (uploadedImages.length + fileArray.length > MAX_IMAGES) {
          alert(`Максимальное количество изображений: ${MAX_IMAGES}`);
          return;
        }

        // Добавляем файлы в хук предпросмотра
        addFiles(fileArray);

        try {
          // Загружаем изображения в Cloudinary
          const result = await uploadImages(fileArray);

          // Сохраняем идентификатор группы загрузки
          if (!uploadGroupId) {
            setUploadGroupId(result.upload_group_id);
          }

          // Добавляем загруженные изображения к существующим
          setUploadedImages((prev) => [...prev, ...result.images]);

          // Сбрасываем ошибки для изображений, если они были
          if (formErrors.images) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.images;
              return newErrors;
            });
          }
        } catch (err) {
          alert(
            `Ошибка при загрузке изображений: ${
              err instanceof Error ? err.message : "Неизвестная ошибка"
            }`
          );
        }
      }
    },
    [
      uploadedImages.length,
      addFiles,
      uploadImages,
      uploadGroupId,
      formErrors.images,
    ]
  );

  // Оптимизированная функция удаления изображения
  const handleRemoveImage = useCallback(
    (index: number) => {
      // Удаляем из предпросмотра
      removeFile(index);

      // Удаляем из загруженных изображений
      if (index < uploadedImages.length) {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [removeFile, uploadedImages.length]
  );

  // Функция для проверки, выбрана ли категория
  const isCategorySelected = useCallback(
    (slug: string) => selectedCategories.includes(slug),
    [selectedCategories]
  );

  // Функция для переключения выбора категории
  const toggleCategory = useCallback(
    (slug: string) => {
      setSelectedCategories((prev) => {
        const result = prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug];

        // Если добавили категорию, убираем ошибку
        if (result.length > 0 && formErrors.categories) {
          setFormErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.categories;
            return newErrors;
          });
        }

        return result;
      });
    },
    [formErrors.categories]
  );

  // Удаление категории из выбранных
  const removeCategory = useCallback((slug: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Предотвращаем срабатывание родительского onClick
    }
    setSelectedCategories((prev) => prev.filter((s) => s !== slug));
  }, []);

  // Валидация формы
  const validateForm = (isDraft = false) => {
    const errors: Record<string, string> = {};

    // Обязательные поля не нужны для черновика
    if (!isDraft) {
      if (!title.trim()) {
        errors.title = "Пожалуйста, укажите название";
      }

      // Описание теперь необязательное

      if (selectedCategories.length === 0) {
        errors.categories = "Пожалуйста, выберите хотя бы одну категорию";
      }

      if (uploadedImages.length === 0) {
        errors.images = "Пожалуйста, добавьте хотя бы одно изображение";
      }

      if (!uploadGroupId && !isEdit) {
        errors.uploadGroupId = "Ошибка идентификатора группы изображений";
      }
    } else {
      // Для черновика требуем только название
      if (!title.trim()) {
        errors.title = "Название обязательно даже для черновика";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (isDraft = false) => {
    if (!validateForm(isDraft)) {
      return;
    }

    // Устанавливаем соответствующий флаг создания
    if (isDraft) {
      setSavingDraft(true);
    }

    try {
      // Создаем объект данных для отправки
      const formData = {
        title,
        description,
        categories: selectedCategories,
        condition,
        allow_trade: allowTrade,
        upload_group_id: uploadGroupId || "", // В режиме редактирования может не быть нового uploadGroupId
        images: uploadedImages,
        status: isDraft ? "draft" : "active", // Отправляем статус объявления
      };

      // Вызываем функцию отправки
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = `Ошибка при ${
        isDraft
          ? "сохранении черновика"
          : (isEdit ? "обновлении" : "создания") + " объявления"
      }: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`;

      setFormErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    } finally {
      if (isDraft) {
        setSavingDraft(false);
      }
    }
  };

  // Мемоизируем фильтрованные категории
  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.name_ru
            .toLowerCase()
            .includes(categoryFilter.toLowerCase()) ||
          category.name_en.toLowerCase().includes(categoryFilter.toLowerCase())
      ),
    [categories, categoryFilter]
  );

  // Мемоизируем выбранные категории
  const selectedCategoryObjects = useMemo(
    () =>
      selectedCategories
        .map((slug) => categories.find((c) => c.slug === slug))
        .filter(Boolean),
    [selectedCategories, categories]
  );

  return (
    <div>
      {/* Сообщение об ошибке формы */}
      {formErrors.submit && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {formErrors.submit}
        </div>
      )}

      {/* Название */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Название <span className="text-red-500">*</span>
      </label>
      <input
        className={`w-full border rounded-lg p-2 mb-1 ${
          formErrors.title ? "border-red-500" : ""
        }`}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (e.target.value.trim() && formErrors.title) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.title;
              return newErrors;
            });
          }
        }}
        placeholder="Введите название игрушки"
      />
      {formErrors.title && (
        <p className="text-red-500 text-sm mb-4">{formErrors.title}</p>
      )}

      {/* Описание */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Описание
      </label>
      <textarea
        className="w-full border rounded-lg p-2 mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Опишите игрушку, её особенности и состояние (необязательно)"
      />

      {/* Категории - мультиселект с интегрированными тегами */}
      <div className="mb-4 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категории <span className="text-red-500">*</span>
        </label>

        {/* Селектор с интегрированными тегами */}
        <div
          className={`w-full min-h-10 border rounded-lg bg-white cursor-pointer ${
            formErrors.categories ? "border-red-500" : ""
          }`}
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
        {formErrors.categories && (
          <p className="text-red-500 text-sm mt-1">{formErrors.categories}</p>
        )}

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
            {categoriesLoading ? (
              <p className="p-3 text-center text-gray-500">
                Загрузка категорий...
              </p>
            ) : categoriesError ? (
              <p className="p-3 text-center text-red-500">{categoriesError}</p>
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
        className="w-full border rounded-lg p-2 mb-1"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
      >
        {Object.entries(conditionLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Индикатор выбранного состояния */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>Выбрано: </span>
        <span className="font-medium">{conditionLabels[condition]}</span>
      </div>

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
        Фотографии <span className="text-red-500">*</span>
      </label>

      {uploading && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg flex items-center">
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-500" />
          <span>Загрузка изображений... {progress}%</span>
        </div>
      )}

      {uploadError && (
        <div className="mb-4 bg-red-100 p-3 rounded-lg text-red-700">
          {uploadError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-1">
        {/* В режиме редактирования показываем уже загруженные изображения */}
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.preview_url || image.url}
              className="w-28 h-28 object-cover rounded-lg"
              alt={`preview-${index}`}
            />
            <button
              type="button"
              disabled={uploading || isSubmitting}
              className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full"
              onClick={() => handleRemoveImage(index)}
            >
              <X size={14} />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs p-1 text-center">
                Главное
              </div>
            )}
          </div>
        ))}

        {/* Плейсхолдер для файлового инпута */}
        {uploadedImages.length < MAX_IMAGES && (
          <label
            className={`w-28 h-28 flex items-center justify-center border border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
              uploading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            } ${formErrors.images ? "border-red-500" : "border-gray-300"}`}
          >
            <Plus
              size={24}
              className={`${
                formErrors.images ? "text-red-400" : "text-gray-400"
              }`}
            />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || isSubmitting}
              multiple
            />
          </label>
        )}
      </div>
      {formErrors.images && (
        <p className="text-red-500 text-sm mb-2">{formErrors.images}</p>
      )}
      <p className="text-xs text-gray-500 mb-4">
        Максимум {MAX_IMAGES} изображений. Первое загруженное изображение будет
        главным.
      </p>

      {/* Кнопки для отправки и сохранения в черновик */}
      <div className="flex gap-2">
        {/* Кнопка публикации */}
        <button
          className={`flex-1 rounded-lg p-3 font-medium transition-colors ${
            isSubmitting || uploading || savingDraft
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting || uploading || savingDraft}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {isEdit ? "Обновление..." : "Публикация..."}
            </span>
          ) : isEdit ? (
            "Обновить объявление"
          ) : (
            "Опубликовать объявление"
          )}
        </button>

        {/* Кнопка сохранения в черновик */}
        <button
          className={`rounded-lg p-3 font-medium transition-colors flex items-center justify-center ${
            isSubmitting || uploading || savingDraft
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting || uploading || savingDraft}
        >
          {savingDraft ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
