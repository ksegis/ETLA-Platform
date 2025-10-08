// Re-export the canonical RBAC constants to avoid duplication/drift.
// Do NOT introduce extra role names here.
export {
  FEATURES,
  PERMISSIONS,
  ROLES,
  ALL_ROLES,
  FEATURES_LEGACY,
  PERMISSIONS_LEGACY,
} from '@/rbac/constants';

export type { Feature, Permission, Role } from '@/rbac/constants';
