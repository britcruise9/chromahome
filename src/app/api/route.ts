// src/app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Just fetch 5 products, no color matching yet
    const response = await fetch('https://fakestoreapi.com/products?limit=5');
    const products = await response.json();

    // Add dummy colors for testing
    const productsWithColors = products.map(product => ({
      ...product,
      dominantColor: '#8A9A8B' // Just a test color
    }));

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
