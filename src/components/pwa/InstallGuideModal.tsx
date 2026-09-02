import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  PlusSquare, 
  Download, 
  Smartphone, 
  CheckCircle2, 
  Info, 
  Bell, 
  BatteryCharging, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { getPlatformCapabilities } from '../../lib/notifications';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [activePlatformTab, setActivePlatformTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const caps = getPlatformCapabilities();

  if (!isOpen) return null;

  return (
    <div 
      id="pwa-install-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="pwa-install-guide-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 text-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                راهنمای نصب تسکامه (PWA)
              </h3>
              <p className="text-[11px] text-slate-400">
                تجربه سریع، آفلاین و بدون نیاز به اپ‌استور یا گوگل‌پلی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActivePlatformTab('ios')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activePlatformTab === 'ios'
                ? 'bg-indigo-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            آیفون و آیپد (iOS)
          </button>
          <button
            onClick={() => setActivePlatformTab('android')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activePlatformTab === 'android'
                ? 'bg-indigo-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            گوشی‌های اندروید
          </button>
          <button
            onClick={() => setActivePlatformTab('desktop')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activePlatformTab === 'desktop'
                ? 'bg-indigo-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            کامپیوتر / مک
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 flex-1">
          {activePlatformTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>شفافیت فنی در iOS:</strong> طبق معماری امنیتی اپل، وب‌اپلیکیشن‌ها فقط در صورتی اجازه دریافت اعلان و تمام‌صفحه شدن دارند که به صفحه اصلی گوشی اضافه شوند.
                </span>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    ۱
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
                      <span>دکمه اشتراک‌گذاری (Share) در سافاری</span>
                      <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      در نوار پایین مرورگر سافاری، روی دکمه آبی‌رنگ مربع با فلش رو به بالا (Share) ضربه بزنید.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    ۲
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
                      <span>انتخاب «Add to Home Screen»</span>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      در منوی بازشده به سمت پایین اسکرول کنید و گزینه <strong>«Add to Home Screen»</strong> (یا «افزودن به صفحه اصلی») را انتخاب کنید.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    ۳
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1">
                      تأیید و زدن دکمه «Add»
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      در بالای صفحه سمت راست، دکمه <strong>Add</strong> را بزنید. آیکون شیک تسکامه روی صفحه گوشی شما قرار می‌گیرد.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatformTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  نصب روی اندروید تنها با ۱ کلیک انجام می‌شود و تمام داده‌ها در حافظه داخلی گوشی با ایمنی کامل ذخیره خواهند شد.
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    ۱
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1">
                      زدن دکمه «نصب برنامه» در هدر تسکامه
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      روی دکمه بنفش‌رنگ «نصب برنامه» در بالای صفحه کلیک کنید و پنجره نصب را تأیید کنید.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    ۲
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1">
                      روش جایگزین از منوی مرورگر کروم
                    </h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      روی سه نقطه بالای مرورگر کروم ضربه بزنید و گزینه «نصب برنامه» (Install app) یا «افزودن به صفحه اصلی» را انتخاب نمایید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatformTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] leading-relaxed">
                در مرورگر Chrome یا Edge روی کامپیوتر، آیکون نصب در انتهای نوار آدرس ظاهر می‌شود. با کلیک روی آن، تسکامه در پنجره‌ای مستقل و تمام‌صفحه بدون مزاحمت باز خواهد شد.
              </div>
            </div>
          )}

          {/* Architecture & Battery Promise */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h5 className="font-semibold text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>تعهدات حریم خصوصی و باتری تسکامه:</span>
            </h5>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>هیچ پردازش سنگینی در پس‌زمینه انجام نمی‌شود تا باتری شما کوچک‌ترین آسیبی نبیند.</li>
              <li>داده‌ها در وهله اول روی خود دستگاه شما ذخیره می‌شوند و حتی در نبود اینترنت همیشه در دسترس‌اند.</li>
              <li>شورتکات کیبورد <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white">N</kbd> برای تسک جدید و <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white">⌘K</kbd> برای جستجو در دسکتاپ فعال است.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
