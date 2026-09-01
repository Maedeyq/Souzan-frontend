// Types mirrored from souzan backend models (accounts, customers, tailors apps)

export type UserRole = "CUSTOMER" | "TAILOR" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface CustomerProfile {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export type ProjectRequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ProjectRequest {
  id: number;
  customer: number;
  customer_username: string;
  title: string;
  description: string;
  garment_type: string;
  fabric: string;
  quantity: number;
  budget: string | null;
  deadline: string | null;
  status: ProjectRequestStatus;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Proposal {
  id: number;
  project: number;
  tailor: number;
  tailor_username: string;
  price: string;
  estimated_days: number;
  description: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface Order {
  id: number;
  proposal: number;
  project: number;
  customer: number;
  customer_username: string;
  tailor: number;
  tailor_username: string;
  proposal_price: string;
  total_price: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Notification {
  id: number;
  notification_type: "proposal_submitted" | "proposal_accepted" | "order_status_changed" | "review_created";
  message: string;
  is_read: boolean;
  event_key: string;
  related_object_id: number;
  created_at: string;
}

export interface Review {
  id: number;
  order: number;
  reviewer: number;
  reviewer_username: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioImage {
  id: number;
  image: string;
  caption: string;
  uploaded_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Specialty {
  id: number;
  name: string;
}

export interface TailorProfile {
  id: number;
  username: string;
  email: string;
  specialty: string;
  starting_price: string | null;
  work_location: string;
  working_hours: string;
  created_at: string;
  updated_at: string;
}
