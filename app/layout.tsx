import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Roboto,
  Playfair_Display,
  Merriweather,
  Montserrat,
  Lato,
  Red_Hat_Display,
} from "next/font/google";
import { Providers } from "./providers";
import RootLayoutClient from "./RootLayoutClient";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  subsets: ["latin"],
  display: "swap",
});

const redHatDisplay = Red_Hat_Display({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://test.glamlink.net")),
  title: "Glamlink - The Link to the Future of Beauty",
  description: "Where beauty meets innovation, and possibilities are endless. Your go-to application for the beauty industry.",
  keywords: ["glamlink", "beauty app", "beauty professionals", "beauty industry", "beauty platform", "beauty services"],
  authors: [{ name: "Glamlink" }],
  openGraph: {
    siteName: "The Glamlink Edit",
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/images/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </head>
      <body className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${merriweather.variable} ${montserrat.variable} ${lato.variable} ${redHatDisplay.variable} font-roboto antialiased transition-colors duration-300`}>
        {measurementId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${measurementId}');
              `}
            </Script>
          </>
        )}
        <Providers>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
