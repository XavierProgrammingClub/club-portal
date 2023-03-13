import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import Axios from "axios";

export const axios = Axios.create({});

axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.message || error.message;

    if (
      message === "User not logged in!" ||
      message === "Request failed with status code 400"
    )
      return Promise.reject(error);

    if (responseData?.message === "Validation error") {
      responseData?.issues.forEach(
        (issue: { message: string }, index: number) => {
          setTimeout(() => {
            showNotification({
              title: "Validation error",
              message: issue.message,
              color: "red",
            });
          }, 200 * index);
        }
      );
    } else
      showNotification({ message, color: "red", icon: <IconX size={16} /> });

    return Promise.reject(error);
  }
);
