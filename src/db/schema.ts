import { pgTable, uuid, text, integer, timestamp, boolean, varchar, numeric, unique, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	password: text("password"),
	image: text("image"),
	phone: text("phone"),
	address: text("address"),
	role: varchar("role").default('customer').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	image: text("image"),
	description: text("description"),
	order: integer("order").default(0),
	active: boolean("active").default(true).notNull(),
}, (table) => [
	unique("categories_name_unique").on(table.name),
	unique("categories_slug_unique").on(table.slug),
]);

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	description: text("description").notNull(),
	longDescription: text("long_description"),
	price: numeric("price", { precision: 12, scale: 2 }).notNull(),
	discountPrice: numeric("discount_price", { precision: 12, scale: 2 }),
	categoryId: uuid("category_id"),
	artisanId: uuid("artisan_id"),
	image: text("image").notNull(),
	images: text("images").array(),
	stock: integer("stock").default(0).notNull(),
	featured: boolean("featured").default(false),
	active: boolean("active").default(true),
	rating: numeric("rating", { precision: 3, scale: 2 }).default('0.00'),
	reviewCount: integer("review_count").default(0),
	badge: text("badge"),
	tags: text("tags").array(),
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

export const artisans = pgTable("artisans", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	specialty: text("specialty").notNull(),
	location: text("location").notNull(),
	bio: text("bio").notNull(),
	image: text("image").notNull(),
	since: integer("since").notNull(),
	rating: numeric("rating", { precision: 3, scale: 2 }).default('0.00'),
	productCount: integer("product_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("artisans_slug_unique").on(table.slug),
]);

export const reviews = pgTable("reviews", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	userId: uuid("user_id").notNull(),
	rating: integer("rating").notNull(),
	comment: text("comment").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "reviews_product_id_products_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "reviews_user_id_users_id_fk"
	}).onDelete("cascade"),
	unique("reviews_product_id_user_id_unique").on(table.productId, table.userId),
]);

export const wishlist = pgTable("wishlist", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "wishlist_user_id_users_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "wishlist_product_id_products_id_fk"
	}).onDelete("cascade"),
	unique("wishlist_user_product_unique").on(table.userId, table.productId),
]);

export const orders = pgTable("orders", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	status: varchar("status").default('pending').notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
	shippingAddress: text("shipping_address").notNull(),
	phone: text("phone").notNull(),
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
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer("quantity").notNull(),
	price: numeric("price", { precision: 12, scale: 2 }).notNull(),
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

export const flashSaleCampaigns = pgTable("flash_sale_campaigns", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	title: text("title").notNull(),
	description: text("description"),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	active: boolean("active").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const flashSales = pgTable("flash_sales", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	campaignId: uuid("campaign_id").notNull(),
	productId: uuid("product_id").notNull(),
	discountPercent: integer("discount_percent").notNull(),
	flashPrice: numeric("flash_price", { precision: 12, scale: 2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "flash_sales_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [flashSaleCampaigns.id],
			name: "flash_sales_campaign_id_fk"
		}).onDelete("cascade"),
]);

export const flashSaleCampaignsRelations = relations(flashSaleCampaigns, ({ many }) => ({
	items: many(flashSales),
}));

export const flashSalesRelations = relations(flashSales, ({ one }) => ({
	campaign: one(flashSaleCampaigns, {
		fields: [flashSales.campaignId],
		references: [flashSaleCampaigns.id],
	}),
	product: one(products, {
		fields: [flashSales.productId],
		references: [products.id],
	}),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id],
	}),
	artisan: one(artisans, {
		fields: [products.artisanId],
		references: [artisans.id],
	}),
	orderItems: many(orderItems),
	reviews: many(reviews),
}));

export const artisansRelations = relations(artisans, ({ many }) => ({
	products: many(products),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id],
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id],
	}),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
	user: one(users, {
		fields: [wishlist.userId],
		references: [users.id],
	}),
	product: one(products, {
		fields: [wishlist.productId],
		references: [products.id],
	}),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id],
	}),
	items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id],
	}),
}));
