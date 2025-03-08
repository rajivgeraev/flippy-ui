"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";
import { useClientOnce } from "@/hooks/useClientOnce";
import { setLocale } from "@/core/i18n/locale";
import { init, isTelegramContext, isDevelopmentMode } from "@/core/init";

import "./styles.css";

function RootInner({ children }: PropsWithChildren) {
  const isDev = isDevelopmentMode();
  const [isInTelegram, setIsInTelegram] = useState(false);

  // Всегда используем хук useSignal
  const initDataUser = useSignal(initData.user);

  // Используем useEffect вместо useClientOnce для инициализации
  useEffect(() => {
    // Инициализируем SDK
    init();

    // Проверяем контекст после инициализации
    const telegramContext = isTelegramContext();
    setIsInTelegram(telegramContext);

    console.log("Application initialized, Telegram context:", telegramContext);

    // Mock только в режиме разработки
    if (isDev && telegramContext) {
      useTelegramMock();
    }
  }, [isDev]); // Зависимость только от isDev

  // Устанавливаем локаль на основе данных пользователя
  useEffect(() => {
    if (isInTelegram && initDataUser) {
      if (
        initDataUser.language_code === "en" ||
        initDataUser.language_code === "ru"
      ) {
        setLocale(initDataUser.language_code);
      }
    }
  }, [isInTelegram, initDataUser]);

  return <>{children}</>;
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
  const didMount = useDidMount();

  return didMount ? (
    <RootInner {...props} />
  ) : (
    <div className="root__loading">Loading</div>
  );
}
