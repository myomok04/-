import Dashboard from './pages/Dashboard'; // 👈 중괄호 {} 없이 불러와야 합니다.
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
// ... 나머지 설정
import __Layout from './Layout.jsx';

export const PAGES = {
    "Dashboard": Dashboard,
    "Categories": Categories,
    "Transactions": Transactions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};