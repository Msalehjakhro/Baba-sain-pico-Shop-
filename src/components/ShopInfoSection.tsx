import React from 'react';
import { MapPin, Phone, Clock, Scissors, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ShopInfoSection: React.FC = () => {
  const { shopInfo } = useShop();

  return (
    <section className="border-t border-black/10 bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 no-print">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Quality Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-neutral-200 rounded-sm shadow-xs flex items-start gap-4">
            <div className="p-3 bg-black text-white rounded-xs shrink-0">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-black uppercase tracking-tight">
                Master Craftsmanship
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                Precision pico borders, delicate dupatta edges, and heavy commercial overlock stitching tailored to every fabric type.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200 rounded-sm shadow-xs flex items-start gap-4">
            <div className="p-3 bg-black text-white rounded-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-black uppercase tracking-tight">
                Thread Durability
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                We use premium imported polyester, silk, and metallic tilla threads that won't fade or snap during washing.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200 rounded-sm shadow-xs flex items-start gap-4">
            <div className="p-3 bg-black text-white rounded-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-black uppercase tracking-tight">
                Fair & Transparent Rates
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                Catalogue rates in PKR clearly displayed for customer convenience. Honest service and quick turnaround time.
              </p>
            </div>
          </div>
        </div>

        {/* Shop Signboard & About Us Banner */}
        <div className="bg-white border border-neutral-300 rounded-sm overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-4 bg-neutral-950 p-4 flex items-center justify-center">
            <img
              src="/assets/aistudio/IMG-20261025-WA0009_ad5230d0.jpg"
              alt="Baba Sain Pico & Lace Shop Official Signboard"
              className="max-h-96 w-auto object-contain rounded-xs border-2 border-white/20 shadow-md"
            />
          </div>
          <div className="lg:col-span-8 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded-xs">
              <span>Official Shop Signboard & Workshop</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-black font-heading uppercase">
              پنهون جاكرو پيڪو اينڊ ليس شاپ (Baba Sain Pico)
            </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
              {shopInfo.aboutText ||
                'Welcome to Baba Sain Pico official. Yahan par aapko hamare tamam designs aur unki prices dekhne ko milengi. Yahan se koi order ya koi payment nahi ki ja sakti. Apne dupatte banwane ke liye hamari shop Baba Sain per visit karein.'}
            </p>
            <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-800">
              <span>👤 Proprietor: <strong>پنهور جاكرو اينڊ سنز / Manzoor Jakhro</strong></span>
              <span>•</span>
              <span>📍 <strong>Thatta, Sindh</strong></span>
            </div>
          </div>
        </div>

        {/* Shop Info & Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* About Us */}
          <div className="bg-white p-8 border border-neutral-200 rounded-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 block">
                About Our Workshop
              </span>
              <h3 className="text-2xl font-black text-black font-heading mt-1 uppercase">
                {shopInfo.shopName}
              </h3>
              <p className="mt-4 text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
                Dukaan par har qisam ke fancy dupattay, satin pico, zigzag wave pico, crochet lace work, tilla border, aur overlock stitching ki jati hai. Safai aur mazbooti hamari pehchan hai.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-3">
              {shopInfo.logoUrl ? (
                <img
                  src={shopInfo.logoUrl}
                  alt="Shop Logo"
                  className="w-10 h-10 rounded-full object-cover border border-black bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  PJ
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-black block">Quality Guaranteed</span>
                <span className="text-[11px] text-neutral-500">Fine stitching & needlework services</span>
              </div>
            </div>
          </div>

          {/* Contact Details & WhatsApp Support */}
          <div className="bg-black text-white p-8 rounded-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block">
                Visit & Contact
              </span>
              <h3 className="text-2xl font-black text-white font-heading mt-1 uppercase">
                Shop Location & Support
              </h3>

              <div className="mt-6 space-y-5">
                {/* Location */}
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-neutral-400 uppercase font-medium block">
                      Shop Address / Location
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {shopInfo.address || 'Main Chandni Chowk, nazdeek Marwari Waddi Bakery'}
                      {shopInfo.city ? `, ${shopInfo.city}` : ', Thatta'}
                    </p>
                  </div>
                </div>

                {/* WhatsApp Support Option */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-sm bg-neutral-900 border border-neutral-800">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-300 uppercase font-bold block">
                        Customer Support (WhatsApp)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        Manzoor Jakhro
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-extrabold text-white font-mono">
                        {shopInfo.whatsappNumber || '+92 304 3893489'}
                      </span>
                      <a
                        href={`https://wa.me/${(shopInfo.whatsappNumber || '03043893489').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xs transition-colors shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>

                    <div className="mt-2 text-xs text-neutral-400 flex items-center gap-2">
                      <span>Call / Second Number:</span>
                      <span className="text-white font-semibold font-mono">0316-3969727</span>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-neutral-400 uppercase font-medium block">
                      Working Hours
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {shopInfo.businessHours || 'Monday - Saturday: 10:00 AM - 9:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800 text-xs text-neutral-400">
              * Note: Yahan se koi online order ya payment nahi hoti. Apne dupatte aur kapray le kar hamari dukaan Chandni Chowk Thatta par tashreef layein.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
