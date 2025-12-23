
import React, { useState, useEffect, useMemo } from 'react';
import { MachineRecord, MachineStatus, MachineModel } from './types';
import MachineCard from './components/MachineCard';
import MachineForm from './components/MachineForm';
import * as XLSX from 'xlsx';

type SortOption = 'newest' | 'serial' | 'status' | 'date';

const App: React.FC = () => {
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MachineRecord | undefined>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isReady, setIsReady] = useState(false);

  // 初始化讀取
  useEffect(() => {
    const saved = localStorage.getItem('sleep_db_v4');
    if (saved) {
      try {
        setMachines(JSON.parse(saved));
      } catch (e) {
        console.error("資料解析失敗", e);
      }
    }
    setIsReady(true);
  }, []);

  // 資料持久化
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('sleep_db_v4', JSON.stringify(machines));
    }
  }, [machines, isReady]);

  const stats = useMemo(() => {
    const counts = {
      [MachineStatus.IN_STOCK]: 0,
      [MachineStatus.TRIAL]: 0,
      [MachineStatus.RENTAL]: 0,
      [MachineStatus.PURCHASED]: 0,
    };
    machines.forEach(m => {
      if (counts[m.status] !== undefined) counts[m.status]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [machines]);

  const filteredAndSorted = useMemo(() => {
    let result = [...machines].filter(m => {
      const q = search.toLowerCase();
      const snMatch = m.serialNumber.toLowerCase().includes(q);
      const ptMatch = (m.patientName || '').toLowerCase().includes(q);
      const phMatch = (m.phoneNumber || '').toLowerCase().includes(q);
      const modelMatch = m.model.toLowerCase().includes(q);
      
      const dateInRange = (!startDate || m.statusDate >= startDate) && 
                          (!endDate || m.statusDate <= endDate);

      return (snMatch || ptMatch || phMatch || modelMatch) && 
             (statusFilter === 'all' || m.status === statusFilter) &&
             dateInRange;
    });

    result.sort((a, b) => {
      switch (sortOption) {
        case 'serial': return a.serialNumber.localeCompare(b.serialNumber);
        case 'status': return a.status.localeCompare(b.status);
        case 'date': return b.statusDate.localeCompare(a.statusDate);
        default: return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });
    return result;
  }, [machines, search, statusFilter, startDate, endDate, sortOption]);

  const handleSave = (record: MachineRecord) => {
    setMachines(prev => {
      const index = prev.findIndex(m => m.id === record.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = record;
        return next;
      }
      // 防止重複序號
      if (prev.some(m => m.serialNumber === record.serialNumber)) {
        alert('此序號已存在系統中！');
        return prev;
      }
      return [record, ...prev];
    });
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  const exportExcel = () => {
    const data = filteredAndSorted.map(m => ({
      '序號': m.serialNumber,
      '型號': m.model,
      '狀態': m.status,
      '日期': m.statusDate,
      '個案': m.patientName || '',
      '電話': m.phoneNumber || '',
      '配件': m.accessories.join(', '),
      '更新時間': new Date(m.lastUpdated).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `SleepInventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <h1 className="text-xl font-black text-slate-800">序號管理系統</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-95" title="匯出當前列表">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </button>
          <button onClick={() => { setEditingItem(undefined); setIsFormOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 active:scale-95">
            新增
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
              <div className="text-3xl font-black text-slate-800 mt-1">{s.value}</div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="搜尋序號、個案、型號或電話..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-3 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]">
                <option value="all">全部狀態</option>
                {Object.values(MachineStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-300">
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">區間</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none"
                />
                <span className="text-slate-300">~</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none"
                />
                {(startDate || endDate) && (
                  <button 
                    onClick={() => {setStartDate(''); setEndDate('');}}
                    className="ml-2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="bg-transparent px-2 py-1 text-xs font-bold outline-none cursor-pointer">
                <option value="newest">最新更新</option>
                <option value="serial">序號排序</option>
                <option value="date">日期排序</option>
              </select>
            </div>
          </div>
          
          {filteredAndSorted.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="text-slate-400 font-bold">沒有符合搜尋條件的機器紀錄</div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSorted.map(m => (
            <MachineCard key={m.id} machine={m} onEdit={(record) => { setEditingItem(record); setIsFormOpen(true); }} />
          ))}
        </section>
      </main>

      {isFormOpen && (
        <MachineForm 
          initialData={editingItem} 
          onSave={handleSave} 
          onCancel={() => { setIsFormOpen(false); setEditingItem(undefined); }} 
        />
      )}
    </div>
  );
};

export default App;
