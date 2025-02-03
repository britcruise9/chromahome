import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';
import { amazonProducts } from '@/lib/amazonProducts';

const ALLOWED_CATEGORIES = ['clothing', 'jewelery', 'furniture', 'home decor'];
const CACHE_DURATION = 3600; // seconds
const BATCH_SIZE = 10;

// In-memory cache for dominant colors keyed by image URL.
const colorCache: { [url: string]: string } = {};

async function extractProductColor(imageUrl: string): Promise<string> {
  if (colorCache[imageUrl]) return colorCache[imageUrl];
  try {
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

    let dominantColor = '#000000';
    if (colors.length > 0) {
      for (const color of colors) {
        if (color && color.rgb) {
          const [r, g, b] = color.rgb;
          if ((r + g + b) / 3 > 30 && (r + g + b) / 3 < 240) {
            dominantColor = color.hex;
            break;
          }
        }
      }
    }
    colorCache[imageUrl] = dominantColor;
    return dominantColor;
  } catch (error) {
    console.error('Error extracting color:', error, 'URL:', imageUrl);
    colorCache[imageUrl] = '#000000';
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
    const source = searchParams.get('source'); // 'amazon' or leave blank

    let products: any[] = [];
    if (source === 'amazon') {
      products = amazonProducts;
    } else {
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      products = await response.json();
      products = products.filter((product: any) =>
        ALLOWED_CATEGORIES.some(category =>
          product.category?.toLowerCase().includes(category)
        )
      );
    }

    let productsWithColors: any[] = [];
    // Process products in batches to extract dominant colors.
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (product: any) => {
          const dominantColor = await extractProductColor(product.image);
          const matchPercentage = targetColor ? calculateColorDistance(targetColor, dominantColor) : 100;
          return { ...product, dominantColor, matchPercentage };
        })
      );
      productsWithColors.push(...results);
    }

    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors, {
      headers: { 'Cache-Control': `public, max-age=${CACHE_DURATION}` }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
  }
}
