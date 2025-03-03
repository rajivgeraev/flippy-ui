import {
  backButton,
  viewport,
  miniApp,
  initData,
  disableVerticalSwipes,
  isVerticalSwipesEnabled,
  init as initSDK,
} from '@telegram-apps/sdk-react';

/**
 * Проверяет, запущено ли приложение в режиме разработки
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Проверяет, запущено ли приложение в контексте Telegram
 */
export function isTelegramContext(): boolean {
  // Проверка на наличие Telegram WebApp в window
  if (typeof window !== 'undefined') {
    return !!window.Telegram?.WebApp;
  }
  return false;
}

/**
 * Инициализирует приложение и настраивает зависимости
 */
export function init(): void {
  // Проверяем, находимся ли мы в контексте Telegram
  const isInTelegram = isTelegramContext();

  // Инициализируем Telegram SDK только если запущены в Telegram
  if (isInTelegram) {
    console.log("Приложение запущено в Telegram, инициализация SDK...");

    // Инициализируем SDK Telegram
    initSDK();

    // Монтируем компоненты
    backButton.isSupported() && backButton.mount();
    miniApp.mount();
    initData.restore();

    void viewport.mount().then((data) => {
      // viewport.bindCssVars();
    }).catch(e => {
      console.error('Something went wrong mounting the viewport', e);
    });

    if (disableVerticalSwipes.isAvailable()) {
      disableVerticalSwipes();
      isVerticalSwipesEnabled(); // false
    }
  } else {
    console.log("Приложение запущено вне Telegram, SDK не инициализировано");
  }
}