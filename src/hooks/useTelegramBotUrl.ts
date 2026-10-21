"use client";

import { useQuery } from "@tanstack/react-query";
import { configService } from "@/services/api/config";

const DEFAULT_BOT_USERNAME = "Abugidatutor_bot";

export function useTelegramBotUrl(): {
  username: string;       // without @
  displayHandle: string;  // with @
  url: string;            // https://t.me/<username>
} {
  const { data } = useQuery({
    queryKey: ["public", "config"],
    queryFn: configService.getPublicConfig,
    staleTime: 60_000,
  });

  const raw = data?.telegram_bot_username || DEFAULT_BOT_USERNAME;
  const username = raw.replace(/^@/, "").trim();
  return {
    username,
    displayHandle: `@${username}`,
    url: `https://t.me/${username}`,
  };
}