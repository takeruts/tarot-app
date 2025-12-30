'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentLocale = () => {
    const segments = pathname.split('/');
    if (['ja', 'en', 'zh'].includes(segments[1])) {
      return segments[1];
    }
    return 'ja';
  };

  const currentLocale = getCurrentLocale();

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (locale: string) => {
    const segments = pathname.split('/');

    // Remove current locale from path if present
    if (['ja', 'en', 'zh'].includes(segments[1])) {
      segments.splice(1, 1);
    }

    // Add new locale
    const newPath = `/${locale}${segments.join('/') || ''}`;
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="text-white font-medium">{currentLanguage?.name}</span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden z-50 min-w-[160px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/20 transition-all duration-200 ${
                lang.code === currentLocale ? 'bg-white/10' : ''
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-white font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
