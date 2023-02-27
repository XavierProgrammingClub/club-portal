import { connect, set } from "mongoose";

import { env } from "@/utils/env";

set("strictQuery", false);
export const connectDatabase = async () => {
  return connect(env.MONGODB_URI);
};
