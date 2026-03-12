import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL
});

export async function postWellness(payload) {
  const response = await api.post("/wellness", payload);
  return response.data;
}

export async function getWellness() {
  const response = await api.get("/wellness");
  return response.data;
}

export async function getAnalysis() {
  const response = await api.get("/analysis");
  return response.data;
}

export async function getInsights(question = "Why am I stressed?") {
  const response = await api.get("/insights", {
    params: { q: question }
  });
  return response.data;
}
