import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail pesanan' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const newStatus = body.status;

    if (!newStatus) {
      return NextResponse.json({ error: 'Status pesanan wajib diisi' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If moving from active to CANCELLED, restore stock
      if (existingOrder.status !== 'CANCELLED' && newStatus === 'CANCELLED') {
        for (const item of existingOrder.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            }).catch((err) => console.warn(`Could not restore stock for product ${item.productId}:`, err));
          }
        }
      }
      // If moving from CANCELLED back to active, decrement stock
      else if (existingOrder.status === 'CANCELLED' && newStatus !== 'CANCELLED') {
        for (const item of existingOrder.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            }).catch((err) => console.warn(`Could not decrement stock for product ${item.productId}:`, err));
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status pesanan' }, { status: 500 });
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // If order was not cancelled, return stock to products before deletion
      if (existingOrder.status !== 'CANCELLED') {
        for (const item of existingOrder.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            }).catch((err) => console.warn(`Could not restore stock for product ${item.productId}:`, err));
          }
        }
      }

      // Delete the order (items cascade if defined in schema, or delete explicitly)
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      await tx.order.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 });
  }
}
