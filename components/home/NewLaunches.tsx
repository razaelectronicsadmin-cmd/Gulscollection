// import React from 'react';
// import prisma from '@/lib/prisma';
// import ProductCard from '@/components/ui/ProductCard';
// import { Button } from '@/components/ui/Button';

// export default async function NewLaunches() {
//   const newProducts = await prisma.product.findMany({
//     orderBy: { id: 'desc' },
//     take: 4,
//     include: {
//       category: {
//         select: {
//           name: true,
//           slug: true,
//         },
//       },
//     },
//   });

//   if (!newProducts || newProducts.length === 0) {
//     return null;
//   }

//   return (
//     <section className="relative w-full bg-brand-light py-28 md:py-36 px-6 border-t border-brand-black/5">
//       <div className="max-w-7xl mx-auto">
//         {/* Section Header */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
//           <div>
//             <span className="text-[12px] md:text-[11px] font-sans uppercase tracking-[0.3em] text-brand-muted mb-3 inline-block">
//               Latest Additions
//             </span>
//             <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-black tracking-tight">
//               New Launches
//             </h2>
//           </div>
//           <Button
//             href="/fragrance"
//           >
//             Explore All
//           </Button>
//         </div>

//         {/* 4 Product Grid mapping through universal ProductCard */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//           {newProducts.map((product) => (
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
//       </div>
//     </section>
//   );
// }
