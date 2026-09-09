import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    let data = [];

    switch (type) {
      case 'banners':
        data = await prisma.banner.findMany({ orderBy: { order: 'asc' } });
        break;
      case 'testimonials':
        data = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
        break;
      case 'faqs':
        data = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
        break;
      case 'gallery':
        data = await prisma.gallery.findMany({ orderBy: { order: 'asc' } });
        break;
      default:
        return NextResponse.json({ error: 'Tipe konten tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    console.error(`Content GET ${params} error:`, error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type } = await params;
    const body = await req.json();
    let created;

    switch (type) {
      case 'banners':
        created = await prisma.banner.create({
          data: {
            title: body.title,
            subtitle: body.subtitle || '',
            imageUrl: body.imageUrl,
            linkUrl: body.linkUrl || '',
            buttonText: body.buttonText || 'Lihat Selengkapnya',
            order: body.order || 0,
            isActive: body.isActive ?? true,
          },
        });
        break;
      case 'testimonials':
        created = await prisma.testimonial.create({
          data: {
            name: body.name,
            role: body.role || '',
            company: body.company || '',
            avatarUrl: body.avatarUrl || '',
            content: body.content,
            rating: body.rating || 5,
            order: body.order || 0,
            isActive: body.isActive ?? true,
          },
        });
        break;
      case 'faqs':
        created = await prisma.faq.create({
          data: {
            question: body.question,
            answer: body.answer,
            order: body.order || 0,
            isActive: body.isActive ?? true,
          },
        });
        break;
      case 'gallery':
        created = await prisma.gallery.create({
          data: {
            title: body.title,
            imageUrl: body.imageUrl,
            category: body.category || 'Kegiatan',
            order: body.order || 0,
            isActive: body.isActive ?? true,
          },
        });
        break;
      default:
        return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error('Content POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat konten' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    switch (type) {
      case 'banners':
        await prisma.banner.delete({ where: { id } });
        break;
      case 'testimonials':
        await prisma.testimonial.delete({ where: { id } });
        break;
      case 'faqs':
        await prisma.faq.delete({ where: { id } });
        break;
      case 'gallery':
        await prisma.gallery.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Item berhasil dihapus' });
  } catch (error) {
    console.error('Content DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus item' }, { status: 500 });
  }
}
