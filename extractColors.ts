// extractColors.ts
import getColors from 'get-image-colors';
import { amazonProducts, AmazonProduct } from './src/lib/amazonProducts';

async function extractDominantColor(url: string): Promise<string> {
  try {
    // Instruct get-image-colors to use sharp as its engine.
    const colors = await getColors(url, { engine: 'sharp' });
    return colors[0].hex();
  } catch (error) {
    console.error('Error extracting color for:', url, error);
    return '#000000';
  }
}

async function runBatchExtraction() {
  const updatedProducts: AmazonProduct[] = [];
  for (const product of amazonProducts) {
    console.log(`Extracting color for product ${product.id}...`);
    const dominantColor = await extractDominantColor(product.image);
    console.log(`Product ${product.id}: ${dominantColor}`);
    // Type assertion ensures the updated product fits the AmazonProduct interface.
    updatedProducts.push({ ...product, dominantColor } as AmazonProduct);
  }
  console.log('Updated Products JSON:');
  console.log(JSON.stringify(updatedProducts, null, 2));
}

runBatchExtraction().catch(console.error);
