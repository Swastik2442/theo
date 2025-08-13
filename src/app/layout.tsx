import "~/polyfills";
import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";
import { CSPostHogProvider } from "~/app/_analytics/providers";

import { ThemeProvider } from "~/contexts/themeProvider";
import { PressedKeysProvider } from "~/contexts/pressedKeysProvider";
import StoreProviders from "~/contexts/storeProviders";
import TopNav from "~/components/TopNav";
import SecondaryNav from "~/components/SecondaryNav";
import { Toaster } from "~/components/ui/sonner";
import { SimpleUploadDropzone } from "~/components/uploadDropzone";
import { NotSignedIn } from "~/components/empty";

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
      <html lang="en" className={`${GeistSans.variable} dark`}>
        <body>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <StoreProviders>
          <div className="h-screen flex flex-col">
            <TopNav />
            <SignedIn>
              <SimpleUploadDropzone>
              <PressedKeysProvider>
                <SecondaryNav />
                <div className="grid grid-rows-[auto,1fr] flex-1">
                  <main className="overflow-y-auto min-h-full">{children}</main>
                </div>
              </PressedKeysProvider>
              </SimpleUploadDropzone>
            </SignedIn>
            <SignedOut>
              <NotSignedIn />
            </SignedOut>
          </div>
          {modal}
          <Toaster />
          </StoreProviders>
        </body>
      </html>
    </ThemeProvider>
    </CSPostHogProvider>
    </ClerkProvider>
  );
}
