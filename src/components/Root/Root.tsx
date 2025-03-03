"use client";

import { type PropsWithChildren, useEffect } from "react";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";
import { useClientOnce } from "@/hooks/useClientOnce";
import { setLocale } from "@/core/i18n/locale";
import { init, isTelegramContext, isDevelopmentMode } from "@/core/init";

import "./styles.css";

function RootInner({ children }: PropsWithChildren) {
  const isDev = isDevelopmentMode();
  const isInTelegram = isTelegramContext();

  // Mock Telegram environment in development mode if needed and only if trying to use Telegram
  if (isDev && isInTelegram) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTelegramMock();
  }

  // Initialize the library.
  useClientOnce(() => {
    init();
    console.log("Application initialized, Telegram context:", isInTelegram);
  });

  // Устанавливаем локаль только если в контексте Telegram
  if (isInTelegram) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initDataUser = useSignal(initData.user);

    // Set the user locale.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (
        initDataUser?.language_code === "en" ||
        initDataUser?.language_code === "ru"
      ) {
        setLocale(initDataUser.language_code);
      }
    }, [initDataUser]);
  }

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
