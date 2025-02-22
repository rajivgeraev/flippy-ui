import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Root } from "@/components/Root/Root";
import BottomNavigation from "@/components/BottomNavigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Root>{children}</Root>
          <BottomNavigation />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
