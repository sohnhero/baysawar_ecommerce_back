import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { users } from "../../db/schema";

export const getAllUsers = async () => {
  const usersWithOrders = await db.query.users.findMany({
    columns: { password: false },
    with: {
      orders: true,
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return usersWithOrders.map(user => {
    const orders = user.orders || [];
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || "0"), 0);
    
    // Remove orders array from response to keep it clean if desired, 
    // but keep stats
    const { orders: _, ...userData } = user;
    return {
      ...userData,
      orderCount: orders.length,
      totalSpent
    };
  });
};

export const updateUserRole = async (id: string, role: string) => {
  const result = await db.update(users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });
  return result[0];
};

export const deleteUser = async (id: string) => {
  return await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
};

export const updateProfile = async (id: string, data: any) => {
  const result = await db.update(users)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      phone: users.phone,
      address: users.address,
      role: users.role,
      createdAt: users.createdAt,
    });
  return result[0];
};

export const getUserStats = async () => {
  const allUsersWithOrders = await db.query.users.findMany({
    with: {
      orders: true,
    },
  });

  const totalUsers = allUsersWithOrders.length;
  const customers = allUsersWithOrders.filter(u => u.role === 'customer').length;
  
  let totalSpent = 0;
  let totalOrders = 0;

  allUsersWithOrders.forEach(user => {
    const orders = user.orders || [];
    totalOrders += orders.length;
    totalSpent += orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || "0"), 0);
  });

  return {
    totalUsers,
    totalCustomers: customers,
    totalOrders,
    totalRevenue: totalSpent
  };
};
