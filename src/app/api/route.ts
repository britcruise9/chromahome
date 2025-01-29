// src/app/api/products/route.ts
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
    // Fetch all products from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products');
    const allProducts = await response.json();

    // Filter products for "home decor" category
    const homeDecorProducts = allProducts.filter((product: Product) =>
      product.category.toLowerCase().includes('home')
    );

    // Add dominant color to each product
    const productsWithColors = await Promise.all(
      homeDecorProducts.map(async (product: Product) => {
        const color = await getDominantColor(product.image);
        return { ...product, dominantColor: color };
      })
    );

    // If target color provided, filter by similarity
    if (targetColor) {
      return NextResponse.json(
        productsWithColors
          .map((product) => ({
            ...product,
            colorDistance: colorDistance(targetColor, product.dominantColor || '#000000')
          }))
          .sort((a, b) => a.colorDistance - b.colorDistance)
          .slice(0, 12) // Return top 12 matches
      );
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

async function getDominantColor(imageUrl: string): Promise<string> {
  try {
    // Existing color extraction logic
    // ...
    return '#AABBCC'; // Replace with the actual dominant color
  } catch (error) {
    console.error('Error getting dominant color:', error);
    return '#000000'; // Return a default color if extraction fails
  }
}

function colorDistance(color1: string, color2: string): number {
  // Existing color distance calculation
  // ...
}
