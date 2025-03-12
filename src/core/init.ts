import {
  backButton,
  viewport,
  miniApp,
  initData,
  disableVerticalSwipes,
  isVerticalSwipesEnabled,
  init as initSDK,
  isTMA
} from '@telegram-apps/sdk-react';

export function isDevelopmentMode(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === 'development';
}

// Обновленная функция проверки контекста
export function isTelegramContext(): boolean {
  return isTMA();
}

let isSDKInitialized = false;

export function init(): void {
  if (isSDKInitialized) {
    console.log("SDK уже инициализировано, пропускаем");
    return;
  }

  try {
    // Безусловно инициализируем SDK
    initSDK();
    isSDKInitialized = true;

    // Теперь проверяем контекст Telegram
    const isInTelegram = isTelegramContext();

    console.log("Приложение инициализировано, Telegram контекст:", isInTelegram);

    // Монтируем компоненты только если в Telegram
    if (isInTelegram) {
      if (backButton.isSupported()) backButton.mount();
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
    }
  } catch (error) {
    console.error("Ошибка инициализации SDK:", error);
  }
}