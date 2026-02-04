import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, Edit2, Check, X, 
  ArrowUpCircle, ArrowDownCircle 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 카테고리의 이름과 수입/지출 유형을 관리하는 공정 페이지입니다.
 * 이제 수정 모드에서 유형(type)도 변경할 수 있습니다.
 */
export default function Categories() {
  const queryClient = useQueryClient();
  
  // 상태 관리 (입력 및 수정)
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", type: "expense" });
  
  // 수정 중인 데이터 상태
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", type: "expense" });

  // 1. 카테고리 로딩
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: false })
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // 2. 추가 공정 (Create)
  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const { error } = await supabase.from('categories').insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryKeyRefetch();
      setIsAdding(false);
      setNewCategory({ name: "", type: "expense" });
    }
  });

  // 3. 수정 공정 (Update) - 이름과 유형을 모두 업데이트합니다.
  const updateMutation = useMutation({
    mutationFn: async ({ id, name, type }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name, type })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryKeyRefetch();
      setEditingId(null);
    }
  });

  // 4. 삭제 공정 (Delete)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryKeyRefetch()
  });

  const queryKeyRefetch = () => {
    queryClient.invalidateQueries(['categories']);
    // 거래 내역에서도 바뀐 카테고리 정보가 반영되도록 갱신
    queryClient.invalidateQueries(['transactions']);
  };

  if (isLoading) return <div className="p-8 text-center">분류 체계 로딩 중...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">카테고리 관리</h1>
          <p className="text-slate-500">수입/지출 항목을 자유롭게 수정하고 관리하세요.</p>
        </div>
        
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)} 
            className="rounded-full w-12 h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        )}
      </div>

      {/* 추가 양식 */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리 이름</label>
              <Input 
                placeholder="예: 식비, 월급..." 
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">유형</label>
              <Select 
                value={newCategory.type} 
                onValueChange={(val) => setNewCategory({...newCategory, type: val})}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">지출</SelectItem>
                  <SelectItem value="income">수입</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>취소</Button>
            <Button 
              className="bg-indigo-600 text-white px-8" 
              onClick={() => addMutation.mutate(newCategory)}
              disabled={!newCategory.name}
            >
              확인
            </Button>
          </div>
        </div>
      )}

      {/* 목록 및 수정/삭제 섹션 */}
      <div className="grid gap-3">
        {categories?.map((category) => (
          <div 
            key={category.id} 
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* 수정 모드가 아닐 때의 아이콘 표시 */}
              {editingId !== category.id && (
                category.type === 'income' ? 
                  <ArrowUpCircle className="w-5 h-5 text-emerald-500" /> : 
                  <ArrowDownCircle className="w-5 h-5 text-rose-500" />
              )}
              
              {editingId === category.id ? (
                /* 수정 모드: 이름과 유형을 동시에 변경 가능 */
                <div className="flex gap-2 flex-1 items-center">
                  <Input 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="max-w-[180px] h-9"
                    autoFocus
                  />
                  <Select 
                    value={editForm.type} 
                    onValueChange={(val) => setEditForm({ ...editForm, type: val })}
                  >
                    <SelectTrigger className="w-[100px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">지출</SelectItem>
                      <SelectItem value="income">수입</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">{category.name}</span>
                  <span className={`text-[10px] font-bold uppercase ${category.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {category.type === 'income' ? '수입' : '지출'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {editingId === category.id ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => updateMutation.mutate({ 
                      id: category.id, 
                      name: editForm.name, 
                      type: editForm.type 
                    })}
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </Button>
                </>
              ) : (
                <>
                  {/* 수정 버튼 */}
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingId(category.id);
                    setEditForm({ name: category.name, type: category.type });
                  }}>
                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                  </Button>
                  {/* 삭제 버튼 */}
                  <Button variant="ghost" size="sm" onClick={() => {
                    if(confirm("이 카테고리를 삭제할까요?")) deleteMutation.mutate(category.id);
                  }}>
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}