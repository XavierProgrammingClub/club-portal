import Axios from "axios";

export const axios = Axios.create({});

axios.interceptors.response.use((response) => response.data);
