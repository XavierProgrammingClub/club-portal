import { hash, genSalt } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/user";
import { connectDatabase } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  connectDatabase().catch(() => res.json({ error: "Connection Failed...!" }));

  if (req.method === "POST") {
    if (!req.body)
      return res.status(404).json({ error: "Don't have form data...!" });
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user)
      return res.status(422).json({ message: "User Already Exists...!" });

    try {
      const salt = await genSalt(12);
      const user = await User.create({
        name,
        email,
        password: await hash(password, salt),
      });

      return res
        .status(201)
        .json({ message: "User registered successfully", status: "OK", user });
    } catch (error) {
      return res.status(404).json({ error });
    }
  } else {
    res
      .status(500)
      .json({ message: "HTTP method not valid only POST Accepted" });
  }
}
