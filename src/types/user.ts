export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  permissions: Record<string, string[]>;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
  isActive?: boolean;
  avatarUrl?: string;
}

export interface UserFilters {
  role?: number;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}