
import React from 'react';
import { MachineRecord, STATUS_COLORS } from '../types.ts';

interface MachineCardProps {
  machine: MachineRecord;
  onEdit: (m: MachineRecord) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, onEdit }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(machine);
  };

  return (
    <div 
      className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-xl transition-all flex flex-col relative overflow-hidden group min-h-[220px] cursor-pointer"
      onClick={handleEdit}
    >
      {/* 標題與狀態 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black border-2 shadow-sm ${STATUS_COLORS[machine.status]}`}>
              {machine.status}
            </span>
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
              {machine.model}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-800 font-mono break-all leading-tight">
            {machine.serialNumber}
          </h3>
        </div>
        <div className="p-2.5 text-slate-300 group-hover:text-blue-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </div>
      </div>

      {/* 資料內容 */}
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          {machine.statusDate}
        </div>
        
        {machine.patientName && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span className="text-sm font-black text-slate-700 truncate">{machine.patientName}</span>
            </div>
            {machine.phoneNumber && (
              <div className="flex items-center gap-2 pl-6">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span className="text-[11px] font-bold text-slate-500">{machine.phoneNumber}</span>
              </div>
            )}
          </div>
        )}

        {machine.accessories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {machine.accessories.slice(0, 3).map((acc, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[9px] text-slate-500 font-black shadow-sm">
                {acc}
              </span>
            ))}
            {machine.accessories.length > 3 && <span className="text-[9px] text-slate-400 font-bold">...</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineCard;
