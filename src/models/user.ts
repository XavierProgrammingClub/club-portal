import mongoose from "mongoose";

export type UserRole = "superuser" | "user";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["superuser", "user"] },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
