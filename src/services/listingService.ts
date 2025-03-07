// src/services/listingService.ts
import { AuthService } from './auth';

interface ListingImage {
    url: string;
    preview_url?: string;
    public_id: string;
    file_name: string;
    isMain: boolean;
    cloudinary_response?: any; // Полный ответ от Cloudinary
}

interface CreateListingData {
    title: string;
    description: string;
    categories: string[];
    condition: string;
    allowTrade: boolean;
    status: string; // 'active' или 'draft'
    upload_group_id: string;
    images: ListingImage[];
}

interface CreateListingResponse {
    success: boolean;
    listing_id: string;
    message: string;
}

export class ListingService {
    static async createListing(data: CreateListingData): Promise<CreateListingResponse> {
        try {
            // Подготавливаем данные для отправки
            const requestData = {
                ...data,
                images: data.images.map(image => ({
                    url: image.url,
                    preview_url: image.preview_url || '',
                    public_id: image.public_id,
                    file_name: image.file_name,
                    isMain: image.isMain,
                    cloudinary_response: image.cloudinary_response
                }))
            };

            // Отправляем запрос на создание объявления
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании объявления');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании объявления:', error);
            throw error;
        }
    }
}