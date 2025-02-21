"use client";

import { useTranslations } from "next-intl";
import Telegram from "@/components/Telegram";
import Marketplace from "@/components/Marketplace";
import TelegramOnly from "@/components/TelegramOnly";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <TelegramOnly>
      <div className="pb-16">
        <Marketplace />
      </div>
    </TelegramOnly>
  );
}
