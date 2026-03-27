import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../lib/db";
import { users } from "../../db/schema";
import { EmailService } from "../../lib/email";


const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export const register = async (data: any) => {
  const { email, password, name, phone, address } = data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const [newUser] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    phone,
    address,
    role: "customer",
  }).returning();

  const { password: _, ...userWithoutPassword } = newUser;

  // Send welcome email
  try {
    await EmailService.sendWelcome(email, name);
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return userWithoutPassword;
};

export const login = async (email: string, password: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getUserById = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
