// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to LAB
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

// Calculate color distance using CIELAB Delta E
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

// Sample product colors with more realistic product colors
const SAMPLE_COLORS = [
    '#FF0000', '#FF4444', '#CC0000', // Reds
    '#0000FF', '#4444FF', '#0000CC', // Blues
    '#00FF00', '#44FF44', '#00CC00', // Greens
    '#FFFF00', '#FFFF44', '#CCCC00', // Yellows
    '#FF00FF', '#FF44FF', '#CC00CC', // Magentas
    '#00FFFF', '#44FFFF', '#00CCCC', // Cyans
    '#000000', '#444444', '#888888', // Grays
    '#FFFFFF', '#CCCCCC', '#AAAAAA', // Whites
    '#964B00', '#A0522D', '#6B4423', // Browns
    '#FFA500', '#FF8C00', '#FFD700'  // Oranges
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetColor = searchParams.get('color');

    if (!targetColor) {
      return NextResponse.json([]);
    }

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    const productsWithColors = products.map(product => {
      const randomColor = SAMPLE_COLORS[Math.floor(Math.random() * SAMPLE_COLORS.length)];
      const distance = getColorDistance(targetColor, randomColor);
      
      // Convert distance to a more intuitive percentage (closer to how humans perceive color difference)
      const maxDistance = 100; // Maximum meaningful CIELAB distance
      const matchPercentage = Math.max(0, Math.min(100, Math.round((1 - distance / maxDistance) * 100)));
      
      return {
        ...product,
        dominantColor: randomColor,
        colorDistance: distance,
        matchPercentage
      };
    });

    // Sort by color distance (closest matches first)
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
