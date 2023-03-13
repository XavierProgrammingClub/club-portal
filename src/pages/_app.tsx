import "@/styles/css-reset.css";
import "@/styles/globals.css";

import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getCookie, setCookie } from "cookies-next";
import type { AppProps, AppContext } from "next/app";
import NextApp from "next/app";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

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
  ...restProps
}: AppProps & { colorScheme: ColorScheme }) {
  const [colorScheme, setColorScheme] = useState(restProps.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{ colorScheme }}
          >
            <main className={inter.className}>
              <Component {...pageProps} />
            </main>
            <NextNProgress />
            <Notifications />
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie("mantine-color-scheme", appContext.ctx) || "dark",
  };
};
