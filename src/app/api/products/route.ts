// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

const ALLOWED_CATEGORIES = ['clothing', 'jewelery', 'furniture', 'home decor'];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    await sleep(100); // Rate limiting
    const palette = await Vibrant.from(imageUrl)
      .maxColorCount(64)
      .quality(10)
      .getPalette();

    if (!palette) throw new Error('Failed to extract palette');

    const colors = [
      palette.Vibrant,
      palette.DarkVibrant,
      palette.LightVibrant,
      palette.Muted,
      palette.DarkMuted,
      palette.LightMuted
    ].filter(Boolean);

    if (colors.length === 0) {
      console.error('No colors extracted from image:', imageUrl);
      return '#000000';
    }

    for (const color of colors) {
      if (color && color.rgb) {
        const [r, g, b] = color.rgb;
        if ((r + g + b) / 3 > 30 && (r + g + b) / 3 < 240) {
          return `#${color.hex}`;
        }
      }
    }

    // Fallback to first color
    return colors[0] && colors[0].hex ? `#${colors[0].hex}` : '#000000';
  } catch (error) {
    console.error('Error extracting color:', error, 'URL:', imageUrl);
    return '#000000';
  }
}

function calculateColorDistance(color1: string, color2: string): number {
  try {
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

    const distance = Math.sqrt(
      Math.pow(rgb2.r - rgb1.r, 2) +
      Math.pow(rgb2.g - rgb1.g, 2) +
      Math.pow(rgb2.b - rgb1.b, 2)
    );

    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);
    return Math.round((1 - distance / maxDistance) * 100);
  } catch (error) {
    console.error('Error calculating color distance:', error);
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');
    
    console.log('Target color:', targetColor);

    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const products = await response.json();
    const filteredProducts = products.filter(product => 
      ALLOWED_CATEGORIES.some(category => 
        product.category?.toLowerCase().includes(category)
      )
    );

    const productsWithColors = await Promise.all(
      filteredProducts.map(async (product: any) => {
        console.log(`Processing ${product.title}`);
        const dominantColor = await extractProductColor(product.image);
        console.log(`Extracted color for ${product.title}:`, dominantColor);
        
        const matchPercentage = targetColor ? 
          calculateColorDistance(targetColor, dominantColor) : 100;

        return {
          ...product,
          dominantColor,
          matchPercentage
        };
      })
    );

    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process products' },
      { status: 500 }
    );
  }
}
