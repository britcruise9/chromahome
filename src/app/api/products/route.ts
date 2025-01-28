import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Function to extract dominant color from image URL
async function getColorFromImageUrl(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use sharp to get the dominant color
    const stats = await sharp(buffer).stats();
    const [r, g, b] = stats.channels.map(c => Math.round(c.mean));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error extracting color:', error);
    return '#808080'; // Default gray if extraction fails
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
    // Fetch products from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products?limit=5'); // Limit for quick testing
    const products = await response.json();

    // Process products in parallel
    const productsWithColors = await Promise.all(
      products.map(async (product) => {
        const color = await getColorFromImageUrl(product.image);
        return { ...product, dominantColor: color };
      })
    );

    // If target color provided, filter by similarity
    if (targetColor) {
      return NextResponse.json(
        productsWithColors
          .map(product => ({
            ...product,
            colorDistance: colorDistance(targetColor, product.dominantColor)
          }))
          .sort((a, b) => a.colorDistance - b.colorDistance)
          .slice(0, 3) // Return top 3 matches
      );
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Simple color distance function
function colorDistance(color1: string, color2: string): number {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.slice(0, 2), 16);
  const g1 = parseInt(hex1.slice(2, 4), 16);
  const b1 = parseInt(hex1.slice(4, 6), 16);
  
  const r2 = parseInt(hex2.slice(0, 2), 16);
  const g2 = parseInt(hex2.slice(2, 4), 16);
  const b2 = parseInt(hex2.slice(4, 6), 16);
  
  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}
