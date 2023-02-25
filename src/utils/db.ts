import { connect, set } from "mongoose";

set("strictQuery", false);
export const connectDatabase = async () => {
  return connect("mongodb://127.0.0.1/club-portal");
};
