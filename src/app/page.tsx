"use client";

import { useTranslations } from "next-intl";
import Telegram from "@/components/Telegram";

export default function Home() {
  const t = useTranslations("Home");
  return (
    <>
      <h1>{t("title")}</h1>
      <div>
        <h1>{t("app")}</h1>
        <Telegram />
      </div>
    </>
  );
}
