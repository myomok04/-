import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils'; // 경로 수정에 주의하세요
import { LayoutDashboard, Tag, TrendingUp, Receipt } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from './components/utils/translations';
import LanguageToggle from './components/LanguageToggle';

export default function Layout({ children, currentPageName }) {
  const { language, setLanguage, t } = useLanguage();
  
  const navigation = [
    { name: t('dashboard'), icon: LayoutDashboard, page: 'Dashboard' },
    { name: t('transactions'), icon: Receipt, page: 'Transactions' },
    { name: t('categories'), icon: Tag, page: 'Categories' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200/60 backdrop-blur-xl z-50">
        <div className="flex flex-col h-full">
          <div className="px-6 py-8 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">FinanceFlow</h1>
                <p className="text-xs text-slate-500">{t('smartAnalytics')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-indigo-600")} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <LanguageToggle language={language} setLanguage={setLanguage} />

          <div className="px-6 py-4 border-t border-slate-200/60">
            <p className="text-xs text-slate-500">{t('copyright')}</p>
          </div>
        </div>
      </aside>

      <div className="ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}