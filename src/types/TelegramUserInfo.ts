export type TelegramUserInfo = {
    id: string;
    username?: string;
    photo_url?: string;
    last_name?: string;
    first_name?: string;
    is_bot: boolean;
    is_premium?: boolean;
    language_code?: string;
    allows_to_write_to_pm?: boolean;
    added_to_attachment_menu?: boolean;
};
