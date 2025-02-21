import { isTMA } from '@telegram-apps/sdk-react';

export default function TelegramOnly({ children }: { children: React.ReactNode }) {
  const isInTelegram = isTMA();
  console.log("This application is designed to work exclusively within the Telegram platform.\nPlease open this application through Telegram to access its features.")

  if (!isInTelegram) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">⚠️ Telegram Only</h1>
          <p className="text-lg">
            This application is designed to work exclusively within the Telegram platform.
            Please open this application through Telegram to access its features.
          </p>
        </div>
      </div>
    );
  }

  return children;
}