import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import initialData from './initialData.js';

// Writable state file (in /tmp for Vercel/lambda or local data dir)
const STATE_FILE = process.env.NODE_ENV === 'production'
  ? '/tmp/cutandlooks_state.json'
  : path.resolve(process.cwd(), 'data/cutandlooks_state.json');

// Global in-memory database store
let dbState = null;

function loadDatabase() {
  if (dbState) return dbState;

  // 1. Try reading from writable state file
  try {
    if (fs.existsSync(STATE_FILE)) {
      const content = fs.readFileSync(STATE_FILE, 'utf8');
      dbState = JSON.parse(content);
      return dbState;
    }
  } catch (err) {
    // ignore
  }

  // 2. Clone from bundled initialData
  try {
    dbState = JSON.parse(JSON.stringify(initialData));
    return dbState;
  } catch (err) {
    console.warn('Could not clone initial data:', err.message);
  }

  // 3. Fallback empty structure
  dbState = {
    profiles: [],
    business_settings: [],
    service_categories: [],
    services: [],
    appointments: [],
    enquiries: [],
    gallery_images: [],
    audit_logs: [],
  };
  return dbState;
}

function persistDatabase() {
  if (!dbState) return;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    // In read-only serverless filesystems without /tmp access, in-memory state is kept
  }
}

export function newUUID() {
  return crypto.randomUUID();
}

export function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'CNL-';
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

/**
 * Execute a query against the in-memory database
 */
