import { prisma } from "../config/db";

export const getDashboardMetrics = async (userId: string) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Faturamento de Hoje
  const todaySales = await prisma.sale.aggregate({
    _sum: {
      total: true
    },
    where: {
      userId,
      createdAt: {
        gte: startOfDay
      }
    }
  });
  const todaySalesTotal = Number(todaySales._sum.total || 0);

  // Faturamento do Mês
  const monthSales = await prisma.sale.aggregate({
    _sum: {
      total: true
    },
    where: {
      userId,
      createdAt: {
        gte: startOfMonth
      }
    }
  });
  const monthSalesTotal = Number(monthSales._sum.total || 0);

  // Total de Vendas
  const totalSalesCount = await prisma.sale.count({
    where: {
      userId
    }
  });

  // Estoque Baixo (<= 5)
  const lowStockProducts = await prisma.product.findMany({
    where: {
      userId,
      quantity: {
        lte: 5
      }
    },
    orderBy: {
      quantity: "asc"
    },
    take: 10
  });
  const lowStockCount = await prisma.product.count({
    where: {
      userId,
      quantity: {
        lte: 5
      }
    }
  });

  // Produtos Mais Vendidos (Curva ABC)
  const saleItemsGroup = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
      subtotal: true
    },
    where: {
      sale: {
        userId
      }
    },
    orderBy: {
      _sum: {
        quantity: "desc"
      }
    },
    take: 5
  });

  const productIds = saleItemsGroup.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      }
    }
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const topProducts = saleItemsGroup.map((g) => ({
    productId: g.productId,
    name: productMap.get(g.productId) || "Produto Excluído",
    totalQuantity: g._sum.quantity || 0,
    totalRevenue: Number(g._sum.subtotal || 0)
  }));

  // Últimas Vendas
  const recentSalesRaw = await prisma.sale.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5,
    include: {
      saleItems: true
    }
  });

  const recentSales = recentSalesRaw.map((sale) => ({
    id: sale.id,
    total: Number(sale.total),
    paymentMethod: sale.paymentMethod,
    createdAt: sale.createdAt.toISOString(),
    itemsCount: sale.saleItems.reduce((sum, item) => sum + item.quantity, 0)
  }));

  return {
    todaySalesTotal,
    monthSalesTotal,
    totalSalesCount,
    lowStockCount,
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      quantity: p.quantity,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    })),
    topProducts,
    recentSales
  };
};
