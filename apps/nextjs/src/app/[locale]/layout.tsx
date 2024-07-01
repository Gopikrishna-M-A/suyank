import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { cn } from "@acme/ui";
import { Layout } from "@acme/ui/layout";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "./globals.css";

import MemeDetailsModal from "~/components/MemeDetailsModal";
import { env } from "~/env";
import { AuthShowcase } from "../../components/auth-showcase";
import SearchBar from "../../components/SearchBar";
import { Provider } from "./provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "YourMeme",
  description: "Simple monorepo with shared backend for web & mobile apps",
  openGraph: {
    title: "YourMeme",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "YourMeme",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    // { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const myFont = localFont({
  src: "../../fonts/cafe24/Cafe24Moyamoya-Regular.otf",
  variable: "--font-cafe24",
});

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={props?.params?.locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          myFont.className,
        )}
      >
        <Provider locale={props?.params?.locale}>
          <ThemeProvider defaultTheme="light">
            <TRPCReactProvider>
              <Layout
                middleContent={<SearchBar />}
                rightContent={<AuthShowcase />}
              >
                {props.children}

                <MemeDetailsModal />
              </Layout>
            </TRPCReactProvider>
            {/* <div className="absolute bottom-4 right-4">
              <ThemeToggle />
            </div> */}

            <Toaster />
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
