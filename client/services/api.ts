import { http } from "./https";

export async function healthCheck() {
  const res = await http.get("/health");
  return res.data;
}