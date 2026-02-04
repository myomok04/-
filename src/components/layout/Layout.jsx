import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TableProperties, 
  Tags, 
  Calendar as CalendarIcon, 
  Wallet 
} from "lucide-react";

/**
 * 중앙 제어 레이아웃 (Layout)
 * 모든 페이지의 외곽(사이드바)을 담당하는 마스터 컴포넌트입니다.
 */
export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // 사이드바 메뉴 명세서 [지출 내역 달력 추가됨]
  const menuItems = [
    { name: "대시보드", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "거래 내역", path: "/transactions", icon: <TableProperties className="w-5 h-5" /> },
    { name: "카테고리 관리", path: "/categories", icon: <Tags className="w-5 h-5" /> },
    { name: "지출 내역 달력", path: "/calendar", icon: <CalendarIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* 1. 사이드바 (Navigation Control) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Smart 가계부</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 2. 하단 시스템 상태 (Industrial Engineering Style) */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Status</p>
            <p className="text-xs font-medium mt-1">8월 복무 대비 시스템 가동 중</p>
          </div>
        </div>
      </aside>

      {/* 3. 메인 작업 영역 (Main Content) */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}