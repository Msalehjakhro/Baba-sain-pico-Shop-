import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Category, ShopInfo } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SHOP_INFO } from '../utils/initialData';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  shopInfo: ShopInfo;
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateShopInfo: (info: Partial<ShopInfo>) => Promise<void>;
  seedStarterCatalogue: () => Promise<void>;
  exportCatalogueJSON: () => string;
  importCatalogueJSON: (jsonData: string) => Promise<{ productsCount: number; categoriesCount: number }>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo>(INITIAL_SHOP_INFO);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSeededCheckDone, setIsSeededCheckDone] = useState<boolean>(false);

  // 1. Subscribe to Categories
  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cats.push({
            id: docSnap.id,
            name: data.name || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        setCategories(cats);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'categories');
      }
    );

    return () => unsubCategories();
  }, []);

  // 2. Subscribe to Products
  useEffect(() => {
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          prods.push({
            id: docSnap.id,
            name: data.name || '',
            price: Number(data.price) || 0,
            category: data.category || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            isPublished: data.isPublished !== false,
            featured: Boolean(data.featured),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
        // Sort with featured first, then newest
        prods.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setProducts(prods);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'products');
        setLoading(false);
      }
    );

    return () => unsubProducts();
  }, []);

  // 3. Subscribe to Shop Info
  useEffect(() => {
    const unsubInfo = onSnapshot(
      doc(db, 'shop_info', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShopInfo({
            shopName: data.shopName || INITIAL_SHOP_INFO.shopName,
            aboutText: data.aboutText ?? INITIAL_SHOP_INFO.aboutText,
            phone: data.phone ?? INITIAL_SHOP_INFO.phone,
            whatsappNumber: data.whatsappNumber ?? INITIAL_SHOP_INFO.whatsappNumber,
            logoUrl: data.logoUrl ?? INITIAL_SHOP_INFO.logoUrl,
            address: data.address ?? INITIAL_SHOP_INFO.address,
            city: data.city ?? INITIAL_SHOP_INFO.city,
            businessHours: data.businessHours ?? INITIAL_SHOP_INFO.businessHours,
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      },
      (error) => {
        console.warn('Shop info snapshot note: ', error);
      }
    );

    return () => unsubInfo();
  }, []);

  // If database is completely empty on first launch, auto-load starter samples locally or initialize
  const displayedCategories = categories.length > 0 ? categories : INITIAL_CATEGORIES;
  const displayedProducts = products.length > 0 ? products : INITIAL_PRODUCTS;

  // Add Product
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newId = 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const productPayload = {
      id: newId,
      name: prodData.name.trim(),
      price: Number(prodData.price),
      category: prodData.category.trim(),
      description: prodData.description?.trim() || '',
      imageUrl: prodData.imageUrl || '',
      isPublished: Boolean(prodData.isPublished),
      featured: Boolean(prodData.featured),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'products', newId), productPayload);
      return newId;
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newId}`);
    }
  };

  // Update Product
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const now = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      ...updates,
      updatedAt: now,
    };
    if (cleanUpdates.price !== undefined) {
      cleanUpdates.price = Number(cleanUpdates.price);
    }

    try {
      await updateDoc(doc(db, 'products', id), cleanUpdates);
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  // Delete Product
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  // Add Category
  const addCategory = async (name: string): Promise<void> => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const catId = 'cat-' + Date.now().toString(36);
    const now = new Date().toISOString();
    try {
      await setDoc(doc(db, 'categories', catId), {
        id: catId,
        name: cleanName,
        createdAt: now,
      });
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${catId}`);
    }
  };

  // Update Category
  const updateCategory = async (id: string, name: string): Promise<void> => {
    const cleanName = name.trim();
    if (!cleanName) return;
    try {
      await updateDoc(doc(db, 'categories', id), { name: cleanName });
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  };

  // Delete Category
  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  // Update Shop Info
  const updateShopInfo = async (info: Partial<ShopInfo>): Promise<void> => {
    const now = new Date().toISOString();
    const payload = {
      ...shopInfo,
      ...info,
      shopName: info.shopName || shopInfo.shopName || 'Rheman Pico Shop',
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'shop_info', 'main'), payload);
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.WRITE, 'shop_info/main');
    }
  };

  // Seed Starter Catalogue into live database for the owner
  const seedStarterCatalogue = async (): Promise<void> => {
    try {
      // 1. Seed categories
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      // 2. Seed products
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      // 3. Seed shop info
      await setDoc(doc(db, 'shop_info', 'main'), INITIAL_SHOP_INFO);
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    }
  };

  // Export Catalogue to JSON (Data Backup)
  const exportCatalogueJSON = (): string => {
    const data = {
      shopName: shopInfo.shopName,
      exportDate: new Date().toISOString(),
      categories: displayedCategories,
      products: displayedProducts,
      shopInfo,
    };
    return JSON.stringify(data, null, 2);
  };

  // Import Catalogue from JSON Backup
  const importCatalogueJSON = async (
    jsonData: string
  ): Promise<{ productsCount: number; categoriesCount: number }> => {
    const parsed = JSON.parse(jsonData);
    let pCount = 0;
    let cCount = 0;

    if (Array.isArray(parsed.categories)) {
      for (const cat of parsed.categories) {
        if (cat.name) {
          const cid = cat.id || 'cat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          await setDoc(doc(db, 'categories', cid), {
            id: cid,
            name: cat.name,
            createdAt: cat.createdAt || new Date().toISOString(),
          });
          cCount++;
        }
      }
    }

    if (Array.isArray(parsed.products)) {
      for (const prod of parsed.products) {
        if (prod.name && prod.price !== undefined) {
          const pid = prod.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          await setDoc(doc(db, 'products', pid), {
            id: pid,
            name: String(prod.name).substring(0, 100),
            price: Number(prod.price) || 0,
            category: String(prod.category || 'General').substring(0, 50),
            description: String(prod.description || '').substring(0, 1500),
            imageUrl: String(prod.imageUrl || ''),
            isPublished: prod.isPublished !== false,
            featured: Boolean(prod.featured),
            createdAt: prod.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          pCount++;
        }
      }
    }

    return { productsCount: pCount, categoriesCount: cCount };
  };

  return (
    <ShopContext.Provider
      value={{
        products: displayedProducts,
        categories: displayedCategories,
        shopInfo,
        loading,
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
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
