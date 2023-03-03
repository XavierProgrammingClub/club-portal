import { genSalt, hash } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/user";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { newUserSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    /*
     @POST /api/users
     @desc Signup User
    */
    if (req.method === "POST") {
      const parsed = newUserSchema.safeParse(req.body);
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

      const salt = await genSalt(12);
      data.password = await hash(data.password, salt);
      const newUser = await User.create(data);

      return res.status(201).json({
        message: "User registered successfully",
        status: "OK",
        user: newUser,
      });
    }

    const user = await getCurrentUserDetails({ req, res });
    if (!user || !(user.role === "superuser")) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    /*
      @GET /api/users
      @desc Get all users
    */
    if (req.method === "GET") {
      const users = await User.find().select("-password");

      return res.json({ status: "OK", users });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ status: "ERROR", message: (error as Error).message });
  }
}
