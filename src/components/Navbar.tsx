import React from 'react';
import { QrCode, Shield, User, LogOut, Sparkles, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenQR: () => void;
  onOpenAdmin: () => void;
  isAdminOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQR, onOpenAdmin, isAdminOpen }) => {
  const { user, isAdmin, isOwner, logout } = useAuth();
  const { shopInfo } = useShop();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Shop Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => isAdminOpen && onOpenAdmin()}>
            {shopInfo.logoUrl ? (
              <img
                src={shopInfo.logoUrl}
                alt={shopInfo.shopName}
                className="w-11 h-11 object-cover rounded-sm border border-black shadow-sm bg-white"
              />
            ) : (
              <div className="w-11 h-11 bg-black text-white flex items-center justify-center rounded-sm font-bold tracking-tighter text-lg shadow-sm border border-black">
                <span>BSP</span>
              </div>
            )}
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-black block leading-none font-heading">
                {shopInfo.shopName || 'بابا سائين پيڪو (Baba Sain Pico)'}
              </span>
              <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium block mt-1">
                Thatta • Design Catalogue
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Install Android PWA Button */}
            <PWAInstallButton />

            {/* QR Code button */}
            <button
              onClick={onOpenQR}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-black bg-white border border-black hover:bg-neutral-100 rounded-sm transition-colors active:scale-95"
              title="Shop QR Code for Mobile"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Shop QR Code</span>
            </button>

            {/* Admin / Owner Button */}
            <button
              onClick={onOpenAdmin}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-sm transition-all active:scale-95 ${
                isAdminOpen
                  ? 'bg-black text-white ring-2 ring-black'
                  : isAdmin
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{isAdminOpen ? 'Close Admin' : isAdmin ? 'Admin Portal' : 'Owner Login'}</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-0.5 animate-pulse" />
              )}
            </button>

            {/* Logout shortcut if logged in */}
            {user && (
              <button
                onClick={() => logout()}
                type="button"
                className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
