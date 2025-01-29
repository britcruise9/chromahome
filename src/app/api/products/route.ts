// src/app/api/products/route.ts
import { NextResponse } from 'next/server';

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
  const maxDistance = Math.sqrt(Math.pow(255, 2) * 3); // Max possible distance
  const matchPercentage = Math.round((1 - distance / maxDistance) * 100);

  return matchPercentage;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    // Test product colors for debugging
    const productColors = {
      1: "#E53935", // Red
      2: "#1E88E5", // Blue
      3: "#43A047", // Green
      4: "#FDD835", // Yellow
      5: "#8E24AA"  // Purple
    };

    const response = await fetch('https://fakestoreapi.com/products?limit=5');
    const products = await response.json();

    const productsWithColors = products.map((product: any) => {
      const productColor = productColors[product.id as keyof typeof productColors];
      const matchPercentage = targetColor ? calculateColorDistance(targetColor, productColor) : 100;

      return {
        ...product,
        dominantColor: productColor,
        matchPercentage
      };
    });

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
