'use server';

import { RBACAdminService } from 'services/rbac_admin_service';
import { RBACApplyChangesRequest } from 'types';
import { FEATURES, PERMISSIONS, ROLES, Role } from 'rbac/constants';
import { logger } from '@/lib/logger';
import { assertPermission } from 'server/rbac';

export async function applyRbacChangesAction(request: RBACApplyChangesRequest, actorId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Server-side permission enforcement
    // Assuming the actor needs to have 'EDIT' permission on 'ACCESS_CONTROL' feature to apply RBAC changes
    await assertPermission({ userId: actorId, tenantId: request.tenantId, role: ROLES.HOST_ADMIN as Role }, FEATURES.ACCESS_CONTROL, PERMISSIONS.EDIT);

    // If permission is granted, proceed with applying changes
    const result = await RBACAdminService.applyChanges(request);
    return result;
  } catch (error) {
        logger.error("Server Action: Failed to apply RBAC changes", {
      tenantId: request.tenantId,
      userId: actorId,
      action: "applyRbacChangesAction",
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during RBAC changes',
    };
  }
}






