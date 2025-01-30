import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

const ALLOWED_CATEGORIES = ['clothing', 'jewelery', 'electronics'];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function calculateColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;

  const rmean = (rgb1.r + rgb2.r) / 2;
  const r = rgb1.r - rgb2.r;
  const g = rgb1.g - rgb2.g;
  const b = rgb1.b - rgb2.b;
  
  return 100 - Math.sqrt((((512+rmean)*r*r)>>8) + 4*g*g + (((767-rmean)*b*b)>>8)) / 7.65;
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colors = [
      palette.Vibrant,
      palette.LightVibrant,
      palette.DarkVibrant,
      palette.Muted,
      palette.LightMuted,
      palette.DarkMuted
    ].filter(Boolean);

    colors.sort((a, b) => b!.population - a!.population);

    for (const color of colors) {
      if (color) {
        const [r, g, b] = color.rgb;
        // Skip colors that are too light or too dark
        if (r + g + b > 60 && r + g + b < 700) {
          return `#${color.hex}`;
        }
      }
    }

    // If no suitable color found, return the most dominant
    return colors[0] ? `#${colors[0].hex}` : '#CCCCCC';
  } catch (error) {
    console.error('Error extracting color:', error);
    return '#CCCCCC'; // Default gray if extraction fails
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    const filteredProducts = products.filter((product: any) => 
      ALLOWED_CATEGORIES.includes(product.category)
    );

    const productsWithColors = await Promise.all(filteredProducts.map(async (product: any) => {
      const dominantColor = await extractProductColor(product.image);
      const matchPercentage = targetColor ? calculateColorDistance(targetColor, dominantColor) : 100;

      return {
        ...product,
        dominantColor,
        matchPercentage: Math.round(matchPercentage)
      };
    }));

    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
