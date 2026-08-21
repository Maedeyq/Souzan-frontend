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
