// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { amazonProducts } from '../../../lib/amazonProducts';

const hexRegex = /^%23/;
const distanceCache = new Map<string, number>();

function calculateColorDistance(color1: string, color2: string): number {
  const cacheKey = `${color1}-${color2}`;
  if (distanceCache.has(cacheKey)) return distanceCache.get(cacheKey)!;
  
  try {
    color1 = decodeURIComponent(color1).replace(hexRegex, '#');
    color2 = decodeURIComponent(color2).replace(hexRegex, '#');
    
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // Using weighted Euclidean distance for better perceptual matching
    const distance = Math.sqrt(
      3 * Math.pow(r2 - r1, 2) +
      4 * Math.pow(g2 - g1, 2) +
      2 * Math.pow(b2 - b1, 2)
    );
    
    const maxDistance = Math.sqrt(3 * Math.pow(255, 2) + 4 * Math.pow(255, 2) + 2 * Math.pow(255, 2));
    const percentage = Math.round((1 - distance / maxDistance) * 100);
    
    distanceCache.set(cacheKey, percentage);
    return percentage;
  } catch (error) {
    console.error('Color calculation error:', error);
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color')?.replace(hexRegex, '#');
    
    if (!targetColor) {
      return NextResponse.json(amazonProducts);
    }

    // Calculate matches and sort
    const productsWithMatches = amazonProducts.map(product => ({
      ...product,
      matchPercentage: calculateColorDistance(targetColor, product.dominantColor)
    }));

    // Sort by match percentage
    productsWithMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json(productsWithMatches);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
  }
}
