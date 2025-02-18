"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  ArrowDown,
  Pin,
  PinOff,
  Palette,
  Settings,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Camera,
} from "lucide-react";
import { HslColorPicker } from "react-colorful";
import { amazonProducts } from "../lib/amazonProducts";

// Color Utility Functions
function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Main Component
export default function ModernUploader() {
  const [hasUploaded, setHasUploaded] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 pb-20">
      {/* Hero Section */}
      <div className="relative h-[38vh] md:h-[45vh] mb-12 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            <span className="text-gray-900">SHOP BY</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              COLOR
            </span>
          </h1>
          <p className="mt-2 text-xl md:text-2xl text-gray-700">
            Find furniture & décor that perfectly matches your style.
          </p>
        </div>
      </div>

      {/* Color Selection Section */}
      <div className="max-w-6xl mx-auto px-4 pb-20 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">
          Select your color to start.
        </h3>
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-8">
          {/* Upload */}
          <label className="group cursor-pointer flex flex-col items-center">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
              <Upload className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                Upload
              </span>
            </div>
            <input type="file" className="hidden" accept="image/*" />
          </label>

          {/* Snap (Camera) */}
          <label className="group cursor-pointer flex flex-col items-center">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
              <Camera className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                Snap
              </span>
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden" />
          </label>

          {/* Select (Palette) */}
          <div className="group cursor-pointer flex flex-col items-center">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
              <Palette className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                Select
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-2 text-center text-sm z-50">
        Contact us at: <a href="mailto:info@example.com">info@shop-by-color.com</a>
      </footer>
    </div>
  );
}

