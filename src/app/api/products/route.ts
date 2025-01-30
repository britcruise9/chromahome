// File: src/app/api/products/route.ts

import { NextResponse } from 'next/server';

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

// Color utilities
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

const colorDistance = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Calculate Euclidean distance in RGB space
  return Math.sqrt(
    Math.pow(rgb2.r - rgb1.r, 2) +
    Math.pow(rgb2.g - rgb1.g, 2) +
    Math.pow(rgb2.b - rgb1.b, 2)
  );
};

const getDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        if (!ctx) {
          resolve('#000000');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Sample multiple points for better color detection
        const samplePoints = [
          { x: Math.floor(img.width / 2), y: Math.floor(img.height / 2) },  // Center
          { x: Math.floor(img.width / 4), y: Math.floor(img.height / 4) },  // Top left
          { x: Math.floor(3 * img.width / 4), y: Math.floor(img.height / 4) }  // Top right
        ];

        let r = 0, g = 0, b = 0;
        samplePoints.forEach(point => {
          const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
          r += pixel[0];
          g += pixel[1];
          b += pixel[2];
        });

        // Average the sampled colors
        r = Math.round(r / samplePoints.length);
        g = Math.round(g / samplePoints.length);
        b = Math.round(b / samplePoints.length);

        const hex = rgbToHex(r, g, b);
        resolve(hex);
      };
      
      img.src = URL.createObjectURL(new Blob([arrayBuffer]));
    });
  } catch (error) {
    console.error('Error getting dominant color:', error);
    return '#000000';
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
    // Fetch all products from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products');
    const allProducts = await response.json();

    // Add dominant color to each product
    const productsWithColors = await Promise.all(
      allProducts.map(async (product: Product) => {
        const color = await getDominantColor(product.image);
        return { ...product, dominantColor: color };
      })
    );

    // If target color provided, sort by similarity
    if (targetColor) {
      return NextResponse.json(
        productsWithColors
          .map((product) => ({
            ...product,
            colorDistance: colorDistance(targetColor, product.dominantColor || '#000000')
          }))
          .sort((a, b) => (a.colorDistance || 0) - (b.colorDistance || 0))
          .slice(0, 20) // Show all products, sorted by color similarity
      );
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
