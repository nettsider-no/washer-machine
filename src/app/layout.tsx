import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Manrope } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { messages, resolveInitialLocale } from "@/lib/i18n";

const display = Manrope({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-display",
});

const sans = Manrope({
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const hdrs = await headers();
  const locale = resolveInitialLocale(
    cookieStore.get("wash_locale")?.value,
    hdrs.get("accept-language")
  );
  const m = messages[locale];
  return {
    title: m.metaTitle,
    description: m.metaDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hdrs = await headers();
  const initialLocale = resolveInitialLocale(
    cookieStore.get("wash_locale")?.value,
    hdrs.get("accept-language")
  );
  const htmlLang = initialLocale === "no" ? "no" : initialLocale;
  const themeCookie = cookieStore.get("wash_theme")?.value;
  const theme =
    themeCookie === "light" || themeCookie === "dark" || themeCookie === "system"
      ? themeCookie
      : "system";

  return (
    <html
      lang={htmlLang}
      data-theme={theme}
      className={`${display.variable} ${sans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full font-[family-name:var(--font-sans-body)] text-[var(--foreground)]">
        <LocaleProvider initialLocale={initialLocale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
