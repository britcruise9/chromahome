// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

// Define allowed categories
const ALLOWED_CATEGORIES = [
  'men\'s clothing',
  'women\'s clothing',
  'furniture',
  'home decor',
  'home decoration'
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    // Filter products by category first
    const filteredProducts = products.filter((product: any) => 
      ALLOWED_CATEGORIES.includes(product.category.toLowerCase())
    );

    // Process each product to extract its color
    const productsWithColors = await Promise.all(
      filteredProducts.map(async (product: any) => {
        const dominantColor = await extractProductColor(product.image);
        const matchPercentage = targetColor ? 
          calculateColorDistance(targetColor, dominantColor) : 100;

        return {
          ...product,
          dominantColor,
          matchPercentage
        };
      })
    );

    // Sort by match percentage if target color is provided
    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
