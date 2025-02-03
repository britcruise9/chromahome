// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

const ALLOWED_CATEGORIES = ['clothing', 'jewelery', 'furniture', 'home decor'];

function calculateColorDistance(color1: string, color2: string): number {
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

  // Using weighted RGB distance for better perceptual matching
  const rMean = (rgb1.r + rgb2.r) / 2;
  const weightR = 2 + rMean / 256;
  const weightG = 4.0;
  const weightB = 2 + (255 - rMean) / 256;
  
  const diffR = rgb1.r - rgb2.r;
  const diffG = rgb1.g - rgb2.g;
  const diffB = rgb1.b - rgb2.b;

  const distance = Math.sqrt(
    weightR * diffR * diffR +
    weightG * diffG * diffG +
    weightB * diffB * diffB
  );

  // Normalize to percentage
  const maxDistance = Math.sqrt(255 * 255 * (weightR + weightG + weightB));
  const matchPercentage = Math.round((1 - distance / maxDistance) * 100);
  
  return Math.max(0, Math.min(100, matchPercentage));
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    const palette = await Vibrant.from(imageUrl)
      .quality(1)
      .maxColorCount(32)
      .getPalette();

    const colors = [
      palette.Vibrant,
      palette.DarkVibrant,
      palette.LightVibrant,
      palette.Muted,
      palette.DarkMuted,
      palette.LightMuted
    ].filter(Boolean);

    // Sort by population only since Swatch doesn't have saturation
    colors.sort((a, b) => {
      if (!a || !b) return 0;
      return (b.population || 0) - (a.population || 0);
    });

    // Find first color within acceptable brightness range
    for (const color of colors) {
      if (color) {
        const [r, g, b] = color.rgb;
        const brightness = (r + g + b) / 3;
        if (brightness > 20 && brightness < 235) {
          return `#${color.hex}`;
        }
      }
    }

    return colors[0] ? `#${colors[0].hex}` : '#000000';
  } catch (error) {
    console.error('Error extracting color:', error);
    return '#000000';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    const filteredProducts = products.filter((product: any) => 
      ALLOWED_CATEGORIES.some(category => 
        product.category?.toLowerCase().includes(category))
    );

    console.log(`Processing ${filteredProducts.length} products`);

    const productsWithColors = await Promise.all(
      filteredProducts.map(async (product: any) => {
        const dominantColor = await extractProductColor(product.image);
        const matchPercentage = targetColor ? 
          calculateColorDistance(targetColor, dominantColor) : 100;

        console.log(`Product ${product.id}: ${product.title}`);
        console.log(`  Color: ${dominantColor}`);
        console.log(`  Match: ${matchPercentage}%`);

        return {
          ...product,
          dominantColor,
          matchPercentage
        };
      })
    );

    if (targetColor) {
      productsWithColors.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error processing products:', error);
    return NextResponse.json(
      { error: 'Failed to process products' },
      { status: 500 }
    );
  }
}
