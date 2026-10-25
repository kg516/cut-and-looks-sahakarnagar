import { NextResponse } from 'next/server';
import { query, execute, newUUID } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { logAudit } from '@/lib/settings';

// Public GET gallery images
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('all') === 'true';
    const category = searchParams.get('category');

    let sql = 'SELECT * FROM gallery_images WHERE 1=1';
    const params = [];

    if (!includeUnpublished) {
      sql += ' AND is_published = 1';
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const images = await query(sql, params);
    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error('Gallery GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
  }
}

// Admin POST image
export async function POST(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image_url, caption, category, alt_text, display_order, is_published } = body;

    if (!image_url || !image_url.trim()) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const id = newUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO gallery_images (id, image_url, caption, category, alt_text, display_order, is_published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        image_url.trim(),
        caption ? caption.trim() : null,
        category ? category.trim() : 'General',
        alt_text ? alt_text.trim() : caption || 'Cut & Looks Sahakar Nagar',
        display_order !== undefined ? parseInt(display_order, 10) : 0,
        is_published !== undefined ? (is_published ? 1 : 0) : 1,
        now,
        now,
      ]
    );

    await logAudit(admin.id, 'ADD_GALLERY_IMAGE', 'gallery_images', id);
    return NextResponse.json({ success: true, imageId: id });
  } catch (err) {
    console.error('Gallery POST error:', err);
    return NextResponse.json({ error: 'Failed to add gallery image' }, { status: 500 });
  }
}

// Admin PUT image
export async function PUT(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, image_url, caption, category, alt_text, display_order, is_published } = body;

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    await execute(
      `UPDATE gallery_images SET
        image_url = COALESCE(?, image_url),
        caption = COALESCE(?, caption),
        category = COALESCE(?, category),
        alt_text = COALESCE(?, alt_text),
        display_order = COALESCE(?, display_order),
        is_published = COALESCE(?, is_published),
        updated_at = ?
      WHERE id = ?`,
      [
        image_url || null,
        caption !== undefined ? caption : null,
        category !== undefined ? category : null,
        alt_text !== undefined ? alt_text : null,
        display_order !== undefined ? parseInt(display_order, 10) : null,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        now,
        id,
      ]
    );

    await logAudit(admin.id, 'UPDATE_GALLERY_IMAGE', 'gallery_images', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Gallery PUT error:', err);
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 });
  }
}

// Admin DELETE image
export async function DELETE(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await execute('DELETE FROM gallery_images WHERE id = ?', [id]);
    await logAudit(admin.id, 'DELETE_GALLERY_IMAGE', 'gallery_images', id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Gallery DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 });
  }
}
