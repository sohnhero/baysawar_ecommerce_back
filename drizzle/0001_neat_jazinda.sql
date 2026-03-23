CREATE TABLE "artisans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"specialty" text NOT NULL,
	"location" text NOT NULL,
	"bio" text NOT NULL,
	"image" text NOT NULL,
	"since" integer NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"product_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artisans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_product_id_user_id_unique" UNIQUE("product_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_user_product_unique" UNIQUE("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "flash_sales" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "flash_sales" ADD COLUMN "flash_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "flash_sales" ADD COLUMN "campaign_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "artisan_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "badge" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;