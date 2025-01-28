import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default function ColorMatcher() {
  const [selectedColor, setSelectedColor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simplified upload handler for prototype
  const handleFileUpload = (e) => {
    setIsProcessing(true);
    setTimeout(() => {
      setSelectedColor("#8A9A8B");
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Paint Chip Color Matcher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {/* Upload Zone */}
            <div className="w-full">
              <label 
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300 hover:border-gray-400"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Upload a paint chip photo</span>
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Color Display */}
            {selectedColor && (
              <div className="text-center">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-lg shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Detected Color
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedColor}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
