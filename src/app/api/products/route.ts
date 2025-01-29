// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Simulated home product categories and keywords
const HOME_KEYWORDS = [
  'furniture', 'chair', 'table', 'lamp', 'decor', 'pillow', 'rug', 
  'blanket', 'vase', 'mirror', 'shelf', 'storage', 'home', 'living'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const color = searchParams.get('color');

    // If no color parameter is provided, return empty array
    if (!color) {
      return NextResponse.json([]);
    }

    // Fetch all products since we need to filter them
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();

    // Filter for home-related products based on title and description
    const homeProducts = products.filter(product => {
      const searchText = `${product.title} ${product.description}`.toLowerCase();
      return HOME_KEYWORDS.some(keyword => searchText.includes(keyword));
    });

    // If we don't have enough home products, pad with other products
    let finalProducts = homeProducts.length >= 10 ? 
      homeProducts.slice(0, 10) : 
      [...homeProducts, ...products.slice(0, 10 - homeProducts.length)];

    // Add simulated home-appropriate colors
    const homeColors = [
      '#8A9A8B', // Sage Green
      '#D4C7B0', // Warm Beige
      '#B4A284', // Taupe
      '#A49592', // Warm Gray
      '#C1B2A2', // Light Brown
      '#8B8589', // Mauve Gray
      '#9C9283', // Greige
      '#A89B8C', // Warm Taupe
      '#B5A397', // Light Taupe
      '#9A8478'  // Mushroom
    ];

    const productsWithColors = finalProducts.map((product, index) => ({
      ...product,
      dominantColor: homeColors[index % homeColors.length],
      // Add home-specific category if it's not already home-related
      category: homeProducts.includes(product) ? 'home decor' : 'home accessories'
    }));

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
