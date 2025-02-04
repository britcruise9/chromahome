import { NextResponse } from 'next/server';
import { amazonProducts } from '../../../lib/amazonProducts';
import chroma from 'chroma-js';

declare const ColorThief: any;

const BATCH_SIZE = 10;

async function extractProductColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const colorThief = new ColorThief();

    img.addEventListener('load', () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        resolve(chroma(r, g, b).hex());
      } catch (error) {
        console.error('Color extraction error:', error);
        resolve('#000000');
      }
    });

    img.crossOrigin = 'Anonymous';
    img.onerror = () => resolve('#000000');
    img.src = imageUrl;
  });
}

function calculateColorDistance(color1: string, color2: string): number {
  try {
    // Ensure color strings are properly formatted
    color1 = decodeURIComponent(color1).replace(/^%23/, '#');
    color2 = decodeURIComponent(color2).replace(/^%23/, '#');
    
    const deltaE = chroma.deltaE(color1, color2);
    return Math.max(0, Math.min(100, Math.round((1 - deltaE / 100) * 100)));
  } catch (error) {
    console.error('Color calculation error:', error);
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color')?.replace(/^%23/, '#');
    const source = searchParams.get('source');

    let products = source === 'amazon' ? amazonProducts : [];
    let productsWithColors = [];
    
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

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
  }
}
