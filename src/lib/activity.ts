import { supabase } from './supabase';

export async function logActivity(
  workspaceId: string,
  userId: string,
  userName: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  await supabase.from('activity_log').insert({
    workspace_id: workspaceId,
    user_id: userId,
    user_name: userName,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details || {},
  });
}
