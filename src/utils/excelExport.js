import * as XLSX from 'xlsx';

/**
 * 가계부 데이터를 엑셀로 출하하는 공정 모듈
 */
export const exportToExcel = (transactions, categories, period) => {
  // 1. 데이터 전처리 (날짜 오름차순 정렬 및 카테고리명 매핑)
  const processedData = (transactions || [])
    .map(t => {
      const cat = categories.find(c => c.id === t.category_id);
      return {
        date: t.date,
        description: t.description,
        categoryName: cat ? `${cat.name}(${cat.type === 'income' ? '수입' : '지출'})` : '미지정',
        amount: Number(t.amount),
        type: cat?.type || 'expense'
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // --- 시트 1: 거래 내역 ---
  const sheet1Data = [
    [`기간: ${period.start} ~ ${period.end}`], 
    ['거래 날짜', '설명', '카테고리', '금액'], 
    ...processedData.map(d => [d.date, d.description, d.categoryName, d.amount])
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // --- 시트 2: 통계 요약 ---
  const stats = processedData.reduce((acc, curr) => {
    if (!acc[curr.categoryName]) {
      acc[curr.categoryName] = { name: curr.categoryName, amount: 0, type: curr.type };
    }
    acc[curr.categoryName].amount += curr.amount;
    return acc;
  }, {});

  const statsArray = Object.values(stats);
  const incomeStats = statsArray.filter(s => s.type === 'income');
  const expenseStats = statsArray.filter(s => s.type === 'expense');

  const sheet2Data = [
    [`${period.start} ~ ${period.end} 통계 분석 리포트`],
    [],
    ['[지출 항목별 합계]'],
    ['카테고리(유형)', '금액'],
    ...expenseStats.map(s => [s.name, s.amount]),
    [],
    ['[수입 항목별 합계]'],
    ['카테고리(유형)', '금액'],
    ...incomeStats.map(s => [s.name, s.amount]),
    [],
    ['[재무 지표 분석]'],
    ['항목', '값'],
    ['총 수입', incomeStats.reduce((sum, s) => sum + s.amount, 0)],
    ['총 지출', expenseStats.reduce((sum, s) => sum + s.amount, 0)],
    ['순 잔액(수입-지출)', incomeStats.reduce((sum, s) => sum + s.amount, 0) - expenseStats.reduce((sum, s) => sum + s.amount, 0)]
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

  // 2. 엑셀 워크북 패키징 및 출하
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "거래 내역");
  XLSX.utils.book_append_sheet(wb, ws2, "통계 분석");

  XLSX.writeFile(wb, `가계부_데이터_${period.start}_${period.end}.xlsx`);
};