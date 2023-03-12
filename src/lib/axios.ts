import Axios from "axios";
import { toast } from "react-toastify";

export const axios = Axios.create({});

axios.interceptors.response.use((response) => response.data);
