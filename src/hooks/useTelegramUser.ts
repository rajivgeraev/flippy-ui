'use client';

import { useMemo } from 'react';
import { useSignal, initData, init, type User } from '@telegram-apps/sdk-react';
import { TelegramUserInfo } from '@/types/TelegramUserInfo';


export function useTelegramUser(): TelegramUserInfo | null {
    const initDataState = useSignal(initData.state);

    return useMemo(() => {
        if (!initDataState?.user) return null;

        const user: User = initDataState.user;
        return {
            id: user.id.toString(),
            username: user.username,
            photo_url: user.photo_url,
            last_name: user.last_name,
            first_name: user.first_name,
            is_bot: user.is_bot ?? false,
            is_premium: user.is_premium ?? false,
            language_code: user.language_code ?? '',
            allows_to_write_to_pm: user.allows_write_to_pm ?? false,
            added_to_attachment_menu: user.added_to_attachment_menu ?? false,
        };
    }, [initDataState]);
}
