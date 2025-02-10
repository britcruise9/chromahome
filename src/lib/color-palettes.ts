// src/lib/color-palettes.ts

export interface ColorPalette {
  name: string;
  description: string;
  primary: string;
  complementary: string;
  triadic1: string;
  triadic2: string;
}

export const PRESET_PALETTES: ColorPalette[] = [
  {
    name: "Coastal Modern",
    description: "Serene ocean-inspired tones for a calm, beachy vibe",
    primary: "#B8C5D6",        // Soft Blue-Gray
    complementary: "#D6C9B8",  // Warm Sand
    triadic1: "#B8D6C5",      // Sea Glass Green
    triadic2: "#B8BED6"       // Pale Ocean Blue
  },
  {
    name: "Modern Farmhouse",
    description: "Timeless neutrals with rustic warmth",
    primary: "#F5F5F0",        // Warm White
    complementary: "#3C4142",  // Charcoal Gray
    triadic1: "#D2D6CD",      // Sage Green
    triadic2: "#D6CEC4"       // Weathered Wood
  },
  {
    name: "Scandinavian Minimal",
    description: "Clean, bright, and beautifully simple",
    primary: "#FFFFFF",        // Cloud White
    complementary: "#E0E3E6",  // Cool Gray
    triadic1: "#F3E9D9",      // Blonde Wood
    triadic2: "#2C2C2C"       // Soft Black
  },
  {
    name: "Desert Modern",
    description: "Warm earth tones inspired by natural landscapes",
    primary: "#E07A5F",        // Terracotta
    complementary: "#81936E",  // Sage Green
    triadic1: "#D6C5B3",      // Sand Beige
    triadic2: "#8B5E51"       // Adobe Brown
  }
];
