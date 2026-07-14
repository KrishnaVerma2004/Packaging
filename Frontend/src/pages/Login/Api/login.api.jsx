import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function login({ mobile, password }) {
  try {
    const response = await api.post("/api/auth/login", { mobile, password });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
