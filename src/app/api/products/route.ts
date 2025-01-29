// src/app/api/products/route.ts
import { NextResponse } from 'next/server';

function calculateColorDistance(color1: string, color2: string): number {
  // Convert hex to RGB
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

  // Calculate Euclidean distance
  const distance = Math.sqrt(
    Math.pow(rgb2.r - rgb1.r, 2) +
    Math.pow(rgb2.g - rgb1.g, 2) +
    Math.pow(rgb2.b - rgb1.b, 2)
  );

  // Convert to a percentage (0-100)
  const maxDistance = Math.sqrt(Math.pow(255, 2) * 3); // Max possible distance
  const matchPercentage = Math.round((1 - distance / maxDistance) * 100);

  return matchPercentage;
}

async function extractProductColor(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        if (!ctx) return resolve('#000000');
        
        // Make canvas smaller to effectively blur the image
        const scaleFactor = 0.1; // Reduce to 10% of original size
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        // Draw image at smaller size (creates blur effect)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get the center pixel from the blurred image
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;

        const hex = '#' + [pixel[0], pixel[1], pixel[2]]
          .map(x => x.toString(16).padStart(2, '0'))
          .join('');
        resolve(hex);
      };
      
      img.src = dataUrl;
    });
  } catch (error) {
    console.error('Error extracting product color:', error);
    return '#000000';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetColor = searchParams.get('color');

    const response = await fetch('https://fakestoreapi.com/products?limit=5');
    const products = await response.json();

    // Process each product to extract its color
    const productsWithColors = await Promise.all(
      products.map(async (product: any) => {
        const dominantColor = await extractProductColor(product.image);
        const matchPercentage = targetColor ? calculateColorDistance(targetColor, dominantColor) : 100;

        return {
          ...product,
          dominantColor,
          matchPercentage
        };
      })
    );

    // Sort by match percentage if target color is provided
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
