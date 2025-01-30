import { NextResponse } from 'next/server';
import Vibrant from 'vibrant';

const ALLOWED_CATEGORIES = ['men\'s clothing', 'women\'s clothing', 'jewelery', 'electronics'];

async function extractProductColor(imageUrl: string): Promise<{ dominantColor: string; complementaryColor: string }> {
  const palette = await Vibrant.from(imageUrl).getPalette();

  // Find the most dominant non-white/non-black color
  let dominantColor: Vibrant.Swatch | null = null;
  let maxPopulation = 0;
  for (const swatch of Object.values(palette)) {
    if (swatch.population > maxPopulation && swatch.hsl.l > 0.2 && swatch.hsl.l < 0.8) {
      dominantColor = swatch;
      maxPopulation = swatch.population;
    }
  }

  // If no suitable dominant color found, default to white
  if (!dominantColor) {
    dominantColor = palette.Vibrant;
  }

  // Calculate complementary color
  const { h, s, l } = dominantColor!.hsl;
  const complementaryColor = `#${Vibrant.toString([(h + 180) % 360, s, l])}`;

  return {
    dominantColor: `#${dominantColor!.hex}`,
    complementaryColor
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetColor = searchParams.get('color');

  try {
    // Fetch all products from FakeStore API
    const response = await fetch('https://fakestoreapi.com/products');
    const allProducts = await response.json();

    // Filter to only allowed categories
    const filteredProducts = allProducts.filter((product: any) =>
      ALLOWED_CATEGORIES.includes(product.category)
    );

    // Add dominant and complementary colors to each product
    const productsWithColors = await Promise.all(
      filteredProducts.map(async (product: any) => {
        const { dominantColor, complementaryColor } = await extractProductColor(product.image);
        return { ...product, dominantColor, complementaryColor };
      })
    );

    // If target color provided, filter by similarity
    if (targetColor) {
      const sortedProducts = productsWithColors
        .map((product) => ({
          ...product,
          colorDistance: calculateColorDistance(targetColor, product.dominantColor || '#000000')
        }))
        .sort((a, b) => a.colorDistance - b.colorDistance)
        .slice(0, 20);

      // Move products with the target color to the top
      const targetColorProducts = sortedProducts.filter(
        (product) => product.dominantColor === targetColor
      );
      const otherProducts = sortedProducts.filter(
        (product) => product.dominantColor !== targetColor
      );
      return NextResponse.json([...targetColorProducts, ...otherProducts]);
    }

    return NextResponse.json(productsWithColors);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
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

  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}
