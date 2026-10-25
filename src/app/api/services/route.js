import { NextResponse } from 'next/server';
import { query, execute, newUUID } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { logAudit } from '@/lib/settings';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    const categorySlug = searchParams.get('category');
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('q');

    let sql = `
      SELECT s.*, c.name as category_name, c.slug as category_slug
      FROM services s
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (!includeInactive) {
      sql += ' AND s.is_active = 1';
    }

    if (categoryId) {
      sql += ' AND s.category_id = ?';
      params.push(categoryId);
    } else if (categorySlug && categorySlug !== 'all') {
      sql += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    if (search && search.trim()) {
      sql += ' AND (s.name LIKE ? OR s.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY s.display_order ASC, s.name ASC';

    const services = await query(sql, params);
    return NextResponse.json({ success: true, services });
  } catch (err) {
    console.error('Services GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category_id,
      description,
      image_url,
      price_inr,
      starting_price_inr,
      duration_minutes,
      is_active,
      display_order,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    const id = newUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO services 
       (id, category_id, name, slug, description, image_url, price_inr, starting_price_inr, duration_minutes, is_active, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        category_id || null,
        name.trim(),
        slug,
        description ? description.trim() : '',
        image_url || null,
        price_inr !== null && price_inr !== undefined && price_inr !== '' ? parseFloat(price_inr) : null,
        starting_price_inr !== null && starting_price_inr !== undefined && starting_price_inr !== '' ? parseFloat(starting_price_inr) : null,
        duration_minutes ? parseInt(duration_minutes, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        display_order !== undefined ? parseInt(display_order, 10) : 0,
        now,
        now,
      ]
    );

    await logAudit(admin.id, 'CREATE_SERVICE', 'services', id, { name });
    return NextResponse.json({ success: true, serviceId: id });
  } catch (err) {
    console.error('Services POST error:', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      category_id,
      description,
      image_url,
      price_inr,
      starting_price_inr,
      duration_minutes,
      is_active,
      display_order,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    await execute(
      `UPDATE services SET
        name = COALESCE(?, name),
        category_id = ?,
        description = COALESCE(?, description),
        image_url = ?,
        price_inr = ?,
        starting_price_inr = ?,
        duration_minutes = ?,
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order),
        updated_at = ?
      WHERE id = ?`,
      [
        name ? name.trim() : null,
        category_id || null,
        description !== undefined ? description : null,
        image_url !== undefined ? image_url : null,
        price_inr !== null && price_inr !== undefined && price_inr !== '' ? parseFloat(price_inr) : null,
        starting_price_inr !== null && starting_price_inr !== undefined && starting_price_inr !== '' ? parseFloat(starting_price_inr) : null,
        duration_minutes ? parseInt(duration_minutes, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        display_order !== undefined ? parseInt(display_order, 10) : null,
        now,
        id,
      ]
    );

    await logAudit(admin.id, 'UPDATE_SERVICE', 'services', id, { name });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Services PUT error:', err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    await execute('DELETE FROM services WHERE id = ?', [id]);
    await logAudit(admin.id, 'DELETE_SERVICE', 'services', id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Services DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
