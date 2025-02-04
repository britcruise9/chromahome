import { NextResponse } from 'next/server';
import { amazonProducts } from '../../../lib/amazonProducts';

declare const ColorThief: any;

const BATCH_SIZE = 10;

async function extractProductColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const colorThief = new ColorThief();

    img.addEventListener('load', () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        resolve(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
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
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  // Weight the RGB channels according to human perception
  const weightedDistance = Math.sqrt(
    2 * Math.pow(r2 - r1, 2) + 
    4 * Math.pow(g2 - g1, 2) + 
    3 * Math.pow(b2 - b1, 2)
  );
  
  const maxWeightedDistance = Math.sqrt(255 * 255 * 9); // Max possible weighted distance
  return Math.round((1 - weightedDistance / maxWeightedDistance) * 100);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');
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

    return NextResponse.json(productsWithColors, {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
  }
}
