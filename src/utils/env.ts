import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env2 vars.
 */
const server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env2 vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  // NEXT_PUBLIC_CLIENT_VAR: z.string().min(1),
});

/**
 * You can't destruct `process.env2` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side, so we need to destruct manually.
 */
const processEnv: Record<
  keyof z.infer<typeof server> | keyof z.infer<typeof client>,
  string | undefined
> = {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

type MergedInput = z.input<typeof merged>;
type MergedOutput = z.infer<typeof merged>;
type MergedSafeParseReturn = z.SafeParseReturnType<MergedInput, MergedOutput>;

let env = process.env as MergedOutput;

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env2 vars
      : client.safeParse(processEnv)
  ) as MergedSafeParseReturn; // on client, we can only validate the ones that are exposed

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env2 var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[prop as keyof typeof target];
    },
  });
}

export { env };

// import { z } from "zod";
//
// const schema = z.object({
//   NODE_ENV: z.enum(["development", "test", "production"]),
//   MONGODB_URI: z.string(),
//   JWT_SECRET: z.string(),
// });
//
// const parsed = schema.safeParse(process.env);
//
// if (!parsed.success) {
//   console.error(
//     "❌ Invalid environment variables:",
//     parsed.error.flatten().fieldErrors
//   );
//   throw new Error("Invalid environment variables");
// }
//
// export const env = parsed.data;
