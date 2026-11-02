import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with realistic fragrance catalogue...')

  // 1. Create or ensure default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gulscollection.com' },
    update: {},
    create: {
      email: 'admin@gulscollection.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin user ready:', admin.email)

  // 2. Create Categories: Fragrance, Leather, Essentials
  const categoriesData = [
    // Fragrance
    {
      name: 'Masculine Energy',
      slug: 'masculine-energy',
      image: '/images/gen-x.jpeg',
      isActive: true,
      isSignatureEdition: true,
      department: 'Fragrance',
    },
    {
      name: 'Pour Elle',
      slug: 'pour-elle',
      image: '/images/bring-her.jpeg',
      isActive: true,
      isSignatureEdition: true,
      department: 'Fragrance',
    },
    {
      name: 'N°01 - For All',
      slug: 'for-all',
      image: '/images/after-5.jpeg',
      isActive: true,
      isSignatureEdition: true,
      department: 'Fragrance',
    },
    {
      name: 'Arabesques',
      slug: 'arabesques',
      image: '/images/syfar.jpeg',
      isActive: true,
      isSignatureEdition: true,
      department: 'Fragrance',
    },
    {
      name: 'Men',
      slug: 'men',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Fragrance',
    },
    {
      name: 'Women',
      slug: 'women',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Fragrance',
    },
    {
      name: 'Unisex',
      slug: 'unisex',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Fragrance',
    },
    // Leather
    {
      name: 'Wallets & Cardholders',
      slug: 'wallets-cardholders',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Leather',
    },
    {
      name: 'Bags & Briefcases',
      slug: 'bags-briefcases',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Leather',
    },
    {
      name: 'Belts & Straps',
      slug: 'belts-straps',
      image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Leather',
    },
    {
      name: 'Travel Goods',
      slug: 'travel-goods',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Leather',
    },
    // Essentials
    {
      name: 'Scented Candles',
      slug: 'scented-candles',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Essentials',
    },
    {
      name: 'Reed Diffusers',
      slug: 'reed-diffusers',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Essentials',
    },
    {
      name: 'Tumblers & Travel Mugs',
      slug: 'tumblers-mugs',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Essentials',
    },
    {
      name: 'Body Mists & Grooming',
      slug: 'body-mists-grooming',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      isSignatureEdition: false,
      department: 'Essentials',
    },
  ]

  const categoryMap = new Map<string, number>()

  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        image: cat.image,
        isActive: cat.isActive,
        isSignatureEdition: cat.isSignatureEdition,
        department: cat.department,
      },
      create: cat,
    })
    categoryMap.set(cat.slug, record.id)
    console.log(`Category seeded: ${record.name} (#${record.id} [${cat.department}])`)
  }

  // 3. Products seed data
  const productsData = [
    {
      name: 'BAOW',
      brand: "Gul's",
      description: 'Sweet, fruity and irresistibly charismatic. A scent that demands attention.',
      price: 180.00,
      stockQuantity: 45,
      imageURL: '/images/baow.jpeg',
      categorySlug: 'masculine-energy',
      topNote: 'Pineapple, Granny Smith Apple, Mandarin',
      heartNote: 'Vanilla, Cedar, Oakmoss',
      baseNote: 'Ambergris, Caramel, Dry Woods, Musk',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Coumarin, Citral, Geraniol.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'Gen X',
      brand: "Gul's",
      description: 'Bold, fresh and timeless. For the man who leads his own era.',
      price: 195.00,
      stockQuantity: 60,
      imageURL: '/images/gen-x.jpeg',
      categorySlug: 'masculine-energy',
      topNote: 'Lime, Galbanum, Gin & Tonic Accord',
      heartNote: 'Nutmeg, Cypress, Mint',
      baseNote: 'Cedarwood, Vetiver, Amber',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Alpha-Isomethyl Ionone, Citronellol, Coumarin.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'Hassan Gul',
      brand: "Gul's",
      description: 'A powerful, sensual and refined signature for a true gentleman.',
      price: 240.00,
      stockQuantity: 25,
      imageURL: '/images/hassan-gul.jpeg',
      categorySlug: 'masculine-energy',
      topNote: 'Bergamot, Mandarin, Pink Pepper',
      heartNote: 'Lavender, Orris, Cinnamon',
      baseNote: 'Black Vanilla, Leather, Patchouli, Tonka Bean',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Linalool, Limonene, Coumarin, Citronellol, Alpha-Isomethyl Ionone.',
      isSpecialEdition: true,
      specialEditionType: 'Male',
    },
    {
      name: 'Bring Her',
      brand: "Gul's",
      description: 'Soft, sensual and addictively sweet. The ultimate feminine trail.',
      price: 185.00,
      stockQuantity: 35,
      imageURL: '/images/bring-her.jpeg',
      categorySlug: 'pour-elle',
      topNote: 'Red Fruits, Orange, Blackcurrant',
      heartNote: 'Marshmallow, Lily Of The Valley, Jasmine',
      baseNote: 'Vanilla, Musk, Amber',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Benzyl Salicylate, Limonene, Linalool, Hydroxycitronellal.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'SO',
      brand: "Gul's",
      description: 'A delicious burst of berries and sweetness. Playful, feminine, unforgettable.',
      price: 190.00,
      stockQuantity: 40,
      imageURL: '/images/so.jpeg',
      categorySlug: 'pour-elle',
      topNote: 'Strawberry, Raspberry, Blackberry, Cherry, Mandarin, Lemon',
      heartNote: 'Violet, Jasmine',
      baseNote: 'Musk, Vanilla, Cashmeran, Amber, Oakmoss, Patchouli',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Geraniol, Benzyl Salicylate.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'Jaweria Gul',
      brand: "Gul's",
      description: 'Elegance in a bottle. Floral, graceful and luxurious.',
      price: 230.00,
      stockQuantity: 20,
      imageURL: '/images/jaweria-gul.jpeg',
      categorySlug: 'pour-elle',
      topNote: 'Pear Blossom, Red Berries, Mandarin',
      heartNote: 'White Gardenia, Jasmine, Frangipani',
      baseNote: 'Brown Sugar, Patchouli, Musk',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Hydroxycitronellal, Linalool, Citronellol, Coumarin.',
      isSpecialEdition: true,
      specialEditionType: 'Female',
    },
    {
      name: 'Gen Z',
      brand: "Gul's",
      description: 'Bold, spicy and extreme. An icon of the new generation.',
      price: 175.00,
      stockQuantity: 50,
      imageURL: '/images/gen-z.jpeg',
      categorySlug: 'for-all',
      topNote: 'Nutmeg, Cinnamon, Cardamom, Grapefruit',
      heartNote: 'Lavender',
      baseNote: 'Licorice, Sandalwood, Amber, Patchouli, Haitian Vetiver',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Coumarin, Citronellol, Citral, Geraniol.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'After 5',
      brand: "Gul's",
      description: 'Fresh, clean and endearingly versatile. Your everyday signature.',
      price: 165.00,
      stockQuantity: 55,
      imageURL: '/images/after-5.jpeg',
      categorySlug: 'for-all',
      topNote: 'Lemon, Green Notes, Bergamot, Mandarin, Pineapple, Papaya',
      heartNote: 'Jasmine, Violet, Rose, Nutmeg, Lily, Orris',
      baseNote: 'Musk, Amber, Sandalwood, Cedar, Oakmoss',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Ethylhexyl Methoxycinnamate, Geraniol.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'Syfar',
      brand: "Gul's",
      description: 'Deep, smoky and luxurious. An oriental masterpiece.',
      price: 210.00,
      stockQuantity: 30,
      imageURL: '/images/syfar.jpeg',
      categorySlug: 'arabesques',
      topNote: 'Bergamot, Pink Pepper, Tangerine, Oud, Honey',
      heartNote: 'Rose, Saffron, Jasmine, Patchouli, Orange Blossom',
      baseNote: 'Amber, Leather, Sandalwood, Agarwood, Musk, Raspberry',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Geraniol, Hydroxycitronellal.',
      isSpecialEdition: false,
      specialEditionType: null,
    },
    {
      name: 'Laizon',
      brand: "Gul's",
      description: 'A majestic fusion of citrus, oud and vanilla. Royalty redefined.',
      price: 220.00,
      stockQuantity: 35,
      imageURL: '/images/laizon.jpeg',
      categorySlug: 'arabesques',
      topNote: 'Grapefruit, Saffron, Lemon',
      heartNote: 'Cedarwood, Nutmeg, Oud',
      baseNote: 'Patchouli, Sandalwood',
      ingredients: 'Alcohol Denat., Parfum, Aqua, Alpha-Isomethyl Ionone, Limonene, Linalool, Coumarin, Eugenol.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Fragrance',
    },
    // Leather Collection
    {
      name: 'Sovereign Leather Handbag',
      brand: "Gul's Leather",
      description: 'Handcrafted from full-grain vegetable-tanned cowhide. Features polished solid brass accents, durable protective studs, and a compartmentalized suede lining.',
      price: 18500.00,
      stockQuantity: 18,
      imageURL: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'bags-briefcases',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: '100% Genuine Full-Grain Leather, Solid Brass Hardware, Suede Interior.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Leather',
    },
    {
      name: 'Imperial Bifold Wallet',
      brand: "Gul's Leather",
      description: 'Ultra-refined silhouette featuring 8 card slots, dual banknote dividers, and military-grade RFID signal blocking. Burnished hand-painted edges.',
      price: 4200.00,
      stockQuantity: 40,
      imageURL: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'wallets-cardholders',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: 'Hand-selected Napa Leather, RFID-shielding alloy lining.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Leather',
    },
    {
      name: 'Signature Full-Grain Belt',
      brand: "Gul's Leather",
      description: 'Reversible fine bridle leather with interchangeable satin gold and silver buckles. Double saddle-stitched for enduring elegance.',
      price: 3800.00,
      stockQuantity: 30,
      imageURL: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'belts-straps',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: 'English Bridle Cowhide, Satin Finished Alloy Buckle.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Leather',
    },
    {
      name: 'Heritage Weekend Duffle',
      brand: "Gul's Leather",
      description: 'The definitive luxury travel bag. Roomy water-resistant interior with reinforced grab handles and an ergonomic padded shoulder strap.',
      price: 24500.00,
      stockQuantity: 12,
      imageURL: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'travel-goods',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: 'Heavy-duty vegetable tanned leather, antique brass YKK zippers.',
      isSpecialEdition: true,
      specialEditionType: 'Travel Special',
      department: 'Leather',
    },
    {
      name: 'Slim Minimalist Cardholder',
      brand: "Gul's Leather",
      description: 'Pocket-friendly luxury crafted for the modern minimalist. Accommodates up to 6 cards with a central folded cash pocket.',
      price: 2600.00,
      stockQuantity: 50,
      imageURL: 'https://images.unsplash.com/photo-1606503825008-909a6184a441?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'wallets-cardholders',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: 'Drum-dyed calfskin, microfiber lining.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Leather',
    },
    {
      name: 'Executive Laptop Messenger',
      brand: "Gul's Leather",
      description: 'Padded internal compartment safely houses laptops up to 16". Dedicated slip pockets for notebooks, chargers, and writing instruments.',
      price: 16500.00,
      stockQuantity: 15,
      imageURL: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'bags-briefcases',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: 'Oiled pull-up leather, padded ballistic nylon dividers.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Leather',
    },

    // Essentials Collection
    {
      name: 'Amber & Smoked Oud Candle',
      brand: "Gul's Essentials",
      description: 'Hand-poured pure soy wax candle infused with rich oud resin, amber crystals, and warm tonka bean. Clean, soot-free 55-hour burn time.',
      price: 3400.00,
      stockQuantity: 35,
      imageURL: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'scented-candles',
      topNote: 'Cardamom, Pink Pepper',
      heartNote: 'Smoked Oud, Amber',
      baseNote: 'Vanilla Bean, Cedarwood',
      ingredients: '100% Organic Soy Wax, Premium Fragrance Oils, Cotton Wick, Amber Glass Tumbler.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Essentials',
    },
    {
      name: 'Royal Velvet Reed Diffuser',
      brand: "Gul's Essentials",
      description: 'Continuous alcohol-free flame-less scent diffusion. Premium black porous reeds steadily release a comforting atmosphere of Damask rose, sandalwood, and velvet musk.',
      price: 4200.00,
      stockQuantity: 28,
      imageURL: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'reed-diffusers',
      topNote: 'Bergamot, Damask Rose',
      heartNote: 'Violet, Sandalwood',
      baseNote: 'Velvet Musk, Amber',
      ingredients: 'Eco-solvent diffusion base, concentrated botanical perfume oils, 8 natural rattan reeds.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Essentials',
    },
    {
      name: 'Artisan Botanical Body Mist',
      brand: "Gul's Essentials",
      description: 'Ultra-fine hydrating all-day body and hair mist. Enriched with chamomile water and aloe leaf extract for instant refreshment.',
      price: 2800.00,
      stockQuantity: 45,
      imageURL: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'body-mists-grooming',
      topNote: 'Crisp Green Apple, Mandarin',
      heartNote: 'White Lily, Jasmine Water',
      baseNote: 'Clean Cedar, Sheer Musk',
      ingredients: 'Aqua, Organic Aloe Vera Extract, Chamomile Hydrosol, Parfum, Vitamin E.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Essentials',
    },
    {
      name: "Gul's Insulated Ceramic Tumbler",
      brand: "Gul's Essentials",
      description: 'Engineered with double-wall vacuum insulation and a non-reactive ceramic interior lining that preserves pure taste. Keeps cold for 16h and hot for 8h.',
      price: 3500.00,
      stockQuantity: 32,
      imageURL: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'tumblers-mugs',
      topNote: null,
      heartNote: null,
      baseNote: null,
      ingredients: '18/8 Kitchen-grade Stainless Steel, TrueTaste Ceramic Coating, BPA-free splash lid.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Essentials',
    },
    {
      name: 'Vanilla Bourbon Soy Candle',
      brand: "Gul's Essentials",
      description: 'Decadent warmth for cozy evenings. Slow-burning soy blend scented with caramelized sugar, Madagascar vanilla pod, and oak-barrel bourbon notes.',
      price: 3200.00,
      stockQuantity: 24,
      imageURL: 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'scented-candles',
      topNote: 'Caramelized Sugar',
      heartNote: 'Madagascar Vanilla Pod',
      baseNote: 'Oak Bourbon, Warm Benzoin',
      ingredients: '100% Soy Wax Blend, Cotton Core Wick, Heavy-base Glass.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Essentials',
    },
    {
      name: 'Linen & Room Scenting Mist',
      brand: "Gul's Essentials",
      description: 'Transform any living space into a sanctuary of tranquility. Safe for curtains, upholstery, and fine cotton sheets.',
      price: 2600.00,
      stockQuantity: 30,
      imageURL: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1000&auto=format&fit=crop',
      categorySlug: 'reed-diffusers',
      topNote: 'Provence Lavender',
      heartNote: 'White Cotton Flower',
      baseNote: 'Powdery Cedar',
      ingredients: 'Deionized Water, Botanical Emulsifiers, Pure Essential Oil Concentrates.',
      isSpecialEdition: false,
      specialEditionType: null,
      department: 'Essentials',
    },
  ]

  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug)
    if (!categoryId) continue

    const existing = await prisma.product.findFirst({
      where: { name: item.name },
    })

    if (!existing) {
      await prisma.product.create({
        data: {
          name: item.name,
          brand: item.brand,
          description: item.description,
          price: item.price,
          stockQuantity: item.stockQuantity,
          imageURL: item.imageURL,
          categoryId: categoryId,
          topNote: item.topNote,
          heartNote: item.heartNote,
          baseNote: item.baseNote,
          ingredients: item.ingredients,
          isSpecialEdition: item.isSpecialEdition,
          specialEditionType: item.specialEditionType,
          department: (item as any).department || 'Fragrance',
        },
      })
      console.log(`Product created: ${item.name} [${(item as any).department || 'Fragrance'}]`)
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          brand: item.brand,
          description: item.description,
          price: item.price,
          stockQuantity: item.stockQuantity,
          imageURL: item.imageURL,
          categoryId: categoryId,
          topNote: item.topNote,
          heartNote: item.heartNote,
          baseNote: item.baseNote,
          ingredients: item.ingredients,
          isSpecialEdition: item.isSpecialEdition,
          specialEditionType: item.specialEditionType,
          department: (item as any).department || 'Fragrance',
        },
      })
      console.log(`Product updated: ${item.name} [${(item as any).department || 'Fragrance'}]`)
    }
  }

  // 4. Seed initial realistic orders
  const sampleOrders = [
    {
      orderNumber: 'GUL-2026-10492',
      customerName: 'Hamza Tariq',
      customerEmail: 'hamza.tariq@gmail.com',
      customerPhone: '+92 300 8274192',
      shippingAddress: 'House 42, Street 7, Phase 6, DHA, Karachi',
      status: 'PENDING' as const,
      totalAmount: 435.00,
      cancellationReason: null,
      items: [
        { productName: 'Hassan Gul', quantity: 1, price: 240.00 },
        { productName: 'Gen X', quantity: 1, price: 195.00 },
      ],
    },
    {
      orderNumber: 'GUL-2026-10493',
      customerName: 'Ayesha Siddiqui',
      customerEmail: 'ayesha.s@outlook.com',
      customerPhone: '+92 321 4459821',
      shippingAddress: 'Apartment 5B, Creek Vistas, Phase 8, DHA, Karachi',
      status: 'CONFIRMED' as const,
      totalAmount: 420.00,
      cancellationReason: null,
      items: [
        { productName: 'Bring Her', quantity: 1, price: 185.00 },
        { productName: 'Jaweria Gul', quantity: 1, price: 230.00 },
      ],
    },
    {
      orderNumber: 'GUL-2026-10494',
      customerName: 'Bilal Khan',
      customerEmail: 'bilalkhan.pk@gmail.com',
      customerPhone: '+92 333 9120485',
      shippingAddress: 'B-14, Block 4, Clifton, Karachi',
      status: 'DISPATCHED' as const,
      totalAmount: 210.00,
      cancellationReason: null,
      items: [
        { productName: 'Syfar', quantity: 1, price: 210.00 },
      ],
    },
    {
      orderNumber: 'GUL-2026-10495',
      customerName: 'Zainab Fatima',
      customerEmail: 'zainab.fatima@hotmail.com',
      customerPhone: '+92 312 8763290',
      shippingAddress: 'Villa 18, Tipu Sultan Road, Karachi',
      status: 'COMPLETED' as const,
      totalAmount: 400.00,
      cancellationReason: null,
      items: [
        { productName: 'BAOW', quantity: 1, price: 180.00 },
        { productName: 'Laizon', quantity: 1, price: 220.00 },
      ],
    },
    {
      orderNumber: 'GUL-2026-10496',
      customerName: 'Omar Farooq',
      customerEmail: 'omar.farooq@yahoo.com',
      customerPhone: '+92 345 2291044',
      shippingAddress: 'Plot 77, KDA Scheme 1, Karachi',
      status: 'CANCELLED' as const,
      totalAmount: 175.00,
      cancellationReason: 'Customer requested change of shipping address and placed a new order.',
      items: [
        { productName: 'Gen Z', quantity: 1, price: 175.00 },
      ],
    },
  ];

  for (const o of sampleOrders) {
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: o.orderNumber },
    });

    if (!existingOrder) {
      const orderItemsToCreate: { productId: number; quantity: number; priceAtPurchase: number }[] = [];
      for (const it of o.items) {
        const prod = await prisma.product.findFirst({ where: { name: it.productName } });
        if (prod) {
          orderItemsToCreate.push({
            productId: prod.id,
            quantity: it.quantity,
            priceAtPurchase: it.price,
          });
        }
      }

      await prisma.order.create({
        data: {
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress,
          status: o.status,
          totalAmount: o.totalAmount,
          cancellationReason: o.cancellationReason,
          orderItems: {
            create: orderItemsToCreate,
          },
        },
      });
      console.log(`Order seeded: #${o.orderNumber} (${o.status})`);
    }
  }

  // 5. Seed default AnnouncementBar (singleton, id = 1)
  await prisma.announcementBar.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isVisible: true,
      message: 'FREE DELIVERY ON ORDERS ABOVE PKR 5,000',
      showPhone: true,
      phoneNumber: '0333-2265461',
      phoneLink: 'tel:03332265461',
      showEmail: true,
      emailAddress: 'gulscollection@gmail.com',
      emailLink: 'mailto:gulscollection@gmail.com',
      showSocialIcons: true,
      instagramUrl: 'https://instagram.com',
      facebookUrl: 'https://facebook.com',
      tiktokUrl: 'https://tiktok.com',
      youtubeUrl: 'https://youtube.com',
      bgColor: '#0b0f0e',
      textColor: '#F5F5F0',
      accentColor: '#C9A66B',
      fontSize: 'sm',
    },
  })
  console.log('AnnouncementBar seeded.')

  // ─── 8. Seed Delivery Rules & Settings ─────────────────────────────────────
  await prisma.deliverySetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      standardFee: 250.00,
      freeDeliveryMin: 5000.00,
      isFreeDeliveryActive: true,
      cityRules: JSON.stringify([
        { city: 'Karachi', fee: 0, isFree: true, note: 'Local Boutique Delivery' },
        { city: 'Lahore', fee: 200, isFree: false, note: 'Special Express Rate' },
        { city: 'Islamabad', fee: 200, isFree: false, note: 'Special Express Rate' },
      ]),
    },
  })
  console.log('DeliverySetting seeded.')

  // ─── 9. Seed Marketing Discount Coupons ────────────────────────────────────
  const sampleCoupons = [
    {
      code: 'WELCOME10',
      description: '10% off your entire order (Min spend PKR 2,000)',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10.00,
      minOrderAmount: 2000.00,
      maxDiscount: 1500.00,
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: 'GULS500',
      description: 'Flat PKR 500 off on orders above PKR 4,000',
      discountType: 'FIXED' as const,
      discountValue: 500.00,
      minOrderAmount: 4000.00,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      description: 'Free Shipping coupon on any order above PKR 1,500',
      discountType: 'FREE_SHIPPING' as const,
      discountValue: 0.00,
      minOrderAmount: 1500.00,
      usageLimit: 2000,
      isActive: true,
    },
  ]

  for (const c of sampleCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    })
  }
  console.log('Marketing Coupons seeded.')

  // ─── 10. Seed Sample Automatic Promotional Discounts ───────────────────────
  const pourElleCat = await prisma.category.findUnique({ where: { slug: 'pour-elle' } })
  if (pourElleCat) {
    const existingPromo = await prisma.promotionalDiscount.findFirst({
      where: { name: 'Pour Elle Signature 10% Off' },
    })
    if (!existingPromo) {
      await prisma.promotionalDiscount.create({
        data: {
          name: 'Pour Elle Signature 10% Off',
          targetType: 'CATEGORY',
          targetId: pourElleCat.id,
          targetName: 'Pour Elle',
          discountType: 'PERCENTAGE',
          discountValue: 10.00,
          isActive: true,
        },
      })
      console.log('Sample Automatic Promotional Discount seeded.')
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
