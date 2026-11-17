import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Kebaya", slug: "kebaya", sortOrder: 1 },
  { name: "Dress", slug: "dress", sortOrder: 2 },
  { name: "Setelan", slug: "setelan", sortOrder: 3 },
  { name: "Blouse", slug: "blouse", sortOrder: 4 },
  { name: "Gamis", slug: "gamis", sortOrder: 5 },
  { name: "Rok", slug: "rok", sortOrder: 6 },
  { name: "Lainnya", slug: "lainnya", sortOrder: 7 },
];

const products = [
  {
    slug: "p1",
    name: "Kebaya Amara",
    categorySlug: "kebaya",
    price: 1250000,
    description:
      "Kebaya modern dengan detail bordir halus dan siluet anggun. Dibuat dengan perhatian pada setiap detail jahitan.",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85",
    featured: true,
    status: ProductStatus.AVAILABLE,
  },
  {
    slug: "p2",
    name: "Dress Élise",
    categorySlug: "dress",
    price: 890000,
    description:
      "Dress feminin dengan potongan lembut, nyaman dikenakan untuk acara istimewa maupun momen spesial.",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=85",
    featured: true,
    status: ProductStatus.AVAILABLE,
  },
  {
    slug: "p3",
    name: "Setelan Nara",
    categorySlug: "setelan",
    price: 975000,
    description:
      "Setelan dua potong dengan garis potong bersih dan hasil akhir rapi. Dapat disesuaikan dengan ukuran pemesan.",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&q=85",
    featured: true,
    status: ProductStatus.AVAILABLE,
  },
  {
    slug: "p4",
    name: "Blouse Celeste",
    categorySlug: "blouse",
    price: 475000,
    description:
      "Blouse dengan detail feminin dan bahan pilihan untuk tampilan sehari-hari yang berkelas.",
    image:
      "https://images.unsplash.com/photo-1564257577-7a5a5f7d4f6c?w=1200&q=85",
    featured: false,
    status: ProductStatus.AVAILABLE,
  },
  {
    slug: "p5",
    name: "Gamis Seruni",
    categorySlug: "gamis",
    price: 1150000,
    description:
      "Gamis dengan jatuh bahan yang indah, potongan bersahaja, dan sentuhan detail yang elegan.",
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfaae6d5b?w=1200&q=85",
    featured: false,
    status: ProductStatus.AVAILABLE,
  },
  {
    slug: "p6",
    name: "Rok A-line Clara",
    categorySlug: "rok",
    price: 525000,
    description:
      "Rok A-line yang mudah dipadukan, dibuat dengan ukuran dan panjang sesuai kebutuhan.",
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1200&q=85",
    featured: false,
    status: ProductStatus.AVAILABLE,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        featured: product.featured,
        status: product.status,
        categoryId: category.id,
      },
      create: {
        slug: product.slug,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        featured: product.featured,
        status: product.status,
        categoryId: category.id,
      },
    });
  }

  await prisma.boutiqueInfo.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      name: "Rosmawati Thailor",
      tagline: "Made with Care",
      description:
        "Butik pakaian, jasa jahit, dan busana custom dengan sentuhan personal. Dibuat dengan teliti untuk setiap momen Anda.",
    },
  });

  console.log(
    `Seed selesai: ${categories.length} kategori, ${products.length} produk.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
