// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

const ALLOWED_CATEGORIES = ['clothing', 'jewelery', 'furniture', 'home decor'];
const CACHE_DURATION = 3600; // 1 hour caching
const BATCH_SIZE = 5;
const RATE_LIMIT_MS = 1000; // 1 second between batches

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    // Optional per-call delay for rate limiting individual extractions
    await sleep(100);
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
          // Assuming color.hex already includes the '#' prefix
          return color.hex;
        }
      }
    }

    // Fallback to first color
    return colors[0] && colors[0].hex ? colors[0].hex : '#000000';
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

    const maxDistance = Math.sqrt(255 * 255 * 3);
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
    const filteredProducts = products.filter((product: any) => 
      ALLOWED_CATEGORIES.some(category => product.category?.toLowerCase().includes(category))
    );

    let productsWithColors: any[] = [];

    // Process products in batches
    for (let i = 0; i < filteredProducts.length; i += BATCH_SIZE) {
      const batch = filteredProducts.slice(i, i + BATCH_SIZE);
      // Rate limit between batches
      await sleep(RATE_LIMIT_MS);
      const results = await Promise.all(
        batch.map(async (product: any) => {
          console.log(`Processing ${product.title}`);
          const dominantColor = await extractProductColor(product.image);
          console.log(`Extracted color for ${product.title}:`, dominantColor);
          const matchPercentage = targetColor 
            ? calculateColorDistance(targetColor, dominantColor)
            : 100;
          return {
            ...product,
            dominantColor,
            matchPercentage
          };
        })
      );
      productsWithColors.push(...results);
    }

    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_DURATION}`
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process products' },
      { status: 500 }
    );
  }
}

