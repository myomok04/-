import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import CalendarView from "./pages/CalendarView"; // 1. 달력 페이지 부품 수입
import Layout from "./components/layout/Layout";

/**
 * 가계부 공정 마스터 설정 (Flight Control)
 * 여기에 페이지를 추가하면 App.jsx가 알아서 라우팅(복도)을 생성합니다.
 */
export const pagesConfig = {
  Pages: {
    dashboard: Dashboard,
    transactions: Transactions,
    categories: Categories,
    calendar: CalendarView, // 2. 'calendar'라는 주소로 달력 공정 등록
  },
  Layout: Layout,
  mainPage: "dashboard",
};