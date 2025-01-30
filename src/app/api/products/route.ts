// File: src/app/api/products/route.ts

import { NextResponse } from 'next/server';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
    // Fetch all products (will return 20 products)
    const response = await fetch('https://fakestoreapi.com/products');
    const allProducts = await response.json();

    // Add dominant color to each product
    const productsWithColors = await Promise.all(
      allProducts.map(async (product: Product) => {
        const color = await getDominantColor(product.image);
        return { ...product, dominantColor: color };
      })
    );

    // If target color provided, sort by similarity
    if (targetColor) {
      return NextResponse.json(
        productsWithColors
          .map((product) => ({
            ...product,
            colorDistance: colorDistance(targetColor, product.dominantColor || '#000000')
          }))
          .sort((a, b) => a.colorDistance - b.colorDistance)
          .slice(0, 20) // Show all products, sorted by color similarity
      );
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
