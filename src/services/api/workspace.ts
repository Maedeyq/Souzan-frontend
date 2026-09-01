import { apiFetch } from "./client";
import type { Notification, Order, OrderStatus, PaginatedResponse, PortfolioImage, ProjectRequest, Proposal, Review } from "@/types";

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

export const markNotificationRead = (id: number) =>
  apiFetch<Notification>(`/notifications/${id}/read/`, { method: "PATCH" });

export const updateProject = (id: number, body: Record<string, unknown>) =>
  apiFetch<ProjectRequest>(`/projects/${id}/`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteProject = (id: number) =>
  apiFetch<void>(`/projects/${id}/`, { method: "DELETE" });

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  apiFetch<Order>(`/orders/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) });

export async function getReviews() {
  return unpack(await apiFetch<Review[] | PaginatedResponse<Review>>("/reviews/"));
}

export const createReview = (body: { order: number; rating: number; comment: string }) =>
  apiFetch<Review>("/reviews/", { method: "POST", body: JSON.stringify(body) });

export const updateReview = (id: number, body: { rating: number; comment: string }) =>
  apiFetch<Review>(`/reviews/${id}/`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteReview = (id: number) => apiFetch<void>(`/reviews/${id}/`, { method: "DELETE" });

export async function getPortfolio() {
  return unpack(await apiFetch<PortfolioImage[] | PaginatedResponse<PortfolioImage>>("/tailors/portfolio/"));
}

export const uploadPortfolioImage = (body: FormData) =>
  apiFetch<PortfolioImage>("/tailors/portfolio/", { method: "POST", body });

export const updatePortfolioCaption = (id: number, caption: string) =>
  apiFetch<PortfolioImage>(`/tailors/portfolio/${id}/`, { method: "PATCH", body: JSON.stringify({ caption }) });

export const deletePortfolioImage = (id: number) =>
  apiFetch<void>(`/tailors/portfolio/${id}/`, { method: "DELETE" });
