import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// 🎨 고대비 색상 팔레트 (8색)
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function CategoryChart({ data }) {
  // 1. 데이터 없음 처리
  if (!data || data.length === 0) return (
    <div className="h-[300px] flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-xl">
      해당 기간에 분석할 데이터가 없습니다.
    </div>
  );

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            // 2. NaN 방지 안전장치 추가 (percent가 없거나 숫자가 아니면 0%로 표시)
            label={({ name, percent }) => {
               const safePercent = (percent && !isNaN(percent)) ? (percent * 100).toFixed(0) : '0';
               return `${name} ${safePercent}%`;
            }}
            labelLine={true}
          >
            {data.map((entry, index) => (
              // 3. 색상 매핑 (값이 있는 항목에만 색상이 적용됨)
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="white" 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            // Tooltip에서도 안전하게 퍼센트 계산
            formatter={(value, name, props) => {
              const safePercent = (props.percent && !isNaN(props.percent)) ? (props.percent * 100).toFixed(1) : '0.0';
              return [`${value.toLocaleString()}원 (${safePercent}%)`, name];
            }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={40} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}