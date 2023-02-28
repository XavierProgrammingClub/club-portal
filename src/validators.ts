import { z } from "zod";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const signUpSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string(),
});
