import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "Track your college attendance offline.",
  manifest: "/manifest.json",
  icons: {
    icon: "/attendance-tracker.png",
    shortcut: "/attendance-tracker.png",
    apple: "/attendance-tracker.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import ClientLayout from "../components/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="emerald" suppressHydrationWarning>
      <head>
         <meta name="format-detection" content="telephone=no" />
         <meta name="mobile-web-app-capable" content="yes" />
         <script
           dangerouslySetInnerHTML={{
             __html: `
               (function() {
                 try {
                   var localTheme = localStorage.getItem('theme');
                   var theme = localTheme || 'emerald';
                   document.documentElement.setAttribute('data-theme', theme);
                 } catch (e) {}
               })();
             `,
           }}
         />
      </head>
      <body>
        <ClientLayout>
            {children}
        </ClientLayout>
      </body>
    </html>
  );
}
