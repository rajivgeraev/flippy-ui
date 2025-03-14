import { format, formatDistance, formatRelative, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату в относительном формате (например, "5 минут назад")
 */
export function formatRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        return formatDistance(date, new Date(), {
            addSuffix: true,
            locale: ru
        });
    } catch (error) {
        return "неизвестная дата";
    }
}

/**
 * Форматирует дату сообщения: сегодня показывает время, вчера - "Вчера", 
 * для более старых дат показывает дату
 */
export function formatMessageDate(dateString: string): string {
    try {
        const date = new Date(dateString);

        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return 'Вчера';
        } else {
            return format(date, 'dd.MM.yyyy');
        }
    } catch (error) {
        return "";
    }
}

/**
 * Форматирует полную дату и время
 */
export function formatDateTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch (error) {
        return "неизвестная дата";
    }
}