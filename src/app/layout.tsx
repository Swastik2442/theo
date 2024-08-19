import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";
import { CSPostHogProvider } from "~/app/_analytics/providers";

import TopNav from "~/app/_components/TopNav";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "Theo",
  description: "A Simple Image Gallery",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  appleWebApp: { capable: false },
  other: { "mobile-web-app-capable": "no" }
};

export default function RootLayout({
  children,
  modal
}: Readonly<{ children: React.ReactNode, modal: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <html lang="en" className={`${GeistSans.variable} dark`}>
          <body>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <div className="grid h-screen grid-rows-[auto,1fr]">
              <TopNav />
              <main className="overflow-y-auto">{children}</main>
            </div>
            {modal}
            <Toaster />
          </body>
        </html>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}
