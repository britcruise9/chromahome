import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return NextResponse.json([
    {
      id: 1,
      title: "Sample Product",
      price: 29.99,
      image: "https://via.placeholder.com/150",
      dominantColor: "#FF5733",
      colorDistance: 100
    }
  ]);
}
