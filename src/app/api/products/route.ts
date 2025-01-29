// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const color = searchParams.get('color');

    // If no color parameter is provided, return empty array
    if (!color) {
      return NextResponse.json([]);
    }

    // If color is provided, fetch 10 products
    const response = await fetch('https://fakestoreapi.com/products?limit=10');
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
