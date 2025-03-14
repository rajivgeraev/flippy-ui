import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Root } from "@/components/Root/Root";
import BottomNavigation from "@/components/BottomNavigation";
import { AuthProvider } from "@/contexts/AuthContext";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <div className="pb-[60px]">
              <Root>{children}</Root>
            </div>
            <BottomNavigation />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
