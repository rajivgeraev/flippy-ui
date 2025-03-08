// src/hooks/useCloudinaryUpload.ts
import { useState } from 'react';
import { AuthService } from '@/services/auth';

interface UploadParams {
    api_key: string;
    cloud_name: string;
    upload_preset: string;
    context: string;
    timestamp: string;
    signature: string;
    upload_group_id: string;
}

interface UploadedImage {
    url: string;
    preview_url: string;
    public_id: string;
    file_name: string;
    isMain: boolean;
    cloudinary_response: any; // Сохраняем полный ответ для передачи на сервер
}

interface UseCloudinaryUploadResult {
    uploadImages: (files: File[]) => Promise<{ upload_group_id: string, images: UploadedImage[] }>;
    uploading: boolean;
    progress: number;
    error: string | null;
}

export function useCloudinaryUpload(): UseCloudinaryUploadResult {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Функция для получения параметров загрузки
    const fetchUploadParams = async (): Promise<UploadParams> => {
        try {
            // Получаем JWT токен из AuthService
            const token = AuthService.getToken();
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            // Используем AuthService.fetchWithAuth для защищенных запросов
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/params`);

            if (!response.ok) {
                throw new Error('Не удалось получить параметры загрузки');
            }

            return await response.json();
        } catch (err) {
            console.error('Ошибка при получении параметров загрузки:', err);
            throw new Error(`Ошибка при получении параметров загрузки: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
        }
    };

    // Функция для загрузки одного изображения
    const uploadImage = async (file: File, params: UploadParams): Promise<UploadedImage> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', params.api_key);
        formData.append('timestamp', params.timestamp);
        formData.append('signature', params.signature);
        formData.append('upload_preset', params.upload_preset);
        formData.append('context', params.context);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${params.cloud_name}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Ошибка при загрузке изображения');
            }

            const data = await response.json();

            // Получаем URL превью из ответа Cloudinary
            let previewUrl = '';
            if (data.eager && data.eager.length > 0) {
                previewUrl = data.eager[0].secure_url;
            }

            return {
                url: data.secure_url,
                preview_url: previewUrl,
                public_id: data.public_id,
                file_name: data.original_filename,
                isMain: false,
                cloudinary_response: data 
            };
        } catch (err) {
            console.error('Ошибка при загрузке изображения:', err);
            throw new Error(`Ошибка при загрузке изображения: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
        }
    };

    // Основная функция для загрузки нескольких изображений
    const uploadImages = async (files: File[]): Promise<{ upload_group_id: string, images: UploadedImage[] }> => {
        if (files.length === 0) {
            return { upload_group_id: '', images: [] };
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Получаем параметры загрузки
            const params = await fetchUploadParams();
            const { upload_group_id } = params;

            // Загружаем изображения последовательно, обновляя прогресс
            const uploadedImages: UploadedImage[] = [];

            for (let i = 0; i < files.length; i++) {
                const result = await uploadImage(files[i], params);

                // Если это первое изображение, помечаем его как основное
                if (i === 0) {
                    result.isMain = true;
                }

                uploadedImages.push(result);

                // Обновляем прогресс
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            return { upload_group_id, images: uploadedImages };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return { uploadImages, uploading, progress, error };
}