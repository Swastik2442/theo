import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";
import { CSPostHogProvider } from "~/app/_analytics/providers";

import { ThemeProvider } from "~/contexts/themeProvider";
import TopNav from "~/components/TopNav";
import SecondaryNav from "~/components/SecondaryNav";
import { Toaster } from "~/components/ui/sonner";
import { RouteStoreProvider } from "~/contexts/routeStoreProvider";

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
    <ThemeProvider>
    <RouteStoreProvider>
      <html lang="en" className={`${GeistSans.variable} dark`}>
        <body>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <div className="h-screen">
            <TopNav />
            <SignedIn>
              <SecondaryNav />
              <div className="grid grid-rows-[auto,1fr]">
                <main className="overflow-y-auto">{children}</main>
              </div>
            </SignedIn>
            <SignedOut>
              <p className='p-4 text-2xl text-center'>Sign in to see Images</p>
            </SignedOut>
          </div>
          {modal}
          <Toaster />
        </body>
      </html>
    </RouteStoreProvider>
    </ThemeProvider>
    </CSPostHogProvider>
    </ClerkProvider>
  );
}
