// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

const ALLOWED_CATEGORIES = ['clothing', 'jewelery', 'furniture', 'home decor'];

function calculateColorDistance(color1: string, color2: string): number {
  // ... (keep your existing calculateColorDistance function)
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colors = [
      palette.Vibrant,
      palette.DarkVibrant,
      palette.LightVibrant,
      palette.Muted,
      palette.DarkMuted,
      palette.LightMuted
    ].filter(Boolean);

    colors.sort((a, b) => (b?.population || 0) - (a?.population || 0));

    for (const color of colors) {
      if (color) {
        const [r, g, b] = color.rgb;
        // Skip colors that are too light or too dark
        if ((r + g + b) / 3 > 30 && (r + g + b) / 3 < 225) {
          return `#${color.hex}`;
        }
      }
    }

    return colors[0] ? `#${colors[0].hex}` : '#000000';
  } catch (error) {
    console.error('Error extracting color:', error);
    return '#000000';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    const filteredProducts = products.filter((product: any) => 
      ALLOWED_CATEGORIES.some(category => product.category.toLowerCase().includes(category))
    );

    const productsWithColors = await Promise.all(filteredProducts.map(async (product: any) => {
      const dominantColor = await extractProductColor(product.image);
      const matchPercentage = targetColor ? calculateColorDistance(targetColor, dominantColor) : 100;

      return {
        ...product,
        dominantColor,
        matchPercentage
      };
    }));

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
