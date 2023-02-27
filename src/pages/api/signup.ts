import { hash, genSalt } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import User from "@/models/user";
import { connectDatabase } from "@/utils/db";

export const signUpSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  if (req.method === "POST") {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(422).json({
        status: "ERROR",
        message: "Validation Error Occurred",
        error: parsed.error,
      });

    const { data } = parsed;

    const user = await User.findOne({ email: data.email });

    if (user)
      return res
        .status(422)
        .json({ status: "ERROR", message: "User Already Exists!" });

    try {
      const salt = await genSalt(12);
      data.password = await hash(data.password, salt);
      const user = await User.create(data);

      return res
        .status(201)
        .json({ message: "User registered successfully", status: "OK", user });
    } catch (error) {
      return res.status(404).json({ error });
    }
  } else {
    res.status(500).json({
      status: "ERROR",
      message: "HTTP method not valid only POST Accepted",
    });
  }
}
