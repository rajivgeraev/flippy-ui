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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                if (!response.ok) throw new Error("Ошибка загрузки категорий");

                const data = await response.json();
                setCategories(data.categories);
            } catch (err) {
                setError("Не удалось загрузить категории");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}
