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

// Simplified dominant color function that returns a placeholder for now
async function getDominantColor(imageUrl: string): Promise<string> {
  // For testing, return a placeholder color based on the URL
  // This ensures the API works while we figure out proper color extraction
  return '#FF0000';  // Default to red for testing
}

function colorDistance(color1: string, color2: string): number {
  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const { r: r1, g: g1, b: b1 } = hexToRGB(color1);
  const { r: r2, g: g2, b: b2 } = hexToRGB(color2);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
    // Fetch all products from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products');
    const allProducts = await response.json();

    // Add dominant color to each product
    const productsWithColors = await Promise.all(
      allProducts.map(async (product: Product) => {
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
          .slice(0, 20)
      );
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
