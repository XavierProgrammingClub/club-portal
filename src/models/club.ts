import mongoose from "mongoose";

import { IUser } from "@/models/user";

export interface IClub {
  _id: string;
  name: string;
  description: string;
  profilePic: string;
  members: [
    {
      user: string | IUser;
      role:
        | "President"
        | "Vice President"
        | "Secretary"
        | "Active Member"
        | "General Member"
        | string;
    }
  ];
  isAvailableForRegistration: boolean;
  announcements: [
    {
      title: string;
      description: string;
      photo?: string;
    }
  ];
}

const clubSchema = new mongoose.Schema<IClub>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    profilePic: { type: String, required: true },
    members: [
      {
        user: { ref: "User", required: true },
        role: { type: "String" },
      },
    ],
    isAvailableForRegistration: { type: Boolean, default: false },
    announcements: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      photo: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
