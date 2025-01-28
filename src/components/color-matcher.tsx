"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";

// Function to extract the dominant color from the image
async function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported.");
      ctx.drawImage(img, 0, 0);

      // Get pixel data from the center of the image
      const { data } = ctx.getImageData(
        Math.floor(img.width / 2),
        Math.floor(img.height / 2),
        1,
        1
      );

      // Convert RGB to HEX
      const [r, g, b] = data;
      const hex = `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`.toUpperCase();
      resolve(hex);
    };

    img.onerror = (err) => reject(err);
    img.src = URL.createObjectURL(file);
  });
}

// Define Etsy's color palette
const ETSY_COLORS: { [key: string]: string } = {
  black: "#000000",
  blue: "#0000FF",
  bronze: "#CD7F32",
  brown: "#A52A2A",
  clear: "#FFFFFF",
  copper: "#B87333",
  gold: "#FFD700",
  gray: "#808080",
  green: "#008000",
  orange: "#FFA500",
  pink: "#FFC0CB",
  purple: "#800080",
  red: "#FF0000",
  silver: "#C0C0C0",
  white: "#FFFFFF",
  yellow: "#FFFF00",
  beige: "#F5F5DC",
  ivory: "#FFFFF0",
  lime: "#00FF00",
  magenta: "#FF00FF",
  navy: "#000080",
  olive: "#808000",
  plum: "#DDA0DD",
  taupe: "#483C32",
};

// Helper functions to calculate color distance and find the closest Etsy color
function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getClosestEtsyColor(userHex: string): string {
  const userRgb = hexToRgb(userHex);
  let closestColor = "blue"; // default
  let minDistance = Infinity;

  for (const [colorName, hex] of Object.entries(ETSY_COLORS)) {
    const etsyRgb = hexToRgb(hex);
    const distance = colorDistance(userRgb, etsyRgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }

  return closestColor;
}

export default function ColorMatcher() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [etsyProducts, setEtsyProducts] = useState<any[]>([]); // Adjust type as needed
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setIsLoading(true);

    try {
      const hex = await extractDominantColor(uploadedFile);
      setSelectedColor(hex);

      // Find the closest Etsy color
      const colorName = getClosestEtsyColor(hex);

      // Fetch products from Etsy
      const products = await fetchEtsyProducts(colorName);
      setEtsyProducts(products);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchEtsyProducts(colorName: string) {
    const res = await fetch(`/api/etsy?color=${colorName}`);
    const data = await res.json();
    return data.results || [];
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <label className="block w-full h-40 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center bg-gray-50">
        <span className="text-gray-600">Upload a paint chip photo</span>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </label>

      {isLoading && <p className="mt-4">Processing...</p>}

      {selectedColor && (
        <div className="mt-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded border"
            style={{ backgroundColor: selectedColor }}
          />
          <span>{selectedColor}</span>
        </div>
      )}

      {etsyProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Etsy Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {etsyProducts.map((product) => (
              <div key={product.listing_id} className="border rounded-lg p-4">
                <img
                  src={product.Images[0]?.url_fullxfull}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="mt-2 text-lg font-medium">{product.title}</h3>
                <p className="mt-1 text-gray-600">${product.price}</p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-500"
                >
                  View on Etsy
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
