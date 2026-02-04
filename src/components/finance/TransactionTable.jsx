import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TransactionTable({ transactions, categories, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">날짜</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">설명</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">카테고리</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">금액</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.map((t) => {
            const category = categories.find(c => c.id === t.category_id);
            const isIncome = t.type === 'income';

            return (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {format(new Date(t.date), 'yyyy-MM-dd')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.description}</td>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="secondary">{category?.name || '미지정'}</Badge>
                </td>
                <td className={`px-6 py-4 text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'}{t.amount.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}>
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}