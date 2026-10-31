import React, { useState, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Tag,
  ArrowUpDown,
  Scissors,
  CheckCircle2,
  Sparkles,
  QrCode,
  Shield,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShopInfoSection } from './components/ShopInfoSection';
import { AdminDashboard } from './components/AdminDashboard';
import { QRCodeModal } from './components/QRCodeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AdsterraBanner } from './components/AdsterraBanner';
import { Product } from './types';

function CatalogueContent() {
  const { products, categories, shopInfo, loading } = useShop();
  const { isAdmin } = useAuth();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const catalogueRef = useRef<HTMLDivElement>(null);

  const scrollToCatalogue = () => {
    catalogueRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter & Sort visible products (customers only see isPublished == true, unless admin)
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Only show published to public, unless admin is looking
        if (!isAdmin && !prod.isPublished) return false;

        const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
        const matchesSearch =
          prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default: featured first, then newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, searchTerm, sortBy, isAdmin]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenQR={() => setIsQROpen(true)}
        onOpenAdmin={() => setIsAdminOpen(!isAdminOpen)}
        isAdminOpen={isAdminOpen}
      />

      {/* Hero Banner */}
      <HeroBanner
        onBrowseClick={scrollToCatalogue}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Main Catalogue Section */}
      <main ref={catalogueRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Section Header */}
        <div className="border-b border-black/10 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">
              <span>Official Design Collection</span>
              <span>•</span>
              <span>PKR Rates</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-heading text-black">
              Product Catalogue
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
              Browse samples of pico styles, fancy dupatta borders, and edging needlework available at our shop.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-neutral-100 border border-neutral-300 rounded-xs text-neutral-800">
              {filteredProducts.length} Designs Displayed
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8">
          {/* Row 1: Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pico, overlock, dupatta border designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black font-medium transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <ArrowUpDown className="w-4 h-4 text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort catalogue designs"
                className="text-xs sm:text-sm font-semibold border border-neutral-300 rounded-xs py-2 px-3 bg-white focus:outline-hidden focus:border-black"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Row 2: Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              All Items ({products.filter((p) => isAdmin || p.isPublished).length})
            </button>

            {categories.map((cat) => {
              const count = products.filter(
                (p) => (isAdmin || p.isPublished) && p.category === cat.name
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] ${selectedCategory === cat.name ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Adsterra Advertisement Banner (Above Catalogue Grid) */}
        <AdsterraBanner className="my-2" label="Sponsored" />

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase font-bold tracking-wider text-neutral-500">
              Loading Baba Sain Pico Catalogue...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-12 text-center space-y-3">
            <Scissors className="w-10 h-10 text-neutral-400 mx-auto stroke-1" />
            <h3 className="font-heading font-bold text-lg text-black uppercase">
              No matching designs found
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              We couldn't find any items matching your selected filter. Try clearing your search term or picking another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
              }}
              className="mt-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800"
            >
              Show All Designs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => setSelectedProduct(prod)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* Adsterra Advertisement Banner (Below Catalogue Grid) */}
        <AdsterraBanner className="mt-12 pt-4 border-t border-neutral-200" label="Sponsored Content" />
      </main>

      {/* Shop Information Section */}
      <ShopInfoSection />

      {/* Website Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-800 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 text-center md:text-left">
            {shopInfo.logoUrl ? (
              <img
                src={shopInfo.logoUrl}
                alt={shopInfo.shopName}
                className="w-9 h-9 object-cover rounded-xs border border-white bg-white"
              />
            ) : (
              <div className="w-9 h-9 bg-white text-black flex items-center justify-center rounded-xs font-black text-sm">
                BSP
              </div>
            )}
            <div>
              <span className="font-black text-lg tracking-tight font-heading block">
                {shopInfo.shopName}
              </span>
              <span className="text-[11px] text-neutral-400 tracking-wider uppercase">
                Product & Stitching Design Catalogue • Thatta, Sindh
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <button
              onClick={() => setIsQROpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Shop QR Code</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Owner Admin Portal</span>
            </button>
          </div>

          <div className="text-center md:text-right text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} {shopInfo.shopName}. All rights reserved.</p>
            <p className="mt-0.5 text-[11px] text-neutral-600">Product Catalogue Display Only</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAdmin={isAdmin}
        onEdit={(prod) => {
          setSelectedProduct(null);
          setIsAdminOpen(true);
        }}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />

      {/* Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Network Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <CatalogueContent />
      </ShopProvider>
    </AuthProvider>
  );
}
