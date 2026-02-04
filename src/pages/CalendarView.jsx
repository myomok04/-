import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval 
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 1. 해당 월의 데이터만 창고(Supabase)에서 호출
  const { data: transactions } = useQuery({
    queryKey: ['transactions', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', start)
        .lte('date', end);
      if (error) throw error;
      return data || [];
    }
  });

  // 2. 날짜별 합계 계산 로직 (데이터 정제)
  const getDayStats = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTrans = transactions?.filter(t => t.date === dayStr) || [];
    
    const income = dayTrans
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = dayTrans
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense };
  };

  // 3. 달력 그리드 생성
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {format(currentMonth, 'yyyy년 M월', { locale: ko })} 지출 내역
      </h1>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>오늘</Button>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return (
      <div className="grid grid-cols-7 mb-2 border-b">
        {days.map((d, i) => (
          <div key={i} className={`text-center py-2 text-sm font-bold ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-indigo-500' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const { income, expense } = getDayStats(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div 
            key={day} 
            className={`min-h-[100px] border-r border-b p-2 transition-colors hover:bg-slate-50 ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}`}
          >
            <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-slate-300' : isSameDay(day, new Date()) ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
              {format(day, 'd')}
            </span>
            <div className="mt-2 space-y-1">
              {income > 0 && <div className="text-[10px] font-bold text-blue-600">+{income.toLocaleString()}</div>}
              {expense > 0 && <div className="text-[10px] font-bold text-red-500">-{expense.toLocaleString()}</div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day}>{days}</div>);
      days = [];
    }
    return <div className="border-t border-l rounded-lg overflow-hidden shadow-sm">{rows}</div>;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}