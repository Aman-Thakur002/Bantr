import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import useUIStore from '../../stores/useUIStore';
import Button from '../ui/Button';
import GlassCard from '../ui/GlassCard';

const MediaPreview = () => {
  const { mediaPreview, setMediaPreview } = useUIStore();
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  const handleClose = () => {
    setMediaPreview(false);
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (mediaPreview.src) {
      window.open(mediaPreview.src, '_blank');
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <AnimatePresence>
      {mediaPreview.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Preview Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md">
              <div className="text-white">
                <h3 className="text-lg font-semibold">
                  {mediaPreview.title}
                </h3>
              </div>
              
              <div className="flex items-center space-x-2">
                {mediaPreview.type === 'image' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-white hover:bg-white/20">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-white hover:bg-white/20">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRotate} className="text-white hover:bg-white/20">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/20">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {mediaPreview.type === 'image' && (
                <motion.img
                  src={mediaPreview.src}
                  alt={mediaPreview.title}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                />
              )}

              {mediaPreview.type === 'video' && (
                <video
                  src={mediaPreview.src}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              )}

              {mediaPreview.type === 'document' && (
                <div className="w-full h-full">
                  <iframe
                    src={`${mediaPreview.src}#toolbar=0`}
                    className="w-full h-full border-0 rounded-lg"
                    title={mediaPreview.title}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MediaPreview;