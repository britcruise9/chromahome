import React, { useState, useCallback } from 'react';
import { Camera, Droplet, Upload, ArrowLeft } from 'lucide-react';

const ModernUploader = () => {
  const [view, setView] = useState('initial'); // initial, uploading, results
  const [selectedColor, setSelectedColor] = useState(null);
  const [complementaryColor, setComplementaryColor] = useState(null);
  const [products, setProducts] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const extractColor = async (file) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
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
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Error getting color:', error);
      return '#000000';
    }
  };

  const fetchProducts = async (color) => {
    try {
      const response = await fetch(`/api/products?color=${encodeURIComponent(color)}`);
      const data = await response.json();
      setProducts(data);
      setView('results');
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const color = await extractColor(file);
    setSelectedColor(color);
    await fetchProducts(color);
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      {/* Header - stays consistent */}
      <div className={`transition-all duration-500 ${view !== 'initial' ? 'pt-8 pb-4' : 'pt-32 pb-16'}`}>
        <h1 className="text-center text-6xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient bg-[length:200%_auto]">
            CHROMA
          </span>
        </h1>
      </div>

      {/* Upload View */}
      {view === 'initial' && (
        <div className="max-w-2xl mx-auto px-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 
              ${isDragging ? 'border-white/50 bg-white/10' : 'border-white/20 hover:border-white/30'}
              h-72 flex items-center justify-center`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <Upload className="w-12 h-12 mb-4 mx-auto text-white/50" />
              <p className="text-lg text-white/80">Drop your image here</p>
              <p className="text-sm text-white/50 mt-2">or click to select</p>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {view === 'results' && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          {/* Color Display */}
          <div className="flex justify-center gap-4 mb-12">
            <div 
              className="w-24 h-24 rounded-xl shadow-lg" 
              style={{ backgroundColor: selectedColor }} 
            />
            {complementaryColor && (
              <div 
                className="w-24 h-24 rounded-xl shadow-lg" 
                style={{ backgroundColor: complementaryColor }} 
              />
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white/90 font-medium line-clamp-1">{product.title}</h3>
                  <p className="text-white/60 mt-1">${product.price.toFixed(2)}</p>
                  {product.dominantColor && (
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: product.dominantColor }}
                      />
                      <span className="text-xs text-white/50">{product.dominantColor}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <button
            onClick={() => setView('initial')}
            className="fixed bottom-8 left-8 flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernUploader;
