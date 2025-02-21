"use client";

import { useTranslations } from "next-intl";
import Telegram from "@/components/Telegram";
import Marketplace from "@/components/Marketplace";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="pb-16">
      {/* <h1>{t("title")}</h1>
      <div>
        <h1>{t("app")}</h1>
        <Telegram />
      </div> */}
      <Marketplace />
    </div>
  );
}
