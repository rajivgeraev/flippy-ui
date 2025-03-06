// src/services/listingService.ts
import { AuthService } from './auth';

interface CreateListingData {
    title: string;
    description: string;
    categories: string[];
    condition: string;
    allowTrade: boolean;
    upload_group_id: string;
    images: {
        url: string;
        public_id: string;
        file_name: string;
        isMain: boolean;
    }[];
}

interface CreateListingResponse {
    success: boolean;
    listing_id: string;
    message: string;
}

export class ListingService {
    static async createListing(data: CreateListingData): Promise<CreateListingResponse> {
        try {
            const response = await AuthService.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
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