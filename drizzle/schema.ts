import { pgTable, uuid, text, integer, timestamp, boolean, foreignKey, varchar, numeric, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const flashSales = pgTable("flash_sales", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	discountPercent: integer("discount_percent").notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	active: boolean().default(true),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	status: varchar().default('pending').notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).notNull(),
	shippingAddress: text("shipping_address").notNull(),
	phone: text().notNull(),
	paymentMethod: text("payment_method").default('cash_on_delivery'),
	paymentStatus: varchar("payment_status").default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	discountPrice: numeric("discount_price", { precision: 12, scale:  2 }),
	categoryId: uuid("category_id"),
	image: text().notNull(),
	images: text().array(),
	stock: integer().default(0).notNull(),
	featured: boolean().default(false),
	active: boolean().default(true),
	rating: numeric({ precision: 3, scale:  2 }).default('0.00'),
	reviewCount: integer("review_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}).onDelete("set null"),
	unique("products_slug_unique").on(table.slug),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	password: text(),
	image: text(),
	role: varchar().default('customer').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	image: text(),
	description: text(),
	order: integer().default(0),
	active: boolean().default(true).notNull(),
}, (table) => [
	unique("categories_name_unique").on(table.name),
	unique("categories_slug_unique").on(table.slug),
]);
