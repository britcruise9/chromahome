// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { amazonProducts } from '../../../lib/amazonProducts';

const hexRegex = /^%23/;
const distanceCache = new Map<string, number>();

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// Convert RGB to Lab color space
function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  let [r, g, b] = rgb.map(c => c / 255);
  
  // Convert to XYZ
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  // Convert XYZ to Lab
  let l = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  let a = 500 * ((x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116) - l);
  let b_ = 200 * (l - (z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116));
  l = (116 * l) - 16;

  return [l, a, b_];
}

// Calculate color difference using CIE Lab Delta E
function calculateDeltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  
  const deltaL = l1 - l2;
  const deltaA = a1 - a2;
  const deltaB = b1 - b2;
  
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Calculate weighted brightness difference
function calculateBrightnessDifference(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const brightness1 = (rgb1[0] * 0.299 + rgb1[1] * 0.587 + rgb1[2] * 0.114) / 255;
  const brightness2 = (rgb2[0] * 0.299 + rgb2[1] * 0.587 + rgb2[2] * 0.114) / 255;
  return Math.abs(brightness1 - brightness2);
}

function calculateColorDistance(color1: string, color2: string): number {
  const cacheKey = `${color1}-${color2}`;
  if (distanceCache.has(cacheKey)) return distanceCache.get(cacheKey)!;
  
  try {
    color1 = decodeURIComponent(color1).replace(hexRegex, '#');
    color2 = decodeURIComponent(color2).replace(hexRegex, '#');
    
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const lab1 = rgbToLab(rgb1);
    const lab2 = rgbToLab(rgb2);
    
    // Calculate both color difference and brightness difference
    const deltaE = calculateDeltaE(lab1, lab2);
    const brightnessDiff = calculateBrightnessDifference(rgb1, rgb2);
    
    // Combine both metrics with weights
    const maxDeltaE = 100; // Approximate max possible deltaE
    const normalizedDeltaE = 100 * (1 - deltaE / maxDeltaE);
    const brightnessWeight = 0.3;
    const colorWeight = 0.7;
    
    const matchPercentage = Math.round(
      colorWeight * normalizedDeltaE + 
      brightnessWeight * (100 * (1 - brightnessDiff))
    );
    
    // Ensure the result is between 0 and 100
    const finalMatch = Math.max(0, Math.min(100, matchPercentage));
    
    distanceCache.set(cacheKey, finalMatch);
    return finalMatch;
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

    // Add diversity to results by implementing a simple clustering
    const sortedProducts = productsWithMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Group products into similarity buckets
    const buckets: typeof sortedProducts[] = [[]];
    const bucketThreshold = 10; // Percentage difference threshold for new bucket

    sortedProducts.forEach(product => {
      let addedToBucket = false;
      for (const bucket of buckets) {
        if (bucket.length === 0 || 
            Math.abs(bucket[0].matchPercentage - product.matchPercentage) < bucketThreshold) {
          bucket.push(product);
          addedToBucket = true;
          break;
        }
      }
      if (!addedToBucket) {
        buckets.push([product]);
      }
    });

    // Interleave products from different buckets
    const diversifiedResults = [];
    let maxBucketLength = Math.max(...buckets.map(b => b.length));
    
    for (let i = 0; i < maxBucketLength; i++) {
      for (const bucket of buckets) {
        if (bucket[i]) {
          diversifiedResults.push(bucket[i]);
        }
      }
    }

    return NextResponse.json(diversifiedResults);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
  }
}
