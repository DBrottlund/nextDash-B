export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
  isActive?: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface PermissionCheck {
  resource: string;
  action: string;
}