import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
  colorDistance?: number;
}

function calculateColorDistance(color1: string, color2: string): number {
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
    const products: Product[] = await response.json();

    // Add dominant color to each product using Vibrant
    const productsWithColors = await Promise.all(
      products.map(async (product) => {
        try {
          const palette = await Vibrant.from(product.image).getPalette();
          const dominantColor = palette.Vibrant?.hex || '#000000';
          return { ...product, dominantColor };
        } catch (error) {
          console.error('Error extracting color:', error);
          return { ...product, dominantColor: '#000000' };
        }
      })
    );

    // If target color provided, filter by similarity
    if (targetColor) {
      return NextResponse.json(
        productsWithColors
          .map((product) => ({
            ...product,
            colorDistance: calculateColorDistance(targetColor, product.dominantColor || '#000000')
          }))
          .sort((a, b) => (a.colorDistance || 0) - (b.colorDistance || 0))
          .slice(0, 20) // Return top 20 matches
      );
    }

    return NextResponse.json([]); // Return empty array if no color provided
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
