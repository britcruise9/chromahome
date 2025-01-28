// File: src/components/color-matcher.tsx

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

export default function ColorMatcher() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setIsLoading(true);

    try {
      const hex = await extractDominantColor(uploadedFile);
      setSelectedColor(hex);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <label className="block w-full h-40 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center bg-gray-50">
        <Upload className="w-12 h-12 text-gray-400 mb-2" />
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
          <span className="text-lg font-medium">{selectedColor}</span>
        </div>
      )}
    </div>
  );
}
