import { queryOne, execute, newUUID } from './db.js';

export async function getBusinessSettings() {
  const row = await queryOne('SELECT * FROM business_settings LIMIT 1');
  if (!row) return null;

  return {
    ...row,
    opening_hours: typeof row.opening_hours === 'string' ? JSON.parse(row.opening_hours) : row.opening_hours,
    social_links: typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links,
    booking_settings: typeof row.booking_settings === 'string' ? JSON.parse(row.booking_settings) : row.booking_settings,
  };
}

export async function logAudit(adminUserId, action, entityType, entityId = null, metadata = {}) {
  try {
    const id = newUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO audit_logs (id, admin_user_id, action, entity_type, entity_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, adminUserId, action, entityType, entityId, now, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
