/// <reference types="next" />


import { NextResponse } from 'next/server';
import { amazonProducts } from '../../../lib/amazonProducts.js';

declare const ColorThief: any;

const BATCH_SIZE = 50;
const hexRegex = /^%23/;
const distanceCache = new Map<string, number>();
const getCacheKey = (c1: string, c2: string) => `${c1}-${c2}`;

async function extractProductColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const colorThief = new ColorThief();
      
      img.addEventListener('load', () => {
        try {
          const [r, g, b] = colorThief.getColor(img);
          resolve(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
        } catch (error) {
          console.error('Color extraction error:', error);
          resolve('#000000');
        }
      });
      
      img.crossOrigin = 'Anonymous';
      img.onerror = () => resolve('#000000');
      img.src = imageUrl;
    } catch (error) {
      console.error('Error in extractProductColor:', error);
      resolve('#000000');
    }
  });
}

function calculateColorDistance(color1: string, color2: string): number {
  const cacheKey = getCacheKey(color1, color2);
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
    
    const distance = Math.sqrt(
      3 * Math.pow(r2 - r1, 2) +
      4 * Math.pow(g2 - g1, 2) +
      2 * Math.pow(b2 - b1, 2)
    );
    const maxDistance = Math.sqrt(255 * 255 * 9);
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
    const source = searchParams.get('source');

    let products = source === 'amazon' ? amazonProducts : [];
    let productsWithColors = [];
    
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (product: any) => {
          try {
            const dominantColor = await extractProductColor(product.image);
            const matchPercentage = targetColor ? calculateColorDistance(targetColor, dominantColor) : 100;
            return { ...product, dominantColor, matchPercentage };
          } catch (error) {
            console.error('Error processing product', product.id, error);
            return { ...product, dominantColor: "#000000", matchPercentage: 0 };
          }
        })
      );
      productsWithColors.push(...results);
    }

    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
  }
}
