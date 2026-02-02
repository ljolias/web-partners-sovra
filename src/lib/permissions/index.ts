// Role-Based Access Control (RBAC) System

export type UserRole = 'admin' | 'sales' | 'viewer';

export type Permission =
  | 'deals:view'
  | 'deals:create'
  | 'training:view'
  | 'legal:view'
  | 'commissions:view'
  | 'team:view';

// Permissions granted to each role
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'deals:view',
    'deals:create',
    'training:view',
    'legal:view',
    'commissions:view',
    'team:view',
  ],
  sales: [
    'deals:view',
    'deals:create',
    'training:view',
  ],
  viewer: [
    'deals:view',
    'training:view',
  ],
};

// Route to permission mapping
const routePermissions: Record<string, Permission> = {
  '/partners/portal/deals': 'deals:view',
  '/partners/portal/training': 'training:view',
  '/partners/portal/training-center': 'training:view',
  '/partners/portal/certifications': 'training:view',
  '/partners/portal/legal': 'legal:view',
  '/partners/portal/commissions': 'commissions:view',
  '/partners/portal/team': 'team:view',
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Remove locale prefix (e.g., /en, /es, /pt)
  const normalizedRoute = route.replace(/^\/[a-z]{2}/, '');

  // Dashboard is accessible to everyone
  if (normalizedRoute === '/partners/portal' || normalizedRoute === '/partners/portal/') {
    return true;
  }

  // Find matching route permission
  for (const [routePattern, permission] of Object.entries(routePermissions)) {
    if (normalizedRoute.startsWith(routePattern)) {
      return hasPermission(role, permission);
    }
  }

  // Default: allow access to routes not explicitly protected
  return true;
}

/**
 * Get the required permission for a route
 */
export function getRoutePermission(route: string): Permission | null {
  const normalizedRoute = route.replace(/^\/[a-z]{2}/, '');

  for (const [routePattern, permission] of Object.entries(routePermissions)) {
    if (normalizedRoute.startsWith(routePattern)) {
      return permission;
    }
  }

  return null;
}
