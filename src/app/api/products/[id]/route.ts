import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Support querying by ID or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: 'asc' } },
        specs: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const slug = body.slug ? slugify(body.slug) : undefined;

    // Update specs if provided
    if (Array.isArray(body.specs)) {
      await prisma.productSpecification.deleteMany({ where: { productId: id } });
      await prisma.productSpecification.createMany({
        data: body.specs.map((spec: { key: string; value: string }, idx: number) => ({
          productId: id,
          key: spec.key,
          value: spec.value,
          order: idx + 1,
        })),
      });
    }

    // Update images if provided
    if (Array.isArray(body.images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: body.images.map((img: { imageUrl: string; isPrimary?: boolean; order?: number }, idx: number) => ({
          productId: id,
          imageUrl: typeof img === 'string' ? img : img.imageUrl,
          isPrimary: img.isPrimary ?? idx === 0,
          order: img.order ?? idx + 1,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        sku: body.sku ? body.sku.trim() : undefined,
        name: body.name ? body.name.trim() : undefined,
        slug,
        shortDesc: body.shortDesc,
        longDesc: body.longDesc,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        discountPrice: body.discountPrice !== undefined ? (body.discountPrice ? parseFloat(body.discountPrice) : null) : undefined,
        stock: body.stock !== undefined ? parseInt(body.stock, 10) : undefined,
        weight: body.weight !== undefined ? (body.weight ? parseFloat(body.weight) : null) : undefined,
        dimensions: body.dimensions,
        categoryId: body.categoryId !== undefined ? body.categoryId || null : undefined,
        brandId: body.brandId !== undefined ? body.brandId || null : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        mainImage: body.mainImage,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
      },
      include: {
        category: true,
        images: true,
        specs: true,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Product PUT error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'SKU atau Slug produk sudah digunakan oleh produk lain' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}
