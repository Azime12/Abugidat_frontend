"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { Loader2, Save, Wallet, Banknote, Users, Link as LinkIcon, Briefcase, Send, Languages, Navigation } from "lucide-react";

interface ConfigForm {
  kulf10: number;
  kulf25: number;
  kulf50: number;
  telebirr: string;
  cbe: string;
  bank: string;
  parent_listing_fee: number;
  group_link: string;
  required_group_members_threshold: number;
  required_invites_threshold: number;
  required_bot_referrals_threshold: number;
  broadcastChannelId: string;
  inviteGroupId: string;
  defaultLanguage: string;
  enabledLanguages: string[];
  defaultTravelKm: number;
}

const DEFAULT_FORM: ConfigForm = {
  kulf10: 150,
  kulf25: 350,
  kulf50: 600,
  telebirr: "0911234567",
  cbe: "1000123456789",
  bank: "Awash: 0123-XXXX",
  parent_listing_fee: 0,
  group_link: "https://t.me/AbugidaTutors_group",
  required_group_members_threshold: 0,
  required_invites_threshold: 0,
  required_bot_referrals_threshold: 0,
  broadcastChannelId: "",
  inviteGroupId: "",
  defaultLanguage: "am",
  enabledLanguages: ["am", "en", "om"],
  defaultTravelKm: 5,
};

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  hint?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start gap-2">
        <div className="mt-0.5 text-[#0096D6]">{icon}</div>
        <div>
          <h2 className="text-base font-black text-[#2D2A32]">{title}</h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ConfigForm>(DEFAULT_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "config"],
    queryFn: async () => (await adminService.getConfig()).data,
  });

  useEffect(() => {
    if (!data?.config) return;
    const c = data.config;
    const prices = c.kulf_pack_prices || {};
    const accounts = c.payment_accounts || {};
    setForm({
      kulf10: Number(prices["10"] ?? DEFAULT_FORM.kulf10),
      kulf25: Number(prices["25"] ?? DEFAULT_FORM.kulf25),
      kulf50: Number(prices["50"] ?? DEFAULT_FORM.kulf50),
      telebirr: accounts.telebirr || DEFAULT_FORM.telebirr,
      cbe: accounts.cbe || DEFAULT_FORM.cbe,
      bank: accounts.bank || DEFAULT_FORM.bank,
      parent_listing_fee: Number(c.parent_listing_fee ?? DEFAULT_FORM.parent_listing_fee),
      group_link: c.group_link || DEFAULT_FORM.group_link,
      required_group_members_threshold: Number(c.required_group_members_threshold ?? 0),
      required_invites_threshold: Number(c.required_invites_threshold ?? 0),
      required_bot_referrals_threshold: Number(c.required_bot_referrals_threshold ?? 0),
      broadcastChannelId: c.broadcast_channel_id || "",
      inviteGroupId: c.invite_group_id || "",
      defaultLanguage: c.default_language || "am",
      enabledLanguages: c.enabled_languages || ["am", "en", "om"],
      defaultTravelKm: Number(c.default_travel_km ?? 5),
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      adminService.updateConfig({
        kulf_pack_prices: { "10": form.kulf10, "25": form.kulf25, "50": form.kulf50 },
        payment_accounts: { telebirr: form.telebirr, cbe: form.cbe, bank: form.bank },
        parent_listing_fee: form.parent_listing_fee,
        group_link: form.group_link,
        required_group_members_threshold: form.required_group_members_threshold,
        required_invites_threshold: form.required_invites_threshold,
        required_bot_referrals_threshold: form.required_bot_referrals_threshold,
        broadcast_channel_id: form.broadcastChannelId,
        invite_group_id: form.inviteGroupId,
        default_language: form.defaultLanguage,
        enabled_languages: form.enabledLanguages,
        default_travel_km: form.defaultTravelKm,
      }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "config"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save settings")),
  });

  const set = (key: keyof ConfigForm) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#2D2A32]">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure payments, Kulf pricing, invitation thresholds, and group requirements.
        </p>
      </div>

      <Section
        title="Kulf pack prices"
        description="Set the ETB price for each Kulf pack. Tutors see these when buying credits."
        icon={<Wallet size={18} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="10 Kulf (ETB)" value={form.kulf10} onChange={set("kulf10")} type="number" />
          <Field label="25 Kulf (ETB)" value={form.kulf25} onChange={set("kulf25")} type="number" />
          <Field label="50 Kulf (ETB)" value={form.kulf50} onChange={set("kulf50")} type="number" />
        </div>
      </Section>

      <Section
        title="Payment accounts"
        description="Bank / mobile-money account numbers where tutors send their payments."
        icon={<Banknote size={18} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Telebirr number" value={form.telebirr} onChange={set("telebirr")} />
          <Field label="CBE account" value={form.cbe} onChange={set("cbe")} />
          <Field label="Other bank" hint="e.g. Awash: 0123-XXXX" value={form.bank} onChange={set("bank")} />
        </div>
      </Section>

      <Section
        title="Job listing fee"
        description="Anti-spam fee (ETB) charged to parents before a job is approved. Set 0 for free."
        icon={<Briefcase size={18} />}
      >
        <div className="max-w-xs">
          <Field label="Parent listing fee (ETB)" value={form.parent_listing_fee} onChange={set("parent_listing_fee")} type="number" />
        </div>
      </Section>

      <Section
        title="Group & channel"
        description="Telegram group link and the minimum members a tutor must invite."
        icon={<LinkIcon size={18} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Group / channel link" value={form.group_link} onChange={set("group_link")} />
          <Field
            label="Required group members"
            hint="Min members a tutor must bring (0 = disabled)"
            value={form.required_group_members_threshold}
            onChange={set("required_group_members_threshold")}
            type="number"
          />
        </div>
      </Section>

      <Section
        title="Telegram channels (bot)"
        description="The channel where approved jobs are posted, and the group whose member joins count as invites. Get any chat ID by sending /id inside that chat to the bot."
        icon={<Send size={18} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Job broadcast channel ID"
            hint="e.g. -1001234567890 — approved jobs post here"
            value={form.broadcastChannelId}
            onChange={set("broadcastChannelId")}
          />
          <Field
            label="Invite tracking group ID"
            hint="Group where member joins credit the inviter"
            value={form.inviteGroupId}
            onChange={set("inviteGroupId")}
          />
        </div>
      </Section>

      <Section
        title="Invitations & referrals"
        description="How many invites or referrals a tutor needs before applying to jobs."
        icon={<Users size={18} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Required invites threshold"
            hint="Invites needed before applying (0 = disabled)"
            value={form.required_invites_threshold}
            onChange={set("required_invites_threshold")}
            type="number"
          />
          <Field
            label="Required bot referrals"
            hint="Bot referrals needed (0 = disabled)"
            value={form.required_bot_referrals_threshold}
            onChange={set("required_bot_referrals_threshold")}
            type="number"
          />
        </div>
      </Section>

      <Section
        title="Language"
        description="Set the default language and which languages users can switch between."
        icon={<Languages size={18} />}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-[#2D2A32]">Default language</span>
            <select
              value={form.defaultLanguage}
              onChange={(e) => setForm((f) => ({ ...f, defaultLanguage: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
            >
              <option value="am">አማርኛ (Amharic)</option>
              <option value="en">English</option>
              <option value="om">Afaan Oromoo (Oromo)</option>
            </select>
          </label>

          <div>
            <span className="mb-1 block text-sm font-bold text-[#2D2A32]">Enabled languages</span>
            <div className="space-y-2">
              {[
                { code: "am", name: "አማርኛ (Amharic)" },
                { code: "en", name: "English" },
                { code: "om", name: "Afaan Oromoo (Oromo)" },
              ].map((lang) => {
                const checked = form.enabledLanguages.includes(lang.code);
                return (
                  <label key={lang.code} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.enabledLanguages, lang.code]
                          : form.enabledLanguages.filter((c) => c !== lang.code);
                        setForm((f) => ({ ...f, enabledLanguages: next }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#0096D6] focus:ring-[#0096D6]"
                    />
                    {lang.name}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Tutor Recommendations"
        description="Platform-wide defaults shown to tutors during registration."
        icon={<Navigation size={18} />}
      >
        <div className="max-w-xs">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-[#2D2A32]">
              Default travel radius (km)
            </span>
            <div className="flex gap-2">
              {[3, 5, 10, 15, 20].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, defaultTravelKm: km }))}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    form.defaultTravelKm === km
                      ? "border-[#0096D6] bg-[#0096D6] text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
            <span className="mt-1 block text-xs text-gray-500">
              Shown as the default travel distance when tutors register. They won&apos;t see the selector — this value is automatically applied.
            </span>
          </label>
        </div>
      </Section>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#007FB8] disabled:opacity-50"
      >
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save settings
      </button>
    </div>
  );
}
