// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Previous color conversion functions remain the same
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToLab(rgb: { r: number, g: number, b: number }) {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

  x = x / 95.047;
  y = y / 100.0;
  z = z / 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
}

function getColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 999999;

  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);

  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Convert RGB values to hex color
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Check if a color is too close to white or black
function isNeutralColor(r: number, g: number, b: number): boolean {
  // Check if color is too close to white
  if (r > 240 && g > 240 && b > 240) return true;
  // Check if color is too close to black
  if (r < 15 && g < 15 && b < 15) return true;
  // Check if color is too gray (all channels too similar)
  const avg = (r + g + b) / 3;
  return Math.abs(r - avg) < 10 && Math.abs(g - avg) < 10 && Math.abs(b - avg) < 10;
}

async function getImageColor(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    const { createCanvas, loadImage } = require('canvas');
    const canvas = createCanvas(100, 100); // Resize to smaller dimension for performance
    const ctx = canvas.getContext('2d');
    
    const img = await loadImage(`data:image/jpeg;base64,${base64}`);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Create color buckets for quantization (using lower precision for better grouping)
    const colorBuckets: { [key: string]: number } = {};
    
    // Sample pixels (every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.floor(data[i] / 16) * 16;
      const g = Math.floor(data[i + 1] / 16) * 16;
      const b = Math.floor(data[i + 2] / 16) * 16;
      
      // Skip transparent pixels
      if (data[i + 3] < 128) continue;
      
      // Skip neutral colors (white/black/gray)
      if (isNeutralColor(r, g, b)) continue;
      
      const color = `${r},${g},${b}`;
      colorBuckets[color] = (colorBuckets[color] || 0) + 1;
    }
    
    // Find the most common color
    let maxCount = 0;
    let dominantColor = '#000000';
    
    Object.entries(colorBuckets).forEach(([color, count]) => {
      if (count > maxCount) {
        const [r, g, b] = color.split(',').map(Number);
        maxCount = count;
        dominantColor = rgbToHex(r, g, b);
      }
    });
    
    return dominantColor;
  } catch (error) {
    console.error('Error extracting color from image:', error);
    return '#000000';
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetColor = searchParams.get('color');

    if (!targetColor) {
      return NextResponse.json([]);
    }

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    // Process products in parallel
    const productsWithColors = await Promise.all(
      products.map(async (product) => {
        const dominantColor = await getImageColor(product.image);
        const distance = getColorDistance(targetColor, dominantColor);
        const maxDistance = 100;
        const matchPercentage = Math.max(0, Math.min(100, Math.round((1 - distance / maxDistance) * 100)));
        
        return {
          ...product,
          dominantColor,
          colorDistance: distance,
          matchPercentage
        };
      })
    );

    // Sort by color distance and return top 20 matches
    const sortedProducts = productsWithColors
      .sort((a, b) => a.colorDistance - b.colorDistance)
      .slice(0, 20);

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
