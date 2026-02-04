export const base44 = {
  entities: {
    Transaction: {
      list: () => Promise.resolve([]), // 임시로 빈 배열 반환
      create: (data) => Promise.resolve(data),
      update: (id, data) => Promise.resolve(data),
      delete: (id) => Promise.resolve(id),
    },
    Category: {
      list: () => Promise.resolve([
        { id: '1', name: '식비' },
        { id: '2', name: '교통비' },
        { id: '3', name: '쇼핑' }
      ]),
    }
  }
};