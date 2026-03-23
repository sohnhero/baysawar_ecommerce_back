import { sql, count } from "drizzle-orm";
import { db } from "../../lib/db";
import { orders, products, users, categories, orderItems } from "../../db/schema";

export const getDashboardStats = async (timeRange: string = '30d') => {
  let interval = '30 days';
  if (timeRange === '7d') interval = '7 days';
  else if (timeRange === '90d') interval = '90 days';
  else if (timeRange === '12m') interval = '12 months';
  else if (timeRange === 'all') interval = '100 years';

  const timeFilter = sql`${orders.createdAt} > now() - (${interval})::interval`;

  const [orderCount] = await db.select({ count: count() }).from(orders).where(timeFilter);
  const [productCount] = await db.select({ count: count() }).from(products);
  const [userCount] = await db.select({ count: count() }).from(users);
  
  const [totalRevenue] = await db.select({ 
    total: sql<string>`sum(${orders.totalAmount})` 
  }).from(orders).where(timeFilter);

  // Get recent orders (always last 5, regardless of filter for UI density)
  const recentOrders = await db.query.orders.findMany({
    limit: 5,
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        }
      }
    }
  });

  // Get order counts by status (within time range)
  const ordersByStatus = await db.select({
    status: orders.status,
    count: count()
  }).from(orders).where(timeFilter).groupBy(orders.status);

  const statusMap = ordersByStatus.reduce((acc: any, curr) => {
    acc[curr.status] = Number(curr.count);
    return acc;
  }, {});

  // Get sales by category
  const salesByCategory = await db.select({
    name: categories.name,
    value: sql<number>`count(${orderItems.id})::int`
  })
  .from(orderItems)
  .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
  .innerJoin(categories, sql`${products.categoryId} = ${categories.id}`)
  .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
  .where(timeFilter)
  .groupBy(categories.name);

  // Get top products
  const topProducts = await db.select({
    id: products.id,
    name: products.name,
    image: products.image,
    sales: sql<number>`count(${orderItems.id})::int`,
    revenue: sql<number>`sum(${orderItems.price} * ${orderItems.quantity})::float`
  })
  .from(orderItems)
  .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
  .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
  .where(timeFilter)
  .groupBy(products.id, products.name, products.image)
  .orderBy(sql`sum(${orderItems.price} * ${orderItems.quantity}) desc`)
  .limit(5);

  // Get monthly/daily sales for the chart based on range
  const dateFormat = (timeRange === '7d' || timeRange === '30d') ? 'DD Mon' : 'Mon';
  const grain = (timeRange === '7d' || timeRange === '30d') ? 'day' : 'month';

  const salesTrend = await db.execute(sql`
    SELECT 
      to_char(o.created_at, ${dateFormat}) as label,
      sum(o.total_amount)::float as revenue,
      count(o.id)::int as orders
    FROM ${orders} o
    WHERE o.created_at > now() - (${interval})::interval
    GROUP BY label, date_trunc(${sql.raw(`'${grain}'`)}, o.created_at)
    ORDER BY date_trunc(${sql.raw(`'${grain}'`)}, o.created_at)
  `);

  return {
    totalOrders: Number(orderCount.count),
    totalProducts: Number(productCount.count),
    totalUsers: Number(userCount.count),
    totalRevenue: parseFloat(totalRevenue.total || "0"),
    recentOrders: recentOrders.map(o => ({
        ...o,
        id: o.id,
        customer: o.user?.name || "Client Anonyme",
        date: new Date(o.createdAt).toLocaleDateString(),
        amount: parseFloat(o.totalAmount),
    })),
    ordersByStatus: statusMap,
    salesTrend,
    salesByCategory,
    topProducts,
  };
};
