// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 999999;

  // Simple RGB distance for now
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Sample product colors - more realistic for product photos
const PRODUCT_COLORS = [
  '#1B1B1B', '#2E2E2E', '#404040', // Blacks
  '#FF0000', '#8B0000', '#DC143C', // Reds
  '#0000FF', '#000080', '#4169E1', // Blues
  '#006400', '#228B22', '#32CD32', // Greens
  '#8B4513', '#A0522D', '#DEB887', // Browns
  '#4B0082', '#800080', '#BA55D3', // Purples
  '#FFD700', '#DAA520', '#B8860B', // Golds
  '#C0C0C0', '#A9A9A9', '#808080', // Grays
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetColor = searchParams.get('color');

    if (!targetColor) {
      return NextResponse.json([]);
    }

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    const productsWithColors = products.map(product => {
      // Assign a color based on product ID to keep it consistent between requests
      const colorIndex = product.id % PRODUCT_COLORS.length;
      const dominantColor = PRODUCT_COLORS[colorIndex];
      const distance = getColorDistance(targetColor, dominantColor);
      
      // Convert distance to a more intuitive percentage
      const maxDistance = 442; // Max possible RGB distance
      const matchPercentage = Math.max(0, Math.min(100, Math.round((1 - distance / maxDistance) * 100)));
      
      return {
        ...product,
        dominantColor,
        colorDistance: distance,
        matchPercentage
      };
    });

    // Sort by color distance and return top 20 matches
    const sortedProducts = productsWithColors
      .sort((a, b) => a.colorDistance - b.colorDistance)
      .slice(0, 20);

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
