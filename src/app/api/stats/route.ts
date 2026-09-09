import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalCategories,
      totalOrders,
      newOrders,
      ordersWithTotal,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'NEW' } }),
      prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ]);

    const totalRevenue = ordersWithTotal.reduce((sum, o) => sum + o.total, 0);

    // Top selling products based on order items
    const topItems = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalCategories,
        totalOrders,
        newOrders,
        totalRevenue,
      },
      recentOrders,
      topItems: topItems.map((item) => ({
        name: item.productName,
        totalSold: item._sum.quantity || 0,
        revenue: item._sum.subtotal || 0,
      })),
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik' }, { status: 500 });
  }
}
