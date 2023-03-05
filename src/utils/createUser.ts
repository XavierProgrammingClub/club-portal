import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import inquirer from "inquirer";
import { connect, set } from "mongoose";
import { z } from "zod";

import User from "../models/user.js";

dotenv.config();
const validate = (input: string, zodSchema: z.Schema) => {
  const parsed = zodSchema.safeParse(input);
  if (parsed.success) return true;

  return parsed.error.issues[0].message;
};

inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "What name should I give to the user?",
      validate(input) {
        return validate(
          input,
          z
            .string()
            .min(3, { message: "Name must be at least 3 characters" })
            .max(255, { message: "Name must not exceed 255 characters" })
        );
      },
    },
    {
      type: "input",
      name: "email",
      message: "What email should I give to the user?",
      validate(input) {
        return validate(
          input,
          z.string().email({
            message: "Ooops! The email that you entered is invalid 🤧",
          })
        );
      },
    },
    {
      type: "password",
      name: "password",
      validate(input) {
        return validate(
          input,
          z.string().min(6, {
            message:
              "We value your security, so please enter password >= 6 characters",
          })
        );
      },
    },
    {
      type: "confirm",
      name: "role",
      message: "Do you want this user to be admin?",
    },
  ])
  .then((answers) => {
    if (answers.role) answers.role = "superuser";
    else answers.role = "user";

    console.log(
      "We can't upload photos here, so creating user with default profile picture...\n"
    );

    set("strictQuery", false);

    connect(process.env.MONGODB_URI as string)
      .then(() => {
        return bcrypt.genSalt(12);
      })
      .then((salt) => {
        return bcrypt.hash(answers.password, salt);
      })
      .then((password) => {
        return User.create({ ...answers, password });
      })
      .then(() => {
        console.log("User created successfully! 😀");
      })
      .catch((err: Error) => {
        console.log("Error creating user", err.message);
      })
      .finally(() => {
        process.exit(0);
      });
  });
