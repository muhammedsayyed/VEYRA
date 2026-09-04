import { request } from "./client";

export async function getProfile() {
  return request<any>("/users", { method: "GET" });
}
export async function updateProfile(data: any) {
  return request<any>("/users", { method: "PUT", body: JSON.stringify(data) });
}
