import "@/styles/css-reset.css";
import "@/styles/globals.css";

import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getCookie, setCookie } from "cookies-next";
import type { AppProps, AppContext } from "next/app";
import NextApp from "next/app";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
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
            <ModalsProvider>
              <RouterTransition />
              <main className={inter.className}>
                <Component {...pageProps} />
              </main>
              <Notifications />
            </ModalsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export function RouterTransition() {
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && nprogress.start();
    const handleComplete = () => nprogress.complete();

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.asPath]);

  return <NavigationProgress autoReset={true} />;
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie("mantine-color-scheme", appContext.ctx) || "light",
  };
};
