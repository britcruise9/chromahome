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
