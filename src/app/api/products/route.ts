import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'latest'; // latest, price-asc, price-desc, featured
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDesc: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (featured) {
      where.isFeatured = true;
    }

    // Determine sort ordering
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'featured') {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { order: 'asc' } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    if (!body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { error: 'Nama, SKU, dan Harga wajib diisi' },
        { status: 400 }
      );
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const product = await prisma.product.create({
      data: {
        sku: body.sku.trim(),
        name: body.name.trim(),
        slug,
        shortDesc: body.shortDesc || '',
        longDesc: body.longDesc || '',
        price: parseFloat(body.price),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        stock: parseInt(body.stock || '0', 10),
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions: body.dimensions || '',
        categoryId: body.categoryId || null,
        brandId: body.brandId || null,
        isFeatured: Boolean(body.isFeatured),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        mainImage: body.mainImage || '',
        seoTitle: body.seoTitle || body.name,
        seoDesc: body.seoDesc || body.shortDesc,
        images: Array.isArray(body.images)
          ? {
              create: body.images.map((img: { imageUrl: string; isPrimary?: boolean; order?: number }, idx: number) => ({
                imageUrl: typeof img === 'string' ? img : img.imageUrl,
                isPrimary: img.isPrimary ?? idx === 0,
                order: img.order ?? idx + 1,
              })),
            }
          : undefined,
        specs: Array.isArray(body.specs)
          ? {
              create: body.specs.map((spec: { key: string; value: string }, idx: number) => ({
                key: spec.key,
                value: spec.value,
                order: idx + 1,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        specs: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Product POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'SKU atau Slug produk sudah digunakan oleh produk lain' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Gagal membuat produk' }, { status: 500 });
  }
}
