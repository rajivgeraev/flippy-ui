"use client";

import { type PropsWithChildren, useEffect } from "react";
import {
  initData,
  // miniApp,
  // useLaunchParams,
  useSignal,
} from "@telegram-apps/sdk-react";
// import { TonConnectUIProvider } from '@tonconnect/ui-react';
// import { AppRoot } from '@telegram-apps/telegram-ui';

// import { ErrorBoundary } from '@/components/ErrorBoundary';
// import { ErrorPage } from '@/components/ErrorPage';
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";
import { useClientOnce } from "@/hooks/useClientOnce";
import { setLocale } from "@/core/i18n/locale";
import { init } from "@/core/init";

import "./styles.css";

function RootInner({ children }: PropsWithChildren) {
  const isDev = process.env.NODE_ENV === "development";

  // Mock Telegram environment in development mode if needed.
  if (isDev) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTelegramMock();
  }

  // const lp = useLaunchParams();
  // const debug = isDev || lp.startParam === "debug";

  // Initialize the library.
  useClientOnce(() => {
    init();
  });

  // const isDark = useSignal(miniApp.isDark);
  const initDataUser = useSignal(initData.user);

  // Set the user locale.
  useEffect(() => {
    if (
      initDataUser?.language_code === "en" ||
      initDataUser?.language_code === "ru"
    ) {
      setLocale(initDataUser.language_code);
    }
  }, [initDataUser]);

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
