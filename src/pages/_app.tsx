import "@/styles/css-reset.css";
import "@/styles/globals.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";
import "react-toastify/dist/ReactToastify.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const inter = Inter({ weight: "variable", subsets: ["latin"] });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          {/*<Navbar />*/}
          <main className={inter.className}>
            <Component {...pageProps} />
          </main>
          <NextNProgress />
          {/*<ToastContainer />*/}
          <Notifications />
        </MantineProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
