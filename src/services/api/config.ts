import client from "@/lib/api-client";

export interface PublicConfig {
  kulf_pack_prices: Record<string, number>;
  kulf_unlock_cost?: number;
  payment_accounts: {
    telebirr?: string;
    cbe?: string;
    bank?: string;
  } | null;
  payment_instructions?: string | null;
  default_language?: string;
  enabled_languages?: string[];
  default_travel_km?: number;
  telegram_bot_username?: string;
}

export const ALL_LANGUAGES = [
  { code: "am", name: "አማርኛ", flag: "🇪🇹" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "om", name: "Afaan Oromoo", flag: "🇪🇹" },
];

export const configService = {
  async getPublicConfig(): Promise<PublicConfig> {
    const res = await client.get("/public/config");
    return res.data?.config ?? { kulf_pack_prices: {} };
  },
};
