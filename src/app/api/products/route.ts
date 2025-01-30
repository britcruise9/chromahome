import { NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
  colorDistance?: number;
}

function calculateColorDistance(color1: string, color2: string): number {
  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const { r: r1, g: g1, b: b1 } = hexToRGB(color1);
  const { r: r2, g: g2, b: b2 } = hexToRGB(color2);

  // Weight the colors based on human perception
  return Math.sqrt(
    2 * Math.pow(r2 - r1, 2) + // Weight red more
    4 * Math.pow(g2 - g1, 2) + // Weight green most (humans are most sensitive to green)
    3 * Math.pow(b2 - b1, 2)   // Weight blue between red and green
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
    // Fetch all products from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products');
    const products: Product[] = await response.json();

    // Add dominant color to each product using Vibrant
    const productsWithColors = await Promise.all(
      products.map(async (product) => {
        try {
          const palette = await Vibrant.from(product.image).getPalette();
          
          // Try different color options in order of preference
          const dominantColor = 
            palette.Vibrant?.hex || 
            palette.DarkVibrant?.hex || 
            palette.LightVibrant?.hex ||
            palette.Muted?.hex ||
            palette.DarkMuted?.hex ||
            palette.LightMuted?.hex ||
            '#000000';

          console.log(`Product ${product.title}: extracted color ${dominantColor}`);
          return { ...product, dominantColor };
        } catch (error) {
          console.error('Error extracting color:', error);
          return { ...product, dominantColor: '#000000' };
        }
      })
    );

    // If target color provided, filter by similarity
    if (targetColor) {
      console.log('Target color:', targetColor);
      const sortedProducts = productsWithColors
        .map((product) => {
          const distance = calculateColorDistance(targetColor, product.dominantColor || '#000000');
          return {
            ...product,
            colorDistance: distance
          };
        })
        .sort((a, b) => (a.colorDistance || 0) - (b.colorDistance || 0))
        .slice(0, 20); // Return top 20 matches

      return NextResponse.json(sortedProducts);
    }

    return NextResponse.json([]); // Return empty array if no color provided
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
