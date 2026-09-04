import { request } from "./client";

export async function getWorkouts() {
  return request<any[]>("/workouts", { method: "GET" });
}
export async function addWorkout(data: { workoutName: string; duration: number; caloriesBurned?: number }) {
  return request<any>("/workouts", { method: "POST", body: JSON.stringify(data) });
}
export async function getWeightHistory() {
  return request<any[]>("/weight-history", { method: "GET" });
}
export async function addWeight(weight: number, date?: string) {
  return request<any>("/weight-history", { method: "POST", body: JSON.stringify({ weight, date }) });
}
