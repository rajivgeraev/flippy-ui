"use client";

import { useState, useEffect } from "react";

interface Category {
    slug: string;
    name_ru: string;
    name_en: string;
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
                if (!response.ok) throw new Error("Ошибка загрузки категорий");

                const data = await response.json();
                console.log("Ответ API категорий:", data);

                // Проверяем структуру данных и адаптируем её
                if (data.categories && Array.isArray(data.categories)) {
                    // Если пришел объект с полем categories
                    setCategories(data.categories);
                } else {
                    // Неожиданный формат данных
                    console.error("Неожиданный формат данных категорий:", data);
                    setError("Получены данные категорий в неверном формате");
                    setCategories([]);
                }
            } catch (err) {
                console.error("Ошибка загрузки категорий:", err);
                setError("Не удалось загрузить категории");
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}