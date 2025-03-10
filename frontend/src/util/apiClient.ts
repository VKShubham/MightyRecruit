// apiClient.ts
import { useUser } from "@/app/store";
import { logout } from "@/service/AuthService";
import axios from "axios"; // your user removal action

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

const { removeUser } = useUser.getState();
// Attach a response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 403)) {
      // Optionally remove user from state
      // Redirect to login
      removeUser();
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
