import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, amount, type, icon: Icon }) {
  const isIncome = type === 'income';

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className={cn(
              "text-2xl font-bold",
              isIncome ? "text-emerald-600" : "text-rose-600"
            )}>
              {isIncome ? '+' : '-'}{Math.abs(amount).toLocaleString()}원
            </h3>
          </div>
          {Icon && (
            <div className={cn(
              "p-3 rounded-xl",
              isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}