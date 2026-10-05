// ─── Auth-specific types ──────────────────────────────────────────────────────

import { Role } from "./types";

export interface SessionPayload {
  sub: string;        // userId
  email: string;
  name: string;
  role: Role;
  employeeId: string; // same as sub — explicit alias for clarity
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  position: string;
  avatar: string;
  passwordHash: string;
  isActive: boolean;
}

export interface ApiError {
  error: string;
}
