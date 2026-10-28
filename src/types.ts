export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  isPublished: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface ShopInfo {
  shopName: string;
  aboutText?: string;
  phone?: string;
  whatsappNumber?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  businessHours?: string;
  updatedAt: string;
}
