import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "RAPwUK.com | Najlepiej o rapie na Wyspach",
  description: "Kalendarz imprez, światowy i polski hip-hop, newsy i premiery. Wszystkie rapowe wibracje w UK w jednym miejscu.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
    shortcut: "/logo.jpg",
  },
  openGraph: {
    title: "RAPwUK.com | Najlepiej o rapie na Wyspach",
    description: "Kalendarz imprez, światowy i polski hip-hop, newsy i premiery. Wszystkie rapowe wibracje w UK w jednym miejscu.",
    url: "https://rapwuk.com",
    siteName: "RAPwUK.com",
    images: [{ url: "/logo.jpg", width: 1080, height: 1080, alt: "RAPwUK logo" }],
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7HN9S9HRRP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7HN9S9HRRP');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
