import React from 'react';
import { Scissors, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface HeroBannerProps {
  onBrowseClick: () => void;
  onOpenQR: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onBrowseClick, onOpenQR }) => {
  const { products, categories, shopInfo } = useShop();

  return (
    <section className="relative bg-black text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-black">
      {/* Subtle modern geometric background texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Monogram tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/80 text-[11px] font-bold uppercase tracking-widest text-neutral-300 mb-6 backdrop-blur-xs">
          <Scissors className="w-3.5 h-3.5 text-white" />
          <span>Professional Stitching & Pico Works</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading text-white max-w-4xl leading-[1.15]">
          {shopInfo.shopName || 'بابا سائين پيڪو (Baba Sain Pico)'}
        </h1>

        {/* Subtitle / Bio */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-neutral-300 max-w-2xl font-normal leading-relaxed">
          {shopInfo.aboutText ||
            'Welcome to Baba Sain Pico official. Yahan par aapko hamare tamam designs aur unki prices dekhne ko milengi. Yahan se koi order ya koi payment nahi ki ja sakti. Apne dupatte banwane ke liye hamari shop Baba Sain per visit karein.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onBrowseClick}
            className="px-6 py-3.5 bg-white text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-lg"
          >
            Browse Catalogue ({products.filter(p => p.isPublished).length} Designs)
          </button>
          <button
            type="button"
            onClick={onOpenQR}
            className="px-6 py-3.5 bg-neutral-900 text-white border border-neutral-700 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-all active:scale-95"
          >
            Get Shop QR Code
          </button>
        </div>

        {/* Quick Highlights / Trust metrics */}
        <div className="mt-14 pt-10 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 w-full max-w-4xl text-left">
          <div className="border-l-2 border-neutral-700 pl-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
              {products.filter(p => p.isPublished).length}+
            </span>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-0.5 block">
              Pico Designs
            </span>
          </div>

          <div className="border-l-2 border-neutral-700 pl-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
              {categories.length}
            </span>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-0.5 block">
              Work Categories
            </span>
          </div>

          <div className="border-l-2 border-neutral-700 pl-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
              PKR (Rs.)
            </span>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-0.5 block">
              Clear Pricing
            </span>
          </div>

          <div className="border-l-2 border-neutral-700 pl-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white block">
              100%
            </span>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-0.5 block">
              Neat Work Guarantee
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
