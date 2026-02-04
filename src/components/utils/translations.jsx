import React, { createContext, useContext, useState } from 'react';

// 가계부에서 사용하는 모든 단어를 여기에 정리합니다.
const translations = {
  ko: {
    dashboard: "대시보드",
    transactions: "거래 내역",
    categories: "카테고리",
    financialDashboard: "재무 대시보드",
    trackIncomeExpenses: "수입 및 지출 현황을 확인하세요",
    totalIncome: "총 수입",
    totalExpenses: "총 지출",
    netBalance: "순 잔액",
    exportToExcel: "엑셀로 내보내기",
    newTransaction: "새 거래 추가",
    deleteConfirm: "정말 삭제하시겠습니까?",
    spendingByCategory: "카테고리별 지출",
    manageTransactions: "거래 내역을 관리하고 분석하세요",
    copyright: "© 2026 FinanceFlow. All rights reserved."
  },
  en: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    categories: "Categories",
    financialDashboard: "Financial Dashboard",
    trackIncomeExpenses: "Track your income and expenses",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netBalance: "Net Balance",
    exportToExcel: "Export to Excel",
    newTransaction: "New Transaction",
    deleteConfirm: "Are you sure you want to delete?",
    spendingByCategory: "Spending by Category",
    manageTransactions: "Manage and analyze your transactions",
    copyright: "© 2026 FinanceFlow. All rights reserved."
  }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ko'); // 기본값은 한국어
  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};