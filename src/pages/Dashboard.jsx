import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import StatsCard from "../components/finance/StatsCard";
import CategoryChart from "../components/finance/CategoryChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startOfMonth, format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCcw, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: transactions, isLoading: isTransLoading } = useQuery({
    queryKey: ['transactions', dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data, error } = await supabase.from('transactions')
        .select('*').gte('date', dateRange.start).lte('date', dateRange.end);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // 📊 데이터 정제 공정 (QC 강화)
  const { incomeData, expenseData, totals } = useMemo(() => {
    // 1. 초기 안전장치
    if (!transactions || !categories) return { incomeData: [], expenseData: [], totals: { income: 0, expense: 0 } };

    const catMap = categories.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

    const process = (type) => {
      const filtered = transactions.filter(t => t.type === type);
      
      // 2. 합계가 0이면 빈 배열 반환 (NaN 방지 핵심)
      const totalSum = filtered.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
      if (totalSum === 0) return [];

      const grouped = filtered.reduce((acc, t) => {
        const name = catMap[t.category_id] || "기타/미지정";
        const val = Math.abs(Number(t.amount)) || 0;
        acc[name] = (acc[name] || 0) + val;
        return acc;
      }, {});

      // 3. 값이 0보다 큰 항목만 필터링 (흰색 그래프 방지 핵심)
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0) // 👈 이 줄이 중요합니다!
        .sort((a, b) => b.value - a.value);
    };

    return {
      incomeData: process('income'),
      expenseData: process('expense'),
      totals: {
        income: transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0),
        expense: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
      }
    };
  }, [transactions, categories]);

  if (isTransLoading) return <div className="p-8 text-center text-slate-500">데이터 분석 공정 가동 중...</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" /> 재무 대시보드
          </h1>
          <p className="text-slate-500 mt-1">정확한 데이터에 기반한 자산 관리 시스템입니다.</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="수입 합계" amount={totals.income} type="income" />
        <StatsCard title="지출 합계" amount={totals.expense} type="expense" />
        <StatsCard title="순 자산" amount={totals.income - totals.expense} type="balance" />
      </div>

      <div className="space-y-6">
        {/* 날짜 필터 컨트롤러 */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">카테고리별 점유율 분석</h2>
            <p className="text-sm text-slate-400">데이터가 있는 항목만 시각화하여 분석합니다.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <CalendarIcon className="w-4 h-4 text-indigo-600 ml-2" />
            <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="border-none bg-transparent w-36 text-sm" />
            <span className="text-slate-300 font-bold">~</span>
            <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="border-none bg-transparent w-36 text-sm" />
            <Button variant="ghost" size="sm" onClick={() => setDateRange({start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd')})}>
              <RefreshCcw className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* 📊 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-blue-600 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-500 rounded-full" /> 수입 비중 분석
            </h3>
            <CategoryChart data={incomeData} />
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-rose-600 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-rose-500 rounded-full" /> 지출 비중 분석
            </h3>
            <CategoryChart data={expenseData} />
          </div>
        </div>
      </div>
    </div>
  );
}