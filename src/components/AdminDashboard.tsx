import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Download,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Camera,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Product, Category } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface AdminDashboardProps {
  onClose: () => void;
}

type AdminTab = 'products' | 'add' | 'categories' | 'shop' | 'backup' | 'seo';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { user, isAdmin, isOwner, loginWithGoogle, logout, authError, clearAuthError } = useAuth();
  const {
    products,
    categories,
    shopInfo,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateShopInfo,
    seedStarterCatalogue,
    exportCatalogueJSON,
    importCatalogueJSON,
  } = useShop();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Add / Edit Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Category Edit State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Shop Info Form State
  const [infoShopName, setInfoShopName] = useState(shopInfo.shopName);
  const [infoPhone, setInfoPhone] = useState(shopInfo.phone || '');
  const [infoWhatsApp, setInfoWhatsApp] = useState(shopInfo.whatsappNumber || '');
  const [infoLogoUrl, setInfoLogoUrl] = useState(shopInfo.logoUrl || '');
  const [infoAddress, setInfoAddress] = useState(shopInfo.address || '');
  const [infoCity, setInfoCity] = useState(shopInfo.city || '');
  const [infoHours, setInfoHours] = useState(shopInfo.businessHours || '');
  const [infoAbout, setInfoAbout] = useState(shopInfo.aboutText || '');
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);

  // File input refs for Android gallery vs camera
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Automatically sync form state whenever shopInfo updates from Firestore
  React.useEffect(() => {
    if (shopInfo) {
      setInfoShopName(shopInfo.shopName || 'بابا سائين پيڪو (Baba Sain Pico)');
      setInfoPhone(shopInfo.phone || '0316-3969727 (Manzoor Jakhro)');
      setInfoWhatsApp(shopInfo.whatsappNumber || '+92 304 3893489');
      setInfoLogoUrl(shopInfo.logoUrl || '/assets/aistudio/IMG-20261025-WA0009_ad5230d0.jpg');
      setInfoAddress(shopInfo.address || 'Main Chandni Chowk, nazdeek Marwari Waddi Bakery');
      setInfoCity(shopInfo.city || 'Thatta, Sindh');
      setInfoHours(shopInfo.businessHours || 'Monday - Saturday: 10:00 AM - 9:00 PM');
      setInfoAbout(
        shopInfo.aboutText ||
          'Welcome to Baba Sain Pico official. Yahan par aapko hamare tamam designs aur unki prices dekhne ko milengi. Yahan se koi order ya koi payment nahi ki ja sakti. Apne dupatte banwane ke liye hamari shop Baba Sain per visit karein.'
      );
    }
  }, [shopInfo]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Photo selection from Android camera or phone gallery
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // Compresses to mobile-optimized webp/jpeg (<150KB)
      const compressedDataUri = await compressImage(file, 800, 800, 0.82);
      setFormImageUrl(compressedDataUri);
      showToast('success', 'Photo optimized and loaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not process selected image. Please try another photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle Logo selection from Phone gallery
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingLogo(true);
      const compressed = await compressImage(file, 400, 400, 0.88);
      setInfoLogoUrl(compressed);
      showToast('success', 'Shop logo selected and optimized!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not process logo image.');
    } finally {
      setIsCompressingLogo(false);
    }
  };

  // Reset Product Form
  const resetForm = () => {
    setEditingProductId(null);
    setFormName('');
    setFormPrice('');
    setFormCategory(categories[0]?.name || 'Classic Pico');
    setFormDescription('');
    setFormImageUrl('');
    setFormIsPublished(true);
    setFormFeatured(false);
  };

  // Start Editing a Product
  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormPrice(prod.price);
    setFormCategory(prod.category);
    setFormDescription(prod.description || '');
    setFormImageUrl(prod.imageUrl || '');
    setFormIsPublished(prod.isPublished);
    setFormFeatured(Boolean(prod.featured));
    setActiveTab('add');
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('error', 'Please enter a product name.');
      return;
    }
    if (formPrice === '' || Number(formPrice) < 0) {
      showToast('error', 'Please enter a valid price in PKR.');
      return;
    }
    const cat = formCategory.trim() || categories[0]?.name || 'General';

    setIsSubmitting(true);
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name: formName.trim(),
          price: Number(formPrice),
          category: cat,
          description: formDescription.trim(),
          imageUrl: formImageUrl,
          isPublished: formIsPublished,
          featured: formFeatured,
        });
        showToast('success', 'Product updated successfully!');
      } else {
        await addProduct({
          name: formName.trim(),
          price: Number(formPrice),
          category: cat,
          description: formDescription.trim(),
          imageUrl: formImageUrl,
          isPublished: formIsPublished,
          featured: formFeatured,
        });
        showToast('success', 'New product added to catalogue!');
      }
      resetForm();
      setActiveTab('products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Delete Product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      showToast('success', `Product "${productToDelete.name}" deleted.`);
      setProductToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product.';
      showToast('error', msg);
    }
  };

  // Save Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      showToast('success', 'Category added!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error adding category');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      await updateCategory(id, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName('');
      showToast('success', 'Category renamed!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error updating category');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      showToast('success', `Category "${categoryToDelete.name}" removed.`);
      setCategoryToDelete(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error deleting category');
    }
  };

  // Save Shop Info
  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      await updateShopInfo({
        shopName: infoShopName.trim() || 'بابا سائين پيڪو (Baba Sain Pico)',
        phone: infoPhone.trim(),
        whatsappNumber: infoWhatsApp.trim(),
        logoUrl: infoLogoUrl.trim(),
        address: infoAddress.trim(),
        city: infoCity.trim(),
        businessHours: infoHours.trim(),
        aboutText: infoAbout.trim(),
      });
      showToast('success', 'Shop, Logo and WhatsApp support information updated!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save shop info');
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Seed Initial Catalogue
  const handleSeedCatalogue = async () => {
    if (!window.confirm('Populate the initial sample catalogue for Baba Sain Pico?')) return;
    try {
      await seedStarterCatalogue();
      showToast('success', 'Initial products and categories seeded to database!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to seed catalogue');
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = exportCatalogueJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baba-sain-pico-catalogue-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Backup downloaded to your phone storage!');
  };

  // Import JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importCatalogueJSON(text);
        showToast('success', `Restored ${res.productsCount} products and ${res.categoriesCount} categories!`);
      } catch (err) {
        showToast('error', 'Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.isPublished).length;
  const draftProducts = totalProducts - publishedProducts;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex flex-col no-print overflow-hidden">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-60 px-4 py-3 rounded-sm shadow-xl border text-sm font-semibold flex items-center gap-2 animate-bounce-short ${
            toastMessage.type === 'success'
              ? 'bg-black text-white border-neutral-700'
              : 'bg-red-950 text-white border-red-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <div className="bg-black text-white border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          {shopInfo.logoUrl ? (
            <img
              src={shopInfo.logoUrl}
              alt="Logo"
              className="w-8 h-8 rounded-xs object-cover border border-white bg-white"
            />
          ) : (
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black text-xs rounded-xs">
              PJ
            </div>
          )}
          <div>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight font-heading leading-tight">
              Owner Admin Dashboard
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="font-semibold text-white">{shopInfo.shopName || 'بابا سائين پيڪو (Baba Sain Pico)'}</span>
              <span>•</span>
              {isAdmin ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified Owner
                </span>
              ) : (
                <span className="text-amber-400">Authentication Required</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => logout()}
              type="button"
              className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xs flex items-center gap-1 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xs transition-colors"
            aria-label="Close Admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-100 flex flex-col">
        {/* If user is NOT authenticated as the owner, display Google Login Gate */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto my-auto p-6 sm:p-8 bg-white border border-neutral-300 rounded-sm shadow-xl text-center space-y-6">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-heading text-black uppercase">
                Owner Access Only
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Welcome to <strong>Baba Sain Pico (بابا سائين پيڪو)</strong> Admin. To add products, change prices, or edit catalogue items from your phone, please sign in with your authorized Google Account:
              </p>
              <div className="mt-3 p-2.5 bg-neutral-100 rounded-xs font-mono text-xs text-black border border-neutral-300 font-semibold">
                {OWNER_EMAIL}
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xs text-left">
                <strong>Access Note:</strong> {authError}
              </div>
            )}

            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-3 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition-transform active:scale-95 flex items-center justify-center gap-3 shadow-md"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 text-left space-y-1">
              <strong className="text-black block">Security Guarantee:</strong>
              <p>• Only your authorized Google email can modify prices and delete items.</p>
              <p>• Unauthorized visitors or customers have read-only access to browse.</p>
            </div>
          </div>
        ) : (
          /* Authenticated Owner Admin Workspace */
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Horizontal Tabs (Mobile-friendly touch pills) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-300">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('products');
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                <span>All Products ({totalProducts})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeTab !== 'add') resetForm();
                  setActiveTab('add');
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{editingProductId ? 'Edit Product' : 'Add New Product'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'categories'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Categories ({categories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'shop'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Shop Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'backup'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Backup & Data</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'seo'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Google Search Guide</span>
              </button>
            </div>

            {/* TAB 1: ALL PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Search & Filter Header */}
                <div className="bg-white p-4 border border-neutral-300 rounded-sm shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black"
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

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      aria-label="Filter products by category"
                      className="text-xs sm:text-sm font-medium border border-neutral-300 rounded-xs py-2 px-3 bg-white focus:outline-hidden focus:border-black"
                    >
                      <option value="ALL">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('add');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white text-xs sm:text-sm font-bold uppercase rounded-xs hover:bg-neutral-800 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Status summary pill */}
                <div className="flex items-center gap-4 text-xs text-neutral-600 px-1">
                  <span>
                    Showing <strong>{filteredProducts.length}</strong> of <strong>{totalProducts}</strong> products
                  </span>
                  <span>•</span>
                  <span>Published: <strong className="text-emerald-700">{publishedProducts}</strong></span>
                  <span>•</span>
                  <span>Drafts: <strong className="text-neutral-700">{draftProducts}</strong></span>
                </div>

                {/* Product Grid / Table */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white p-12 text-center border border-neutral-300 rounded-sm">
                    <p className="text-neutral-500 text-sm">No products matched your search or category filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('ALL');
                      }}
                      className="mt-3 text-xs font-semibold underline text-black"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white border border-neutral-300 rounded-sm p-4 flex flex-col justify-between shadow-xs hover:border-black transition-colors"
                      >
                        <div className="flex gap-3">
                          {/* Image preview */}
                          <div className="w-20 h-20 bg-neutral-100 rounded-xs border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-neutral-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-heading font-bold text-sm text-black truncate">
                                {prod.name}
                              </h4>
                              {prod.featured && (
                                <span className="bg-black text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-2xs shrink-0">
                                  Featured
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-neutral-500 mt-0.5 truncate">
                              {prod.category}
                            </div>

                            <div className="text-base font-extrabold text-black font-heading mt-1">
                              Rs. {prod.price.toLocaleString()}
                            </div>

                            <div className="mt-1 flex items-center gap-1">
                              <span
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-2xs ${
                                  prod.isPublished
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-200 text-neutral-700'
                                }`}
                              >
                                {prod.isPublished ? 'Published' : 'Hidden / Draft'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                          {/* Toggle visibility */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateProduct(prod.id, { isPublished: !prod.isPublished });
                                showToast(
                                  'success',
                                  prod.isPublished ? 'Product hidden from public.' : 'Product published!'
                                );
                              } catch (err: unknown) {
                                showToast('error', err instanceof Error ? err.message : 'Error');
                              }
                            }}
                            className="text-xs text-neutral-600 hover:text-black flex items-center gap-1 py-1 px-2 border border-neutral-300 rounded-xs"
                            title={prod.isPublished ? 'Hide from catalogue' : 'Publish to catalogue'}
                          >
                            {prod.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{prod.isPublished ? 'Hide' : 'Publish'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => startEditProduct(prod)}
                              className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-xs hover:bg-neutral-800 flex items-center gap-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setProductToDelete(prod)}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xs transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADD / EDIT PRODUCT FORM */}
            {activeTab === 'add' && (
              <div className="bg-white border border-neutral-300 rounded-sm p-6 sm:p-8 max-w-2xl mx-auto shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-black uppercase">
                      {editingProductId ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Enter details and upload photos directly from your phone gallery or camera.
                    </p>
                  </div>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-neutral-500 hover:text-black underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6">
                  {/* Photo Upload Section */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                      Product Photo (Camera or Phone Gallery)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Image preview box */}
                      <div className="relative w-36 h-36 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        {formImageUrl ? (
                          <>
                            <img
                              src={formImageUrl}
                              alt="Selected preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormImageUrl('')}
                              className="absolute top-1 right-1 p-1 bg-black text-white rounded-full hover:bg-neutral-800"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-3 text-neutral-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                            <span className="text-[10px] uppercase font-bold block">No photo</span>
                          </div>
                        )}
                        {isCompressing && (
                          <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center text-xs">
                            <RefreshCw className="w-5 h-5 animate-spin mb-1" />
                            <span>Optimizing...</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Controls - Both Gallery & Camera explicitly supported */}
                      <div className="flex-1 space-y-2.5 w-full">
                        {/* Hidden Inputs */}
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />

                        {/* Dual action buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="py-2.5 px-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Gallery Se Upload</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="py-2.5 px-3 bg-white text-black border border-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Camera Se Photo</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-neutral-500">
                          Aap apne mobile ki <strong>Gallery</strong> se koi bhi purani photo select kar sakte hain ya <strong>Camera</strong> se live nayi photo bana sakte hain.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fine Silk Dupatta Pico"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black font-medium"
                    />
                  </div>

                  {/* Price in PKR & Category in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Price in PKR (Pakistani Rupees) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                          Rs.
                        </span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1"
                          placeholder="e.g. 250"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                        Category *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Description & Work Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter fabric compatibility, thread types, finish specifications..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      maxLength={1500}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black leading-relaxed"
                    />
                  </div>

                  {/* Toggles: Featured and Published */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 accent-black rounded-xs cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-black uppercase">
                          Featured on Home Page
                        </span>
                        <span className="text-[11px] text-neutral-500 block">
                          Displays this item at the top of the catalogue with a special highlight.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-neutral-200">
                      <input
                        type="checkbox"
                        checked={formIsPublished}
                        onChange={(e) => setFormIsPublished(e.target.checked)}
                        className="w-4 h-4 accent-black rounded-xs cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-black uppercase">
                          Publish in Public Catalogue
                        </span>
                        <span className="text-[11px] text-neutral-500 block">
                          When checked, customers visiting the website will see this product immediately.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || isCompressing}
                      className="flex-1 py-3 px-6 bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving to Catalogue...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{editingProductId ? 'Save Changes' : 'Publish Product'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveTab('products');
                      }}
                      className="py-3 px-4 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: CATEGORIES MANAGER */}
            {activeTab === 'categories' && (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Add Category Card */}
                <div className="bg-white border border-neutral-300 rounded-sm p-6 shadow-xs">
                  <h3 className="font-heading font-extrabold text-lg text-black uppercase mb-1">
                    Add New Category
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4">
                    Create categories to organize your pico, stitching, and dupatta edge works.
                  </p>

                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Lace Border Work"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      maxLength={50}
                      className="flex-1 px-3.5 py-2 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black font-medium"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 shrink-0"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Categories List */}
                <div className="bg-white border border-neutral-300 rounded-sm p-6 shadow-xs">
                  <h3 className="font-heading font-extrabold text-lg text-black uppercase mb-3">
                    Existing Categories ({categories.length})
                  </h3>

                  <div className="divide-y divide-neutral-200">
                    {categories.map((cat) => (
                      <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
                        {editingCategoryId === cat.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm border border-black rounded-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryId(null)}
                              className="px-2 py-1.5 text-xs text-neutral-500 hover:text-black"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-black">{cat.name}</span>
                              <span className="text-xs text-neutral-600 font-medium">
                                ({products.filter((p) => p.category === cat.name).length} items)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setEditingCategoryName(cat.name);
                                }}
                                className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xs"
                                title="Rename Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setCategoryToDelete(cat)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SHOP & CONTACT INFORMATION */}
            {activeTab === 'shop' && (
              <div className="bg-white border border-neutral-300 rounded-sm p-6 sm:p-8 max-w-2xl mx-auto shadow-xs">
                <div className="border-b border-neutral-200 pb-4 mb-6">
                  <h3 className="font-heading font-extrabold text-xl text-black uppercase">
                    Shop & Contact Information
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Update your official shop address, contact telephone, and business hours displayed to customers.
                  </p>
                </div>

                <form onSubmit={handleSaveShopInfo} className="space-y-5">
                  {/* Shop Logo Upload Section */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                      Shop Logo (Dukaan Ka Official Logo)
                    </label>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white border border-neutral-300 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        {infoLogoUrl ? (
                          <img
                            src={infoLogoUrl}
                            alt="Shop Logo Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black text-white flex items-center justify-center font-black text-base">
                            BSP
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="py-2 px-3 bg-black text-white text-xs font-bold uppercase rounded-xs hover:bg-neutral-800 flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Gallery Se Logo Upload Karein</span>
                          </button>
                          {infoLogoUrl && (
                            <button
                              type="button"
                              onClick={() => setInfoLogoUrl('')}
                              className="py-2 px-2.5 bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xs hover:bg-neutral-300"
                            >
                              Reset Logo
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Apni shop ka logo apne mobile se upload karein — yeh header, footer aur poster par dikhai dega.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={infoShopName}
                      onChange={(e) => setInfoShopName(e.target.value)}
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Support WhatsApp Number (Dukaan ka WhatsApp Rabta Number)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 03001234567 ya +923001234567"
                      value={infoWhatsApp}
                      onChange={(e) => setInfoWhatsApp(e.target.value)}
                      maxLength={50}
                      className="w-full px-3.5 py-2.5 text-sm border-2 border-emerald-600 rounded-xs focus:outline-hidden font-medium"
                    />
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      Yeh number public website ke support section me dikhai dega aur customer ek click se WhatsApp par rabta kar sakenge.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Phone / Mobile Number (Optional Call Number)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +92 300 1234567"
                      value={infoPhone}
                      onChange={(e) => setInfoPhone(e.target.value)}
                      maxLength={50}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                        Shop Address / Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shop #12, Ground Floor, Main Market"
                        value={infoAddress}
                        onChange={(e) => setInfoAddress(e.target.value)}
                        maxLength={200}
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lahore, Karachi, Rawalpindi..."
                        value={infoCity}
                        onChange={(e) => setInfoCity(e.target.value)}
                        maxLength={50}
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mon-Sat: 10:00 AM - 9:00 PM (Friday break: 1-3 PM)"
                      value={infoHours}
                      onChange={(e) => setInfoHours(e.target.value)}
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      About Shop / Introduction Text
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Introduce your stitching, pico, and dupatta work..."
                      value={infoAbout}
                      onChange={(e) => setInfoAbout(e.target.value)}
                      maxLength={2000}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xs focus:outline-hidden focus:border-black leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingInfo}
                    className="w-full py-3 px-6 bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSavingInfo ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Shop Information</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: BACKUP & DATA RECOVERY */}
            {activeTab === 'backup' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white border border-neutral-300 rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-neutral-200 pb-4">
                    <h3 className="font-heading font-extrabold text-xl text-black uppercase">
                      Data Backup & Offline Protection
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Download a full backup of all your products, categories, and prices to your Android phone with one click.
                    </p>
                  </div>

                  {/* Export Backup Card */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-black">
                          Export Catalogue Backup (JSON)
                        </h4>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Saves all current products ({totalProducts} items) and categories into a secure backup file on your phone.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="w-full py-2.5 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Catalogue Backup</span>
                    </button>
                  </div>

                  {/* Restore Backup Card */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-black">
                          Restore from Backup File
                        </h4>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Restore your products and categories from a previously downloaded JSON backup file.
                        </p>
                      </div>
                    </div>

                    <input
                      ref={backupInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => backupInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-white text-black border border-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Select Backup File to Restore</span>
                    </button>
                  </div>

                  {/* Seed Starter Catalogue */}
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-xs text-black uppercase">
                          Populate Sample Pico Designs
                        </h5>
                        <p className="text-[11px] text-neutral-500">
                          Add the 6 pre-crafted pico & stitching designs directly into your live Firestore database.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSeedCatalogue}
                        className="py-2 px-3 bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-bold uppercase rounded-xs shrink-0"
                      >
                        Populate Samples
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: GOOGLE SEARCH & SEO GUIDE */}
            {activeTab === 'seo' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white border border-neutral-300 rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-neutral-200 pb-4">
                    <h3 className="font-heading font-extrabold text-xl text-black uppercase">
                      Google Search & Indexing Guide
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Apni shop ki website ko Google Search par laane ke asan steps (Roman Urdu).
                    </p>
                  </div>

                  {/* Step by Step Roman Urdu instructions */}
                  <div className="space-y-4 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2">
                      <strong className="text-black font-bold block text-sm">
                        Step 1: Website ka Link aur Sitemap
                      </strong>
                      <p>
                        Aapki website ka link live hai. Google ke robots ke liye sitemap aur robots.txt file pehle se configured hai:
                      </p>
                      <div className="bg-neutral-900 text-white p-2.5 rounded-xs font-mono text-xs overflow-x-auto">
                        {window.location.origin}/sitemap.xml
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2">
                      <strong className="text-black font-bold block text-sm">
                        Step 2: Google Search Console me Website Add Karein
                      </strong>
                      <p>
                        1. Apne mobile browser me <strong>Google Search Console</strong> open karein (search.google.com/search-console).
                      </p>
                      <p>
                        2. Apne Google account (<strong>{OWNER_EMAIL}</strong>) se sign in karein.
                      </p>
                      <p>
                        3. <strong>URL Prefix</strong> option me apni website ka mukammal URL paste karein:
                      </p>
                      <div className="bg-neutral-900 text-white p-2 rounded-xs font-mono text-xs">
                        {window.location.origin}
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2">
                      <strong className="text-black font-bold block text-sm">
                        Step 3: Sitemap Submit Karein
                      </strong>
                      <p>
                        Google Search Console ke left menu me <strong>"Sitemaps"</strong> par click karein aur box me <code>sitemap.xml</code> likh kar submit kar dein.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-sm text-amber-950 space-y-1">
                      <strong className="block font-bold">Important Note on Google Indexing:</strong>
                      <p>
                        Google search par kisi bhi nayi website ka aana foran nahi hota. Google ke crawlers aam tor par <strong>3 se 14 din</strong> tak ka waqt lete hain. Ye bilkul normal hai.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6 rounded-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-heading font-black text-lg text-black uppercase">
                Confirm Deletion
              </h4>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? This will permanently remove it from the public catalogue.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold uppercase rounded-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-xs shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6 rounded-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-heading font-black text-lg text-black uppercase">
                Delete Category
              </h4>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">
              Are you sure you want to remove category <strong>"{categoryToDelete.name}"</strong>?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold uppercase rounded-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-xs shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
