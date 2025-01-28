"use client";

import React, { useState } from "react";

// Minimal color extraction with canvas
async function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Create canvas & draw image
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported.");
      ctx.drawImage(img, 0, 0);

      // Get pixel data from center
      const { data } = ctx.getImageData(
        Math.floor(img.width / 2),
        Math.floor(img.height / 2),
        1,
        1
      );

      // Convert to hex (#RRGGBB)
      const [r, g, b] = data;
      const hex = `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`.toUpperCase();
      resolve(hex);
    };

    img.onerror = (err) => reject(err);
    // Convert File to a local URL
    img.src = URL.createObjectURL(file);
  });
}

export default function ColorMatcher() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const hex = await extractDominantColor(uploadedFile);
    setSelectedColor(hex);
  };

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

      {selectedColor && (
        <div className="mt-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded border"
            style={{ backgroundColor: selectedColor }}
          />
          <span>{selectedColor}</span>
        </div>
      )}
    </div>
  );
}

  );
}
