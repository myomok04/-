import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import TransactionTable from "../components/finance/TransactionTable";
import TransactionForm from "../components/finance/TransactionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Calendar as CalendarIcon, X } from "lucide-react";
import { exportToExcel } from "../utils/excelExport";

/**
 * 거래 내역 관리 및 기간별 엑셀 출하 공정
 * 산업경영공학 전공 지식을 활용하여 데이터 선별 공정을 최적화했습니다.
 */
export default function Transactions() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // --- 엑셀 출하 기간 선택 상태 ---
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportRange, setExportRange] = useState({
    // 기본값: 이번 달 1일부터 오늘까지
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // 1. 거래 내역 로딩
  const { data: transactions, isLoading: isTransLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. 카테고리 마스터 데이터 로딩
  const { data: categories, isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // 3. 필터링된 데이터 엑셀 출하 실행
  const handleExecuteExport = () => {
    if (!transactions || transactions.length === 0) {
      alert("출하할 데이터가 시스템에 존재하지 않습니다.");
      return;
    }

    // 선택한 기간에 해당하는 거래만 필터링 (품질 검사 및 데이터 선별)
    const filteredData = transactions.filter(t => {
      return t.date >= exportRange.start && t.date <= exportRange.end;
    });

    if (filteredData.length === 0) {
      alert(`${exportRange.start} ~ ${exportRange.end} 기간 내에 기록된 내역이 없습니다.`);
      return;
    }

    // 선별된 데이터만 엑셀 모듈로 전송
    exportToExcel(filteredData, categories, exportRange);
    setShowExportPanel(false); // 출하 공정 완료 후 패널 닫기
  };

  // 4. 데이터 추가/수정 공정 (Mutation)
  const upsertMutation = useMutation({
    mutationFn: async (record) => {
      if (record.id) {
        const { error } = await supabase.from('transactions').update(record).eq('id', record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([record]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      setIsFormOpen(false);
      setEditingTransaction(null);
    }
  });

  if (isTransLoading || isCatLoading) return <div className="p-8 text-center text-slate-500">통계 데이터 동기화 중...</div>;

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto min-h-screen">
      {/* 상단 헤더 섹션 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">거래 내역 관리</h1>
          <p className="text-slate-500 mt-1">기록된 데이터를 기반으로 자산 흐름을 정밀 분석합니다.</p>
        </div>
        <div className="flex gap-2">
          {/* 엑셀 출하 패널 토글 버튼 */}
          <Button 
            onClick={() => setShowExportPanel(!showExportPanel)} 
            variant="outline" 
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> 엑셀 출하
          </Button>
          <Button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(!isFormOpen); }} 
            className="bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            {isFormOpen ? "닫기" : "새 기록 추가"}
          </Button>
        </div>
      </div>

      {/* 엑셀 기간 선택 패널 (산업경영공학적 인터페이스) */}
      {showExportPanel && (
        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-indigo-900 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" /> 출하 기간 설정
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowExportPanel(false)} className="text-indigo-400">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">시작일</label>
              <Input 
                type="date" 
                className="bg-white border-indigo-200 w-48 focus:ring-indigo-500" 
                value={exportRange.start} 
                onChange={(e) => setExportRange({...exportRange, start: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">종료일</label>
              <Input 
                type="date" 
                className="bg-white border-indigo-200 w-48 focus:ring-indigo-500" 
                value={exportRange.end} 
                onChange={(e) => setExportRange({...exportRange, end: e.target.value})}
              />
            </div>
            <Button 
              onClick={handleExecuteExport} 
              className="bg-indigo-600 text-white px-10 hover:bg-indigo-700 transition-colors"
            >
              엑셀 생성 및 다운로드
            </Button>
          </div>
          <p className="text-[11px] text-indigo-400 italic">* 선택하신 기간 내의 데이터만 추출되어 엑셀 리포트로 생성됩니다.</p>
        </div>
      )}

      {/* 거래 입력 양식 */}
      {isFormOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <TransactionForm 
            transaction={editingTransaction}
            categories={categories} 
            onSubmit={(data) => upsertMutation.mutate(data)} 
            onCancel={() => { setIsFormOpen(false); setEditingTransaction(null); }}
          />
        </div>
      )}

      {/* 거래 내역 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 overflow-hidden">
        <TransactionTable 
          transactions={transactions} 
          categories={categories}
          onEdit={(t) => {
            setEditingTransaction(t);
            setIsFormOpen(true);
          }}
          onDelete={async (id) => {
            if (confirm("이 데이터를 공정에서 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")) {
              await supabase.from('transactions').delete().eq('id', id);
              queryClient.invalidateQueries(['transactions']);
            }
          }}
        />
      </div>
    </div>
  );
}