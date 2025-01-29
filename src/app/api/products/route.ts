// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate color distance using Delta E (simplified version)
function getColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 999999; // Return large number if invalid colors

  // Calculate Euclidean distance between colors
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Sample product colors - we'll use these to simulate product colors
const SAMPLE_COLORS = [
  '#1B1B1B', // Black
  '#2E2E2E', // Dark Gray
  '#404040', // Charcoal
  '#4A4A4A', // Medium Gray
  '#696969', // Dim Gray
  '#808080', // Gray
  '#A9A9A9', // Dark Gray
  '#C0C0C0', // Silver
  '#D3D3D3', // Light Gray
  '#DCDCDC', // Gainsboro
  '#F5F5F5', // White Smoke
  '#FFFFFF', // White
  '#8B4513', // Saddle Brown
  '#A0522D', // Sienna
  '#6B4423', // Brown
  '#800000', // Maroon
  '#8B0000', // Dark Red
  '#B22222', // Fire Brick
  '#DC143C', // Crimson
  '#FF0000', // Red
  '#FF4500', // Orange Red
  '#FF6347', // Tomato
  '#FF7F50', // Coral
  '#FFA07A', // Light Salmon
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetColor = searchParams.get('color');

    // If no color parameter is provided, return empty array
    if (!targetColor) {
      return NextResponse.json([]);
    }

    // Fetch all available products
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    // Add color and calculate color distance for each product
    const productsWithColors = products.map(product => {
      // Assign a random color from our sample colors
      const randomColor = SAMPLE_COLORS[Math.floor(Math.random() * SAMPLE_COLORS.length)];
      
      return {
        ...product,
        dominantColor: randomColor,
        colorDistance: getColorDistance(targetColor, randomColor)
      };
    });

    // Sort by color distance (closest matches first)
    const sortedProducts = productsWithColors.sort((a, b) => a.colorDistance - b.colorDistance);

    // Return the top 20 closest color matches
    return NextResponse.json(sortedProducts.slice(0, 20));
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