export async function query(sql, params = []) {
  const db = loadDatabase();
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 1. BUSINESS SETTINGS
  if (/^SELECT\s+\*\s+FROM\s+business_settings/i.test(cleanSql)) {
    return db.business_settings || [];
  }

  // 2. PROFILES (AUTH)
  if (/^SELECT\s+.*?\s+FROM\s+profiles\s+WHERE\s+email\s*=\s*\?/i.test(cleanSql)) {
    const email = (params[0] || '').toLowerCase().trim();
    return (db.profiles || []).filter(p => (p.email || '').toLowerCase() === email);
  }
  if (/^SELECT\s+.*?\s+FROM\s+profiles\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
    const id = params[0];
    return (db.profiles || []).filter(p => p.id === id);
  }

  // 3. SERVICE CATEGORIES
  if (/^SELECT\s+\*\s+FROM\s+service_categories/i.test(cleanSql)) {
    let rows = [...(db.service_categories || [])];
    if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
      rows = rows.filter(r => r.id === params[0]);
    }
    // Sort display_order ASC, name ASC
    rows.sort((a, b) => (a.display_order - b.display_order) || (a.name || '').localeCompare(b.name || ''));
    return rows;
  }

  // 4. SERVICES (with optional join on service_categories)
  if (/^SELECT\s+.*?\s+FROM\s+services/i.test(cleanSql)) {
    let rows = (db.services || []).map(s => {
      const cat = (db.service_categories || []).find(c => c.id === s.category_id);
      return {
        ...s,
        category_name: cat ? cat.name : null,
      };
    });

    if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
      return rows.filter(r => r.id === params[0]);
    }
    if (/s\.is_active\s*=\s*1|is_active\s*=\s*1/i.test(cleanSql)) {
      rows = rows.filter(r => r.is_active === 1 || r.is_active === true);
    }
    if (/s\.category_id\s*=\s*\?/i.test(cleanSql) && params[0]) {
      rows = rows.filter(r => r.category_id === params[0]);
    }

    rows.sort((a, b) => (a.display_order - b.display_order) || (a.name || '').localeCompare(b.name || ''));
    return rows;
  }

  // 5. GALLERY IMAGES
  if (/^SELECT\s+\*\s+FROM\s+gallery_images/i.test(cleanSql)) {
    let rows = [...(db.gallery_images || [])];
    if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
      return rows.filter(r => r.id === params[0]);
    }
    if (/is_published\s*=\s*1/i.test(cleanSql)) {
      rows = rows.filter(r => r.is_published === 1 || r.is_published === true);
    }
    if (/category\s*=\s*\?/i.test(cleanSql) && params[0]) {
      rows = rows.filter(r => r.category === params[0]);
    }
    rows.sort((a, b) => (a.display_order - b.display_order) || (new Date(b.created_at) - new Date(a.created_at)));
    return rows;
  }

  // 6. APPOINTMENTS
  if (/^SELECT\s+.*?\s+FROM\s+appointments/i.test(cleanSql)) {
    // Check for COUNT query
    if (/count\(\*\)/i.test(cleanSql)) {
      let rows = db.appointments || [];
      if (/WHERE\s+status\s*=\s*['"]?Pending['"]?/i.test(cleanSql)) {
        rows = rows.filter(r => r.status === 'Pending');
      } else if (/WHERE\s+status\s*=\s*['"]?Confirmed['"]?/i.test(cleanSql)) {
        rows = rows.filter(r => r.status === 'Confirmed');
      } else if (/WHERE\s+status\s*=\s*['"]?Completed['"]?/i.test(cleanSql)) {
        rows = rows.filter(r => r.status === 'Completed');
      } else if (/WHERE\s+status\s+IN\s+\(['"]?Cancelled['"]?,\s*['"]?Rejected['"]?\)/i.test(cleanSql)) {
        rows = rows.filter(r => r.status === 'Cancelled' || r.status === 'Rejected');
      }
      return [{ count: rows.length }];
    }

    let rows = [...(db.appointments || [])];
    if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
      return rows.filter(r => r.id === params[0]);
    }
    if (/WHERE\s+appointment_date\s*=\s*\?\s+AND\s+start_time\s*=\s*\?/i.test(cleanSql)) {
      const [date, time] = params;
      return rows.filter(r =>
        r.appointment_date === date &&
        r.start_time === time &&
        (r.status === 'Pending' || r.status === 'Confirmed')
      );
    }
    if (/appointment_date\s*=\s*\?/i.test(cleanSql) && params.length >= 1) {
      rows = rows.filter(r => r.appointment_date === params[0]);
    }
    if (/status\s*=\s*\?/i.test(cleanSql)) {
      const statusIdx = cleanSql.indexOf('appointment_date') !== -1 ? 1 : 0;
      if (params[statusIdx]) {
        rows = rows.filter(r => r.status === params[statusIdx]);
      }
    }

    rows.sort((a, b) => {
      const dateCompare = (b.appointment_date || '').localeCompare(a.appointment_date || '');
      if (dateCompare !== 0) return dateCompare;
      return (b.start_time || '').localeCompare(a.start_time || '');
    });
    return rows;
  }

  // 7. ENQUIRIES
  if (/^SELECT\s+.*?\s+FROM\s+enquiries/i.test(cleanSql)) {
    if (/count\(\*\)/i.test(cleanSql)) {
      let rows = db.enquiries || [];
      if (/WHERE\s+status\s*=\s*['"]?New['"]?/i.test(cleanSql)) {
        rows = rows.filter(r => r.status === 'New');
      }
      return [{ count: rows.length }];
    }

    let rows = [...(db.enquiries || [])];
    if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
      return rows.filter(r => r.id === params[0]);
    }
    if (/status\s*=\s*\?/i.test(cleanSql) && params[0]) {
      rows = rows.filter(r => r.status === params[0]);
    }

    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return rows;
  }

  // 8. AUDIT LOGS
  if (/^SELECT\s+.*?\s+FROM\s+audit_logs/i.test(cleanSql)) {
    return (db.audit_logs || []).slice(-100);
  }

  console.warn('Unhandled query fallback:', cleanSql);
  return [];
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE
 */
export async function execute(sql, params = []) {
  const db = loadDatabase();
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 1. UPDATE BUSINESS SETTINGS
  if (/^UPDATE\s+business_settings/i.test(cleanSql)) {
    if (db.business_settings && db.business_settings[0]) {
      const s = db.business_settings[0];
      s.business_name = params[0] !== undefined ? params[0] : s.business_name;
      s.description = params[1] !== undefined ? params[1] : s.description;
      s.address = params[2] !== undefined ? params[2] : s.address;
      s.phone = params[3] !== undefined ? params[3] : s.phone;
      s.email = params[4] !== undefined ? params[4] : s.email;
      s.logo_url = params[5] !== undefined ? params[5] : s.logo_url;
      s.google_maps_url = params[6] !== undefined ? params[6] : s.google_maps_url;
      s.google_reviews_url = params[7] !== undefined ? params[7] : s.google_reviews_url;
      s.opening_hours = params[8] !== undefined ? params[8] : s.opening_hours;
      s.social_links = params[9] !== undefined ? params[9] : s.social_links;
      s.booking_settings = params[10] !== undefined ? params[10] : s.booking_settings;
      s.seo_title = params[11] !== undefined ? params[11] : s.seo_title;
      s.seo_description = params[12] !== undefined ? params[12] : s.seo_description;
      s.updated_at = params[13] || new Date().toISOString();
      persistDatabase();
    }
    return { changes: 1 };
  }

  // 2. INSERT APPOINTMENT
  if (/^INSERT\s+INTO\s+appointments/i.test(cleanSql)) {
    const newAppointment = {
      id: params[0],
      booking_reference: params[1],
      customer_name: params[2],
      customer_phone: params[3],
      customer_email: params[4],
      service_id: params[5],
      service_name_snapshot: params[6],
      service_price_snapshot: params[7],
      appointment_date: params[8],
      start_time: params[9],
      end_time: params[10],
      preferred_stylist: params[11],
      customer_message: params[12],
      status: 'Pending',
      admin_notes: null,
      privacy_consent: 1,
      created_at: params[13] || new Date().toISOString(),
      updated_at: params[14] || new Date().toISOString(),
      confirmed_at: null,
      cancelled_at: null,
    };
    db.appointments = db.appointments || [];
    db.appointments.push(newAppointment);
    persistDatabase();
    return { changes: 1, id: newAppointment.id };
  }

  // 3. UPDATE APPOINTMENT
  if (/^UPDATE\s+appointments/i.test(cleanSql)) {
    const id = params[params.length - 1];
    const appt = (db.appointments || []).find(a => a.id === id);
    if (appt) {
      if (/status\s*=\s*\?/i.test(cleanSql)) {
        appt.status = params[0];
        appt.admin_notes = params[1] !== undefined ? params[1] : appt.admin_notes;
        appt.confirmed_at = params[2] !== undefined ? params[2] : appt.confirmed_at;
        appt.cancelled_at = params[3] !== undefined ? params[3] : appt.cancelled_at;
        appt.appointment_date = params[4] !== undefined ? params[4] : appt.appointment_date;
        appt.start_time = params[5] !== undefined ? params[5] : appt.start_time;
        appt.updated_at = params[6] || new Date().toISOString();
      }
      persistDatabase();
    }
    return { changes: appt ? 1 : 0 };
  }

  // 4. INSERT ENQUIRY
  if (/^INSERT\s+INTO\s+enquiries/i.test(cleanSql)) {
    const newEnquiry = {
      id: params[0],
      customer_name: params[1],
      customer_phone: params[2],
      customer_email: params[3],
      subject: params[4],
      message: params[5],
      status: 'New',
      admin_notes: null,
      created_at: params[6] || new Date().toISOString(),
      updated_at: params[7] || new Date().toISOString(),
    };
    db.enquiries = db.enquiries || [];
    db.enquiries.push(newEnquiry);
    persistDatabase();
    return { changes: 1, id: newEnquiry.id };
  }

  // 5. UPDATE ENQUIRY
  if (/^UPDATE\s+enquiries/i.test(cleanSql)) {
    const id = params[params.length - 1];
    const enq = (db.enquiries || []).find(e => e.id === id);
    if (enq) {
      enq.status = params[0];
      enq.admin_notes = params[1] !== undefined ? params[1] : enq.admin_notes;
      enq.updated_at = params[2] || new Date().toISOString();
      persistDatabase();
    }
    return { changes: enq ? 1 : 0 };
  }

  // 6. INSERT SERVICE
  if (/^INSERT\s+INTO\s+services/i.test(cleanSql)) {
    const newService = {
      id: params[0],
      category_id: params[1],
      name: params[2],
      slug: params[3],
      description: params[4],
      image_url: params[5],
      price_inr: params[6],
      starting_price_inr: params[7],
      duration_minutes: params[8],
      is_active: params[9],
      display_order: params[10],
      created_at: params[11] || new Date().toISOString(),
      updated_at: params[12] || new Date().toISOString(),
    };
    db.services = db.services || [];
    db.services.push(newService);
    persistDatabase();
    return { changes: 1, id: newService.id };
  }

  // 7. UPDATE SERVICE
  if (/^UPDATE\s+services/i.test(cleanSql)) {
    const id = params[params.length - 1];
    const srv = (db.services || []).find(s => s.id === id);
    if (srv) {
      srv.category_id = params[0];
      srv.name = params[1];
      srv.slug = params[2];
      srv.description = params[3];
      srv.image_url = params[4];
      srv.price_inr = params[5];
      srv.starting_price_inr = params[6];
      srv.duration_minutes = params[7];
      srv.is_active = params[8];
      srv.display_order = params[9];
      srv.updated_at = params[10] || new Date().toISOString();
      persistDatabase();
    }
    return { changes: srv ? 1 : 0 };
  }

  // 8. DELETE SERVICE
  if (/^DELETE\s+FROM\s+services/i.test(cleanSql)) {
    const id = params[0];
    db.services = (db.services || []).filter(s => s.id !== id);
    persistDatabase();
    return { changes: 1 };
  }

  // 9. INSERT SERVICE CATEGORY
  if (/^INSERT\s+INTO\s+service_categories/i.test(cleanSql)) {
    const newCat = {
      id: params[0],
      name: params[1],
      slug: params[2],
      description: params[3],
      display_order: params[4],
      created_at: params[5] || new Date().toISOString(),
      updated_at: params[6] || new Date().toISOString(),
    };
    db.service_categories = db.service_categories || [];
    db.service_categories.push(newCat);
    persistDatabase();
    return { changes: 1, id: newCat.id };
  }

  // 10. UPDATE SERVICE CATEGORY
  if (/^UPDATE\s+service_categories/i.test(cleanSql)) {
    const id = params[params.length - 1];
    const cat = (db.service_categories || []).find(c => c.id === id);
    if (cat) {
      cat.name = params[0];
      cat.slug = params[1];
      cat.description = params[2];
      cat.display_order = params[3];
      cat.updated_at = params[4] || new Date().toISOString();
      persistDatabase();
    }
    return { changes: cat ? 1 : 0 };
  }

  // 11. DELETE SERVICE CATEGORY
  if (/^DELETE\s+FROM\s+service_categories/i.test(cleanSql)) {
    const id = params[0];
    db.service_categories = (db.service_categories || []).filter(c => c.id !== id);
    // Unlink services
    (db.services || []).forEach(s => {
      if (s.category_id === id) s.category_id = null;
    });
    persistDatabase();
    return { changes: 1 };
  }

  // 12. INSERT GALLERY IMAGE
  if (/^INSERT\s+INTO\s+gallery_images/i.test(cleanSql)) {
    const newImg = {
      id: params[0],
      image_url: params[1],
      caption: params[2],
      category: params[3],
      alt_text: params[4],
      display_order: params[5],
      is_published: params[6],
      created_at: params[7] || new Date().toISOString(),
      updated_at: params[8] || new Date().toISOString(),
    };
    db.gallery_images = db.gallery_images || [];
    db.gallery_images.push(newImg);
    persistDatabase();
    return { changes: 1, id: newImg.id };
  }

  // 13. UPDATE GALLERY IMAGE
  if (/^UPDATE\s+gallery_images/i.test(cleanSql)) {
    const id = params[params.length - 1];
    const img = (db.gallery_images || []).find(g => g.id === id);
    if (img) {
      img.image_url = params[0];
      img.caption = params[1];
      img.category = params[2];
      img.alt_text = params[3];
      img.display_order = params[4];
      img.is_published = params[5];
      img.updated_at = params[6] || new Date().toISOString();
      persistDatabase();
    }
    return { changes: img ? 1 : 0 };
  }

  // 14. DELETE GALLERY IMAGE
  if (/^DELETE\s+FROM\s+gallery_images/i.test(cleanSql)) {
    const id = params[0];
    db.gallery_images = (db.gallery_images || []).filter(g => g.id !== id);
    persistDatabase();
    return { changes: 1 };
  }

  // 15. INSERT AUDIT LOG
  if (/^INSERT\s+INTO\s+audit_logs/i.test(cleanSql)) {
    const log = {
      id: params[0],
      admin_user_id: params[1],
      action: params[2],
      entity_type: params[3],
      entity_id: params[4],
      created_at: params[5] || new Date().toISOString(),
      metadata: params[6] || '{}',
    };
    db.audit_logs = db.audit_logs || [];
    db.audit_logs.push(log);
    persistDatabase();
    return { changes: 1 };
  }

  console.warn('Unhandled execute statement:', cleanSql);
  return { changes: 0 };
}

export async function transaction(statements = []) {
  const results = [];
  for (const stmt of statements) {
    if (typeof stmt === 'string') {
      results.push(await execute(stmt, []));
    } else {
      results.push(await execute(stmt.sql, stmt.params || []));
    }
  }
  return results;
}
