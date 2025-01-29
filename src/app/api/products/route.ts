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

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    const palette = await Vibrant.from(imageUrl)
      .quality(1) // Fast processing
      .maxColorCount(5) // Get top 5 colors
      .getPalette();
    
    // Convert palette to array and sort by population
    const colors = Object.values(palette)
      .filter(swatch => swatch !== null)
      .sort((a, b) => (b?.population || 0) - (a?.population || 0));
    
    // Get the most dominant color that isn't too light or dark
    for (const swatch of colors) {
      if (!swatch) continue;
      
      const [r, g, b] = swatch.rgb;
      // More lenient threshold for white
      if (r + g + b > 700 || r + g + b < 100) continue;
      
      return swatch.hex;
    }
    
    // Fallback to first color if no good ones found
    return colors[0]?.hex || '#000000';
  } catch (error) {
    console.error('Error extracting color:', error);
    return '#000000';
  }
}

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
