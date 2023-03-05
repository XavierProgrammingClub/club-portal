import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { connect, set } from "mongoose";

import User from "../models/user.js";
import { newUserSchema } from "../validators.js";

dotenv.config();
const init = async () => {
  const values = process.argv.slice(2);

  const name = values[0];
  const email = values[1];
  const password = values[2];
  const role = values[3] === "true" ? "superuser" : "user";

  set("strictQuery", false);
  await newUserSchema.parseAsync({ name, email, password });
  await connect(process.env.MONGODB_URI as string);
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  console.log("User created successfully");
  process.exit(0);
};

init().catch((err: Error) => {
  console.log(err);
});

export {};
