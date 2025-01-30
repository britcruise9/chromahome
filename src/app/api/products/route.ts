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
}

async function getDominantColor(imageUrl: string): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        if (!ctx) {
          resolve('#000000');
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const centerX = Math.floor(img.width / 2);
        const centerY = Math.floor(img.height / 2);
        const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
        
        const hex = '#' + [pixel[0], pixel[1], pixel[2]]
          .map(x => x.toString(16).padStart(2, '0'))
          .join('');
          
        resolve(hex);
      };
      
      img.onerror = reject;
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error getting dominant color:', error);
    return '#000000';
  }
}

function colorDistance(color1: string, color2: string): number {
  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const { r: r1, g: g1, b: b1 } = hexToRGB(color1);
  const { r: r2, g: g2, b: b2 } = hexToRGB(color2);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
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
          .sort((a, b) => a.colorDistance - b.colorDistance)
          .slice(0, 20)
      );
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
