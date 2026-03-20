import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, amount, type, icon: Icon }) {
  // 수입이면 무조건 true, 지출이면 무조건 false, 순 자산(balance)이면 금액이 0 이상인지 판단
  const isPositive = type === 'income' ? true : type === 'expense' ? false : amount >= 0;

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className={cn(
              "text-2xl font-bold",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}>
              {isPositive ? '+' : '-'}{Math.abs(amount).toLocaleString()}원
            </h3>
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-xl",
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
