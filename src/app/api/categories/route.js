import { NextResponse } from 'next/server';
import { query, execute, newUUID } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { logAudit } from '@/lib/settings';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    let sql = 'SELECT * FROM service_categories';
    if (!includeInactive) {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY display_order ASC, name ASC';

    const categories = await query(sql);
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error('Categories GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, display_order, is_active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = newUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO service_categories (id, name, slug, description, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        slug,
        description ? description.trim() : null,
        display_order !== undefined ? parseInt(display_order, 10) : 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        now,
        now
      ]
    );

    await logAudit(admin.id, 'CREATE_CATEGORY', 'service_categories', id, { name });
    return NextResponse.json({ success: true, categoryId: id });
  } catch (err) {
    console.error('Categories POST error:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    let slug = undefined;
    if (name) {
      slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await execute(
      `UPDATE service_categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = ?
      WHERE id = ?`,
      [
        name ? name.trim() : null,
        slug || null,
        description !== undefined ? description : null,
        display_order !== undefined ? parseInt(display_order, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        now,
        id
      ]
    );

    await logAudit(admin.id, 'UPDATE_CATEGORY', 'service_categories', id, { name });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Categories PUT error:', err);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Set referencing services category_id to NULL
    await execute('UPDATE services SET category_id = NULL WHERE category_id = ?', [id]);
    await execute('DELETE FROM service_categories WHERE id = ?', [id]);

    await logAudit(admin.id, 'DELETE_CATEGORY', 'service_categories', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Categories DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
