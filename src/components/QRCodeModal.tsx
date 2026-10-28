import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Printer, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const { shopInfo } = useShop();
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Official public URL of the application
  const publicUrl = window.location.origin;

  useEffect(() => {
    if (!isOpen) return;

    // Generate high-resolution QR Code (512x512)
    QRCode.toDataURL(
      publicUrl,
      {
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `baba-sain-pico-catalogue-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div
        className="relative bg-white w-full max-w-lg rounded-sm border border-black shadow-2xl overflow-hidden flex flex-col no-print"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrIcon className="w-5 h-5" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-tight">
              Shop Counter QR Code
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              Scan from any Android or iPhone
            </span>
            <h4 className="text-xl font-extrabold text-black font-heading mt-0.5">
              {shopInfo.shopName}
            </h4>
            <p className="text-xs text-neutral-600 mt-1">
              Customers can scan this QR code with their mobile phone camera to instantly view your full design catalogue without typing any URL.
            </p>
          </div>

          {/* QR Code Graphic */}
          <div className="inline-block p-4 bg-white border-2 border-black rounded-sm shadow-md mx-auto">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Rheman Pico Shop Catalogue QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center">
                <span className="text-sm text-neutral-400">Generating QR...</span>
              </div>
            )}
          </div>

          {/* URL box */}
          <div className="flex items-center gap-2 bg-neutral-100 p-2.5 rounded-sm border border-neutral-300 text-left">
            <div className="flex-1 truncate font-mono text-xs text-neutral-800">
              {publicUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-neutral-300 hover:border-black rounded-xs flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-neutral-800 transition-colors active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 text-black border border-black text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-neutral-200 transition-colors active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Poster</span>
            </button>
          </div>

          {/* Instructions for Shop Display */}
          <div className="text-left bg-neutral-50 p-3.5 border border-neutral-200 rounded-sm text-xs text-neutral-600 space-y-1">
            <strong className="text-black block font-semibold">How to display in your shop:</strong>
            <p>1. Tap <strong>Download PNG</strong> or <strong>Print Poster</strong>.</p>
            <p>2. Print on an A4 sheet or photo card.</p>
            <p>3. Place it on your counter or customer reception desk. Customers can scan to browse prices and tap <strong>Install App</strong> to save Baba Sain Pico on their Android phones!</p>
          </div>
        </div>
      </div>

      {/* Printable Counter Poster (Revealed strictly during window.print) */}
      <div className="print-only fixed inset-0 bg-white p-12 flex flex-col items-center justify-center text-center">
        <div className="border-8 border-black p-10 max-w-lg w-full flex flex-col items-center">
          {shopInfo.logoUrl ? (
            <img
              src={shopInfo.logoUrl}
              alt="Shop Logo"
              className="w-16 h-16 object-cover rounded-xs border-2 border-black mb-2"
            />
          ) : null}
          <div className="text-4xl font-black uppercase tracking-tight text-black font-heading mb-1">
            {shopInfo.shopName}
          </div>
          <div className="text-sm font-bold uppercase tracking-widest text-neutral-600 mb-6">
            Official Product & Stitching Catalogue
          </div>

          {dataUrl && (
            <div className="p-4 bg-white border-4 border-black mb-6">
              <img src={dataUrl} alt="Shop QR Code" className="w-72 h-72" />
            </div>
          )}

          <div className="text-2xl font-extrabold text-black uppercase font-heading">
            Scan with Mobile Phone Camera
          </div>
          <div className="text-sm text-neutral-700 mt-2 max-w-xs font-medium">
            Scan this code to explore all our latest pico designs, fancy dupatta borders, and price rates directly on your phone.
          </div>

          <div className="mt-8 pt-4 border-t-2 border-neutral-300 w-full text-xs text-neutral-500 font-mono">
            {publicUrl}
          </div>
        </div>
      </div>
    </div>
  );
};
