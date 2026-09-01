import { apiFetch } from "./client";
import type { Notification, Order, PaginatedResponse, ProjectRequest, Proposal } from "@/types";

const unpack = <T>(value: T[] | PaginatedResponse<T>) => Array.isArray(value) ? value : value.results;

export async function getWorkspaceData() {
  const [projects, proposals, orders, notifications] = await Promise.all([
    apiFetch<ProjectRequest[] | PaginatedResponse<ProjectRequest>>("/projects/"),
    apiFetch<Proposal[] | PaginatedResponse<Proposal>>("/projects/proposals/"),
    apiFetch<Order[]>("/orders/"),
    apiFetch<Notification[] | PaginatedResponse<Notification>>("/notifications/"),
  ]);
  return { projects: unpack(projects), proposals: unpack(proposals), orders, notifications: unpack(notifications) };
}

export const createProject = (body: Record<string, unknown>) =>
  apiFetch<ProjectRequest>("/projects/", { method: "POST", body: JSON.stringify(body) });

export const createProposal = (body: Record<string, unknown>) =>
  apiFetch<Proposal>("/projects/proposals/", { method: "POST", body: JSON.stringify(body) });

export const acceptProposal = (id: number) =>
  apiFetch<Proposal>(`/projects/proposals/${id}/accept/`, { method: "POST" });

export const createOrder = (proposal: number) =>
  apiFetch<Order>("/orders/", { method: "POST", body: JSON.stringify({ proposal }) });

export const markAllNotificationsRead = () =>
  apiFetch<{ updated_count: number }>("/notifications/read-all/", { method: "PATCH" });
