
// "use client";

// // External imports first
// import React, { useState } from 'react';
// import { Upload } from 'lucide-react';

// // Then UI components
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// export default function ColorMatcher() {
//   const [selectedColor, setSelectedColor] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [products, setProducts] = useState([]);

//   const extractColor = (file: File): Promise<string> => {
//     return new Promise((resolve) => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       const img = new Image();

//       img.onload = () => {
//         if (!ctx) return;
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0);
        
//         const centerX = Math.floor(img.width / 2);
//         const centerY = Math.floor(img.height / 2);
//         const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
        
//         const hex = '#' + [pixel[0], pixel[1], pixel[2]]
//           .map(x => x.toString(16).padStart(2, '0'))
//           .join('');
//         resolve(hex);
//       };

//       img.src = URL.createObjectURL(file);
//     });
//   };

//   const fetchMatchingProducts = async (color: string) => {
//     try {
//       const response = await fetch(`/api/products?color=${encodeURIComponent(color)}`);
//       const data = await response.json();
//       setProducts(data);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     }
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsProcessing(true);
//     try {
//       const color = await extractColor(file);
//       setSelectedColor(color);
//       await fetchMatchingProducts(color);
//     } catch (error) {
//       console.error('Error processing image:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-8">
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle>Paint Chip Color Matcher</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col items-center gap-6">
//             {/* Upload Zone */}
//             <div className="w-full">
//               <label 
//                 className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300 hover:border-gray-400"
//               >
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <Upload className="w-12 h-12 mb-3 text-gray-400" />
//                   <p className="mb-2 text-sm text-gray-600">
//                     <span className="font-medium">Upload a paint chip photo</span>
//                   </p>
//                   <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//                 </div>
//                 <input
//                   type="file"
//                   className="hidden"
//                   accept="image/*"
//                   onChange={handleFileUpload}
//                 />
//               </label>
//             </div>

//             {/* Processing State */}
//             {isProcessing && (
//               <div className="text-sm text-gray-600 animate-pulse">
//                 Finding matching products...
//               </div>
//             )}

//             {/* Color Display */}
//             {selectedColor && (
//               <div className="text-center">
//                 <div className="flex items-center gap-4">
//                   <div 
//                     className="w-20 h-20 rounded-lg shadow-lg"
//                     style={{ backgroundColor: selectedColor }}
//                   />
//                   <div className="text-left">
//                     <p className="text-sm font-medium text-gray-900">
//                       Detected Color
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {selectedColor}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Product Results */}
//       {products.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Matching Products</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {products.map((product: any) => (
//                 <div 
//                   key={product.id}
//                   className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
//                 >
//                   <img 
//                     src={product.image} 
//                     alt={product.title}
//                     className="w-24 h-24 object-cover rounded-md"
//                   />
//                   <div className="flex-1">
//                     <div className="flex justify-between">
//                       <h3 className="font-medium text-gray-900 line-clamp-2">
//                         {product.title}
//                       </h3>
//                       <div 
//                         className="w-6 h-6 rounded-md shadow-sm"
//                         style={{ backgroundColor: product.dominantColor }}
//                       />
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       ${product.price.toFixed(2)}
//                     </p>
//                     {product.colorDistance && (
//                       <p className="text-xs text-gray-500">
//                         Match: {Math.round((1 - product.colorDistance/442) * 100)}%
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

