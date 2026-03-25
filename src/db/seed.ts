import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding database...");

  // 1. Artisans
  const artisanData = [
    {
      id: "6e28f322-95b8-4c4c-befb-629f6b92a271",
      name: "Coopérative Njaay",
      slug: "cooperative-njaay",
      specialty: "Cosmétiques Naturels",
      location: "Kédougou, Sénégal",
      bio: "Fondée en 2010 par un groupe de femmes de Kédougou, la Coopérative Njaay transforme les ressources naturelles locales — karité, baobab, moringa — en produits cosmétiques d'exception. Chaque produit est fabriqué à la main selon des recettes ancestrales.",
      image: "https://images.pexels.com/photos/31633685/pexels-photo-31633685.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      productCount: 15,
      rating: "4.9",
      since: 2010,
    },
    {
      id: "7f39a433-06c9-5d5d-cf0c-730f7c03b382",
      name: "Atelier Ndoye",
      slug: "atelier-ndoye",
      specialty: "Vannerie & Sculpture",
      location: "Thiès, Sénégal",
      bio: "Maître artisan depuis plus de 30 ans, Ibrahima Ndoye perpétue l'art de la vannerie wolof et de la sculpture sérère. Son atelier forme chaque année une dizaine de jeunes apprentis, assurant la transmission de ces savoir-faire précieux.",
      image: "https://images.pexels.com/photos/30442796/pexels-photo-30442796.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      productCount: 23,
      rating: "4.8",
      since: 1995,
    },
    {
      id: "8a40b544-17da-6e6e-d01d-841f8d14c493",
      name: "Maison Diop",
      slug: "maison-diop",
      specialty: "Maroquinerie & Parfums",
      location: "Mékhé, Sénégal",
      bio: "La Maison Diop est installée à Mékhé, capitale du cuir au Sénégal. Quatre générations de tanneurs et d'artisans du cuir ont forgé une expertise unique, alliant techniques traditionnelles de tannage végétal et design contemporain.",
      image: "https://images.pexels.com/photos/3307279/pexels-photo-3307279.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      productCount: 18,
      rating: "4.7",
      since: 1968,
    },
    {
      id: "9b51c655-28eb-7f7f-e12e-95209e25d5a4",
      name: "Torréfaction Sall",
      slug: "torrefaction-sall",
      specialty: "Café & Épices",
      location: "Touba, Sénégal",
      bio: "Mame Fatou Sall a transformé sa passion pour le Café Touba en une entreprise prospère. Sa torréfaction artisanale, située au cœur de Touba, produit les meilleurs cafés et mélanges d'épices du Sénégal, distribués dans tout le pays et à la diaspora.",
      image: "https://images.pexels.com/photos/33974586/pexels-photo-33974586.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      productCount: 12,
      rating: "4.9",
      since: 2005,
    },
  ];

  await db.insert(schema.artisans).values(artisanData).onConflictDoNothing();
  console.log("Artisans seeded.");

  // 2. Categories
  const categoryData = [
    {
      id: "a1111111-1111-4111-a111-111111111111",
      name: "Artisanat",
      slug: "artisanat",
      description: "Pièces uniques créées par nos artisans talentueux. Paniers, bijoux, textiles et sculptures.",
      image: "https://images.pexels.com/photos/29663367/pexels-photo-29663367.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop",
      order: 1,
      active: true,
    },
    {
      id: "b2222222-2222-4222-a222-222222222222",
      name: "Alimentaire",
      slug: "alimentaire",
      description: "Saveurs authentiques du Sénégal. Épices, cafés, huiles et produits bio de nos terroirs.",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=500&fit=crop",
      order: 2,
      active: true,
    },
    {
      id: "c3333333-3333-4333-a333-333333333333",
      name: "Traditionnel",
      slug: "traditionnel",
      description: "Objets culturels et traditionnels. Encens, instruments de musique et objets de cérémonie.",
      image: "https://images.pexels.com/photos/11379510/pexels-photo-11379510.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop",
      order: 3,
      active: true,
    },
  ];

  await db.insert(schema.categories).values(categoryData).onConflictDoNothing();
  console.log("Categories seeded.");

  // 3. Products
  const productData = [
    {
      id: "11111111-1111-4111-a111-111111111111",
      name: "Beurre de Karité Bio Premium",
      slug: "beurre-karite-bio-premium",
      description: "Beurre de karité 100% naturel, récolté à la main dans les savanes du Sénégal.",
      longDescription: "Notre beurre de karité est récolté de manière traditionnelle par les femmes des coopératives rurales du Sénégal oriental. Non raffiné et sans additifs chimiques, il conserve toutes ses propriétés nourrissantes et réparatrices. Riche en vitamines A, E et F, il offre une hydratation profonde et durable pour tous types de peau et de cheveux.",
      price: "8500",
      discountPrice: "12000",
      categoryId: "b2222222-2222-4222-a222-222222222222",
      artisanId: "6e28f322-95b8-4c4c-befb-629f6b92a271",
      image: "https://images.pexels.com/photos/30754235/pexels-photo-30754235.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      images: [
        "https://images.pexels.com/photos/30754235/pexels-photo-30754235.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      ],
      stock: 50,
      featured: true,
      active: true,
      rating: "4.8",
      reviewCount: 124,
      badge: "Best-seller",
      tags: ["bio", "naturel", "soin"],
    },
    {
      id: "22222222-2222-4222-a222-222222222222",
      name: "Panier Tressé Artisanal Wolof",
      slug: "panier-tresse-artisanal-wolof",
      description: "Panier traditionnel tressé à la main avec des fibres naturelles.",
      longDescription: "Ce panier est tressé à la main par les artisanes de la région de Thiès, selon des techniques ancestrales transmises de mère en fille. Les motifs géométriques wolof sont uniques à chaque pièce.",
      price: "15000",
      categoryId: "a1111111-1111-4111-a111-111111111111",
      artisanId: "7f39a433-06c9-5d5d-cf0c-730f7c03b382",
      image: "https://images.pexels.com/photos/29663367/pexels-photo-29663367.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      images: [
        "https://images.pexels.com/photos/29663367/pexels-photo-29663367.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      ],
      stock: 20,
      featured: true,
      active: true,
      rating: "4.9",
      reviewCount: 87,
      badge: "Nouveau",
      tags: ["décoration", "fait-main", "wolof"],
    },
    {
      id: "33333333-3333-4333-a333-333333333333",
      name: "Thiouraye Encens Traditionnel",
      slug: "thiouraye-encens-traditionnel",
      description: "Encens traditionnel sénégalais aux parfums envoûtants.",
      longDescription: "Le thiouraye est un élément incontournable de la culture sénégalaise. Notre mélange exclusif combine des copeaux de bois de santal, de la gomme arabique et des épices sélectionnées.",
      price: "3500",
      categoryId: "c3333333-3333-4333-a333-333333333333",
      artisanId: "8a40b544-17da-6e6e-d01d-841f8d14c493",
      image: "https://images.pexels.com/photos/674483/pexels-photo-674483.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      images: [
        "https://images.pexels.com/photos/674483/pexels-photo-674483.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      ],
      stock: 100,
      featured: false,
      active: true,
      rating: "4.7",
      reviewCount: 203,
      badge: null,
      tags: ["parfum", "cérémonie", "tradition"],
    },
    {
      id: "44444444-4444-4444-a444-444444444444",
      name: "Café Touba Moulu Artisanal",
      slug: "cafe-touba-moulu-artisanal",
      description: "Café Touba authentique, torréfié et moulu artisanalement.",
      longDescription: "Le Café Touba est la boisson emblématique du Sénégal. Notre café est torréfié de manière traditionnelle avec du djar (poivre de Selim) et du gingembre.",
      price: "5000",
      categoryId: "b2222222-2222-4222-a222-222222222222",
      artisanId: "9b51c655-28eb-7f7f-e12e-95209e25d5a4",
      image: "https://images.pexels.com/photos/942803/pexels-photo-942803.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
      images: [
        "https://images.pexels.com/photos/942803/pexels-photo-942803.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
      ],
      stock: 200,
      featured: true,
      active: true,
      rating: "4.9",
      reviewCount: 312,
      badge: "Populaire",
      tags: ["café", "épice", "touba"],
    },
  ];

  await db.insert(schema.products).values(productData).onConflictDoNothing();
  console.log("Products seeded.");

  // 4. Flash Sales Campaigns
  const campaignId = uuidv4();
  const flashSaleCampaignData = [
    {
      id: campaignId,
      title: "Vente Flash de Printemps",
      description: "Profitez de réductions exceptionnelles sur une sélection de produits.",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
    },
  ];

  await db.insert(schema.flashSaleCampaigns).values(flashSaleCampaignData).onConflictDoNothing();
  console.log("Flash Sales Campaigns seeded.");

  // 5. Flash Sale Items
  const flashSaleItems = [
    {
      id: uuidv4(),
      campaignId: campaignId,
      productId: "11111111-1111-4111-a111-111111111111", // Savon Noir
      discountPercent: 30,
      flashPrice: "3500",
    },
    {
      id: uuidv4(),
      campaignId: campaignId,
      productId: "44444444-4444-4444-a444-444444444444", // Café Touba
      discountPercent: 20,
      flashPrice: "4000",
    }
  ];

  await db.insert(schema.flashSales).values(flashSaleItems).onConflictDoNothing();
  console.log("Flash Sale Items seeded.");

  // 6. Admin Users
  const adminPassword1 = await bcrypt.hash("BaysawarrAdmin!", 10);
  await db.insert(schema.users).values({
    id: uuidv4(),
    name: "Admin Baysawarr",
    email: "admin@baysawarr.com",
    password: adminPassword1,
    role: "admin",
  }).onConflictDoNothing();

  const adminPassword2 = await bcrypt.hash("Adminshop@2026", 10);
  await db.insert(schema.users).values({
    id: uuidv4(),
    name: "Admin Fabira",
    email: "adminshop@fabiratrading.com",
    password: adminPassword2,
    role: "admin",
  }).onConflictDoNothing();

  console.log("Admin users seeded:");
  console.log("- admin@baysawarr.com / BaysawarrAdmin!");
  console.log("- adminshop@fabiratrading.com / Adminshop@2026");

  console.log("Seeding completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:");
  console.error(err);
  process.exit(1);
});
