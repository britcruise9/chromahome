// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import * as Vibrant from 'node-vibrant';

function calculateColorDistance(color1: string, color2: string): number {
  // Convert hex to RGB
  const rgb1 = {
    r: parseInt(color1.slice(1, 3), 16),
    g: parseInt(color1.slice(3, 5), 16),
    b: parseInt(color1.slice(5, 7), 16)
  };
  
  const rgb2 = {
    r: parseInt(color2.slice(1, 3), 16),
    g: parseInt(color2.slice(3, 5), 16),
    b: parseInt(color2.slice(5, 7), 16)
  };

  // Calculate Euclidean distance
  const distance = Math.sqrt(
    Math.pow(rgb2.r - rgb1.r, 2) +
    Math.pow(rgb2.g - rgb1.g, 2) +
    Math.pow(rgb2.b - rgb1.b, 2)
  );

  // Convert to a percentage (0-100)
  const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);
  const matchPercentage = Math.round((1 - distance / maxDistance) * 100);

  return matchPercentage;
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    // Get the dominant color from the palette
    const dominantColor = palette.Vibrant?.hex || '#000000';
    return dominantColor;
  } catch (error) {
    console.error('Error extracting color:', error);
    return '#000000';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    // Fetch all products (removed limit)
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    // Process each product to extract its color
    const productsWithColors = await Promise.all(
      products.map(async (product: any) => {
        const dominantColor = await extractProductColor(product.image);
        const matchPercentage = targetColor ? calculateColorDistance(targetColor, dominantColor) : 100;

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
