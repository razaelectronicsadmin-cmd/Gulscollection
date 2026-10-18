// import React from 'react';
// import prisma from '@/lib/prisma';
// import ProductCard from '@/components/ui/ProductCard';
// import { Button } from '@/components/ui/Button';

// export default async function FeaturedProducts() {
//   const products = await prisma.product.findMany({
//     where: {
//       category: {
//         isActive: true,
//       },
//     },
//     take: 8,
//     include: {
//       category: {
//         select: {
//           name: true,
//           slug: true,
//         },
//       },
//     },
//   });

//   return (
//     <section className="relative w-full bg-brand-white py-28 md:py-36 px-6 border-t border-brand-black/5">
//       <div className="max-w-7xl mx-auto">
//         {/* Section Header */}
//         <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
//           <span className="text-[12px] md:text-[11px] font-sans uppercase tracking-[0.3em] text-brand-muted mb-3 inline-block">
//             Artisanal Selection
//           </span>
//           <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-black tracking-tight">
//             Curated Fragrances
//           </h2>
//           <p className="mt-4 text-xs sm:text-sm text-brand-muted tracking-wide max-w-md mx-auto">
//             Experience our most distinguished Extrait de Parfum creations, hand-blended with high-concentration essences.
//           </p>
//         </div>

//         {/* 8 Product Grid with universal ProductCard */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//           {products.map((product) => (
//             <div key={product.id} className="h-full">
//               <ProductCard
//                 product={{
//                   id: product.id,
//                   name: product.name,
//                   brand: product.brand,
//                   price: Number(product.price),
//                   imageURL: product.imageURL,
//                   category: product.category,
//                   topNote: product.topNote,
//                   gender: product.gender,
//                   isSpecialEdition: product.isSpecialEdition,
//                 }}
//               />
//             </div>
//           ))}
//         </div>

//         {/* View All CTA */}
//         <div className="mt-16 text-center">
//           <Button
//             href="/fragrance"
//             >
//             View All Fragrances
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }
