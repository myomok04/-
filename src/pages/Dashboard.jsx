import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import StatsCard from "../components/finance/StatsCard";
import SpendingChart from "../components/finance/SpendingChart";
import DateRangePicker from "../components/finance/DateRangePicker";

// ⚠️ 반드시 'export default' 라고 명시해야 합니다!
export default function Dashboard() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transactions').select('*');
      if (error) return [];
      return data || [];
    }
  });

  if (isLoading) return <div className="p-8">데이터 로딩 중...</div>;

  // 통계 계산 (안전장치 추가)
  const safeTransactions = transactions || [];
  const totalIncome = safeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = safeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">재무 대시보드</h1>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="총 수입" amount={totalIncome} type="income" />
        <StatsCard title="총 지출" amount={totalExpense} type="expense" />
        <StatsCard title="순 잔액" amount={totalIncome - totalExpense} type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart data={safeTransactions} />
      </div>
    </div>
  );
}