import React, { useState } from 'react';
import { Eye, Tag, Sparkles, ImageOff } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, isAdmin, onEdit }) => {
  const [imageError, setImageError] = useState(false);

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount).replace('PKR', 'Rs.');
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white border border-neutral-200 hover:border-black transition-all duration-200 rounded-sm overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden flex items-center justify-center">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-neutral-400">
            <ImageOff className="w-10 h-10 mb-2 stroke-1" />
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Baba Sain Pico</span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Featured
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-black text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-xs border border-neutral-300 shadow-sm">
          {product.category}
        </div>

        {/* Status for Admin */}
        {!product.isPublished && (
          <div className="absolute top-2.5 right-2.5 bg-neutral-800 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs">
            Draft
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 className="font-heading font-bold text-base sm:text-lg text-black line-clamp-1 group-hover:underline">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-bold block">
              Estimated Price
            </span>
            <span className="text-base sm:text-lg font-extrabold text-black tracking-tight">
              {formatPKR(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-xs hover:bg-neutral-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
