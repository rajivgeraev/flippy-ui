// Объявление типов для Telegram WebApp
interface TelegramWebApp {
    // Минимальное определение типов, необходимых для проверки
    ready: () => boolean;
    isExpanded: boolean;
    // Другие свойства и методы WebApp...
}

// Расширение интерфейса Window
interface Window {
    Telegram?: {
        WebApp?: TelegramWebApp;
    };
}