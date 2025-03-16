// src/services/listingService.ts
import { AuthService } from './auth';
import {
    Listing,
    ListingImage,
    CreateListingData,
    ListingsListResponse,
    ListingDetailResponse,
    UploadedImage
} from '@/types/listings';

export class ListingService {
    // Создание объявления
    static async createListing(data: CreateListingData): Promise<{ success: boolean, listing_id: string, message: string }> {
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

    // Получение списка объявлений пользователя
    static async getMyListings(status: string = 'all', offset: number = 0): Promise<ListingsListResponse> {
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/my`);

            // Добавляем параметры запроса
            if (status !== 'all') {
                url.searchParams.append('status', status);
            }
            url.searchParams.append('offset', offset.toString());

            const response = await AuthService.fetchWithAuth(url.toString(), {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении списка объявлений');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении списка объявлений:', error);
            throw error;
        }
    }

    // Получение одного объявления по ID
    static async getListing(id: string): Promise<ListingDetailResponse> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Требуется авторизация для просмотра объявления');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении объявления');
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при получении объявления с ID ${id}:`, error);
            throw error;
        }
    }

    // Обновление объявления
    static async updateListing(id: string, data: CreateListingData): Promise<{ success: boolean, listing_id: string, message: string }> {
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

            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при обновлении объявления');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении объявления:', error);
            throw error;
        }
    }

    // Удаление объявления
    static async deleteListing(id: string): Promise<{ success: boolean, message: string }> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при удалении объявления');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при удалении объявления:', error);
            throw error;
        }
    }

    // Получение публичных объявлений (без авторизации)
    static async getPublicListings(offset: number = 0, limit: number = 20): Promise<ListingsListResponse> {
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при получении публичных объявлений');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении публичных объявлений:', error);
            throw error;
        }
    }
}