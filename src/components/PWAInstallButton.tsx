import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, X, ExternalLink, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone app, suppress prompt
  if (isInstalled) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        App Active
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
      }
    } else {
      setShowInfoModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Install Android App"
        className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition-all transform active:scale-95 cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 group-hover:animate-bounce" />
        <span>Install App</span>
        <span className="hidden sm:inline-block px-1.5 py-0.2 bg-emerald-950/20 text-[10px] rounded uppercase tracking-wider font-extrabold">
          Android
        </span>
      </button>

      {/* Info / Guide Modal for Android & other platforms */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-stone-900 border border-emerald-800/50 rounded-2xl p-6 shadow-2xl text-stone-100">
            {/* Close Button */}
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-100">
                  Android App Installation
                </h3>
                <p className="text-xs text-stone-400">
                  بابا سائين پيڪو (Baba Sain Pico) Mobile App
                </p>
              </div>
            </div>

            {installSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm flex items-center gap-3">
                <CheckCircle className="w-6 h-6 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-bold">Mubarak ho! App install ho chuki hai.</p>
                  <p className="text-xs text-emerald-400/80">Aapki home screen par Baba Sain Pico ka icon aa gaya hai.</p>
                </div>
              </div>
            ) : isIOS ? (
              <div className="space-y-3 text-sm text-stone-300">
                <p className="text-stone-300 font-medium">iPhone / iPad par install karne ke liye:</p>
                <div className="p-3 bg-stone-800/80 rounded-xl space-y-2 text-xs border border-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                    <span>Safari browser ke bottom par <strong>Share</strong> button dabayein.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                    <span>Neeche scroll karein aur <strong>"Add to Home Screen"</strong> par tap karein.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-stone-300">
                <p className="text-xs leading-relaxed text-stone-300">
                  Ye app <strong>PWA (Progressive Web App)</strong> standard par bani hai, jo Android mobile phones par bilkul native APK ki tarah install hoti hai:
                </p>

                <div className="p-3.5 bg-stone-800/80 rounded-xl space-y-2.5 text-xs border border-stone-700/80">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-600 text-stone-950 font-bold flex items-center justify-center text-[11px] mt-0.5">1</span>
                    <span>Chrome browser ke top-right <strong>3 Dots (⋮)</strong> menu par tap karein.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-600 text-stone-950 font-bold flex items-center justify-center text-[11px] mt-0.5">2</span>
                    <span><strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par click karein.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-600 text-stone-950 font-bold flex items-center justify-center text-[11px] mt-0.5">3</span>
                    <span>Aapke phone par app icon ban jayega, aur bina browser URL bar ke full-screen chalegi!</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Play Store APK File:
                  </span>
                  Is PWA ko <strong>PWABuilder.com</strong> ya <strong>Capacitor</strong> ke zariye direct Signed APK / Google Play Store bundle (AAB) mein bhi convert kiya ja sakta hai!
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition"
              >
                Theek Hai / Samajh Gaya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
