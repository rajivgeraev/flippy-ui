export interface ListingImage {
    id: string;
    listing_id: string;
    url: string;
    preview_url?: string;
    public_id: string;
    file_name?: string;
    is_main: boolean;
    position: number;
    created_at: string;
}

export interface Listing {
    id: string;
    user_id: string;
    title: string;
    description: string;
    categories: string[];
    condition: string; 
    allow_trade: boolean;
    status: string;
    images: ListingImage[];
    created_at: string;
    updated_at: string;
}

export interface CreateListingData {
    title: string;
    description: string;
    categories: string[];
    condition: string;
    allow_trade: boolean;
    status: string; // 'active' или 'draft'
    upload_group_id: string;
    images: UploadedImage[];
}

export interface UploadedImage {
    url: string;
    preview_url?: string;
    public_id: string;
    file_name: string;
    isMain: boolean;
    cloudinary_response?: any; // Полный ответ от Cloudinary
}

export interface ListingsListResponse {
    listings: Listing[];
    total: number;
    limit: number;
    offset: number;
}

export interface ListingDetailResponse {
    listing: Listing;
    user: any;
    is_owner: boolean;
}