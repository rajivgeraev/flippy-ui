import React from "react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useTranslations } from "next-intl";

const Telegram: React.FC = () => {
  const user = useTelegramUser();
  const t = useTranslations("Telegram");

  if (!user) {
    return <p>Пользовательские данные не загружены.</p>;
  }

  return (
    <div>
      <h2>{t("user_info")}</h2>
      <p>ID: {user.id}</p>
      {user.username && <p>Username: {user.username}</p>}
      {user.photo_url && <img src={user.photo_url} alt="Profile" width="100" />}
      <p>
        Имя: {user.first_name} {user.last_name}
      </p>
      <p>Бот: {user.is_bot ? "Да" : "Нет"}</p>
      {user.is_premium && <p>Premium: Да</p>}
      {user.language_code && <p>Язык: {user.language_code}</p>}
      {user.allows_to_write_to_pm && <p>Разрешает писать в ЛС: Да</p>}
      {user.added_to_attachment_menu && <p>Добавлен в меню вложений: Да</p>}
    </div>
  );
};

export default Telegram;
