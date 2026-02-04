import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TransactionForm({ transaction, categories, onSubmit, onCancel }) {
  // 초기값 설정
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    category_id: "",
    type: "expense" // 기본값은 지출
  });

  // 수정 모드일 경우 기존 데이터 채우기
  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        amount: Math.abs(transaction.amount) // 표시용 양수 변환
      });
    }
  }, [transaction]);

  // 핵심 로직: 카테고리 선택 시 유형 자동 변경
  const handleCategoryChange = (catId) => {
    const selectedCat = categories.find(c => c.id === catId);
    if (selectedCat) {
      setFormData({
        ...formData,
        category_id: catId,
        type: selectedCat.type // 카테고리에 정의된 유형(income/expense)을 자동으로 적용
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.amount) return alert("필수 항목을 입력하세요.");
    
    // 금액을 숫자로 변환하여 제출
    onSubmit({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-bold">날짜</label>
        <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">카테고리 선택 (수입/지출 자동 분류)</label>
        <Select value={formData.category_id} onValueChange={handleCategoryChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="카테고리를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {/* 요구하신 형식: 카테고리명(종류) */}
                {cat.name} ({cat.type === 'income' ? '수입' : '지출'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">금액</label>
        <div className="relative">
          <Input 
            type="number" 
            placeholder="0" 
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="pl-8"
          />
          <span className="absolute left-3 top-2 text-slate-400">₩</span>
        </div>
        {/* 현재 유형 상태 표시 (읽기 전용) */}
        <p className={`text-[11px] font-bold uppercase mt-1 ${formData.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
          유형: {formData.type === 'income' ? '수입 내역으로 기록됩니다' : '지출 내역으로 기록됩니다'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">내용</label>
        <Input placeholder="예: 스타벅스 아메리카노" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-4">
        <Button variant="ghost" type="button" onClick={onCancel}>취소</Button>
        <Button type="submit" className="bg-indigo-600 text-white px-10">저장하기</Button>
      </div>
    </form>
  );
}