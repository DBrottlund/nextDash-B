import { User, PermissionCheck } from '@/types';

export const permissions = {
  // Check if user has specific permission
  hasPermission(user: User, resource: string, action: string): boolean {
    if (!user.permissions || !user.permissions[resource]) {
      return false;
    }

    return user.permissions[resource].includes(action);
  },

  // Check multiple permissions (user must have ALL)
  hasAllPermissions(user: User, checks: PermissionCheck[]): boolean {
    return checks.every(check => 
      this.hasPermission(user, check.resource, check.action)
    );
  },

  // Check multiple permissions (user must have ANY)
  hasAnyPermission(user: User, checks: PermissionCheck[]): boolean {
    return checks.some(check => 
      this.hasPermission(user, check.resource, check.action)
    );
  },

  // Check if user is admin
  isAdmin(user: User): boolean {
    return user.roleId === 1 || this.hasPermission(user, 'admin', 'access');
  },

  // Check if user is manager or higher
  isManagerOrAbove(user: User): boolean {
    return user.roleId <= 2 || this.isAdmin(user);
  },

  // Check if user can access resource
  canAccess(user: User, resource: string): boolean {
    return user.permissions && !!user.permissions[resource];
  },

  // Get user's permissions for a resource
  getResourcePermissions(user: User, resource: string): string[] {
    return user.permissions?.[resource] || [];
  },

  // Check if user can manage other users
  canManageUsers(user: User): boolean {
    return this.hasAnyPermission(user, [
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' }
    ]);
  },

  // Check if user can manage roles
  canManageRoles(user: User): boolean {
    return this.hasAnyPermission(user, [
      { resource: 'roles', action: 'create' },
      { resource: 'roles', action: 'update' },
      { resource: 'roles', action: 'delete' }
    ]);
  },

  // Check if user can access admin panel
  canAccessAdmin(user: User): boolean {
    return this.hasPermission(user, 'admin', 'access');
  },

  // Filter menu items based on user permissions
  filterMenuItems(menuItems: any[], user: User): any[] {
    return menuItems.filter(item => {
      // If no role requirement, allow access
      if (!item.requiredRoleId) return true;
      
      // Check if user's role meets minimum requirement
      return user.roleId <= item.requiredRoleId;
    }).map(item => ({
      ...item,
      children: item.children ? this.filterMenuItems(item.children, user) : undefined
    }));
  }
};

export default permissions;