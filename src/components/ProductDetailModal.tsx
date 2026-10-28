import React, { useState } from 'react';
import { X, Sparkles, Tag, Check, ImageOff, ZoomIn, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  isAdmin?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  isAdmin,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount).replace('PKR', 'Rs.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-black shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-600 block">
              Catalogue Item Details
            </span>
            <h2 className="text-xl font-extrabold text-black font-heading mt-0.5">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Photo */}
          <div className="relative aspect-video sm:aspect-square w-full bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden flex items-center justify-center">
            {product.imageUrl && !imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain cursor-zoom-in transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : ''
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-neutral-400">
                <ImageOff className="w-12 h-12 mb-2 stroke-1" />
                <span className="text-xs uppercase font-medium">No Photo Available</span>
              </div>
            )}

            {product.imageUrl && !imageError && (
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded-xs flex items-center gap-1 backdrop-blur-xs"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isZoomed ? 'Reset Zoom' : 'Zoom Photo'}</span>
              </button>
            )}

            {product.featured && (
              <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Featured Pick
              </div>
            )}
          </div>

          {/* Pricing & Category summary */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">
                Work / Stitching Price
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-black font-heading mt-0.5">
                {formatPKR(product.price)}
                <span className="text-xs font-normal text-neutral-600 ml-1.5">(PKR)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-xs">
                <Tag className="w-3 h-3" />
                {product.category}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded-xs">
                Ref ID: #{product.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Work Specifications & Description
            </h4>
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed whitespace-pre-line bg-white p-4 border border-neutral-200 rounded-sm">
              {product.description || 'Quality stitching and pico pattern crafted at Baba Sain Pico Shop.'}
            </p>
          </div>

          {/* Informational banner about shop catalogue */}
          <div className="p-4 bg-neutral-100 border-l-4 border-black text-neutral-800 text-xs sm:text-sm flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-black" />
            <div>
              <strong className="font-bold text-black block mb-0.5">
                In-Shop Service & Display Catalogue
              </strong>
              This website serves as our live digital design catalogue. To get this pico work, overlock, or custom border crafted for your garments, please bring your fabric or dupatta directly to Baba Sain Pico, Main Chandni Chowk Thatta.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-neutral-600">
            Baba Sain Pico Catalogue • Thatta
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xs hover:bg-black transition-colors"
              >
                Edit Product
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
