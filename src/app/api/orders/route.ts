import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '@/lib/whatsapp';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      district,
      postalCode,
      customerNotes,
      paymentMethod,
      items,
    } = body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
      return NextResponse.json(
        { error: 'Nama, No WhatsApp, Alamat Pengiriman, dan Produk pesanan wajib diisi' },
        { status: 400 }
      );
    }

    // Verify stock and calculate subtotal
    let calculatedSubtotal = 0;
    const validatedItems: {
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId || item.id },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Produk ${item.name || ''} tidak ditemukan` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok untuk produk ${product.name} tidak mencukupi (tersedia: ${product.stock})` },
          { status: 400 }
        );
      }

      const activePrice = product.discountPrice ?? product.price;
      const itemSubtotal = activePrice * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: activePrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create order and decrement stock
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          shippingAddress,
          city: city || 'Indonesia',
          district: district || null,
          postalCode: postalCode || null,
          customerNotes: customerNotes || null,
          paymentMethod: paymentMethod || 'WHATSAPP',
          status: 'NEW',
          subtotal: calculatedSubtotal,
          total: calculatedSubtotal,
          items: {
            create: validatedItems,
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Fetch site settings to generate WhatsApp URL if needed
    const siteSettings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const waNumber = siteSettings?.whatsappNumber || '6281234567890';
    const waTemplate = siteSettings?.whatsappTemplate;

    const waMessage = generateWhatsAppMessage({
      companyName: siteSettings?.companyName || 'Jangkriknet',
      whatsappNumber: waNumber,
      customTemplate: waTemplate,
      items: validatedItems.map((i) => ({
        name: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      total: calculatedSubtotal,
      customerName,
      phone: customerPhone,
      address: `${shippingAddress}, ${city || ''}`,
      notes: customerNotes,
    });

    const waUrl = generateWhatsAppUrl(waNumber, waMessage);

    return NextResponse.json({
      success: true,
      order,
      whatsappUrl: waUrl,
    });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
  }
}
