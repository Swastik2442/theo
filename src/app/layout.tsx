import "~/styles/globals.css";
import TopNav from "~/app/_components/TopNav";

import { ClerkProvider } from '@clerk/nextjs';

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Theo",
  description: "React Tut by T3.gg",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col gap-4">
        <TopNav />
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
