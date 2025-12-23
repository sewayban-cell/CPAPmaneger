
import React, { useState, useRef } from 'react';
import { MachineStatus, MachineRecord, MachineModel, MachineCategory } from '../types.ts';
import { recognizeSerialNumber } from '../services/geminiService.ts';

interface MachineFormProps {
  initialData?: MachineRecord;
  onSave: (record: MachineRecord) => void;
  onCancel: () => void;
}

const MachineForm: React.FC<MachineFormProps> = ({ initialData, onSave, onCancel }) => {
  const [sn, setSn] = useState(initialData?.serialNumber || '');
  const [model, setModel] = useState<MachineModel>(initialData?.model || MachineModel.FP);
  const [category, setCategory] = useState<MachineCategory>(initialData?.category || MachineCategory.NEW);
  const [status, setStatus] = useState<MachineStatus>(initialData?.status || MachineStatus.IN_STOCK);
  const [date, setDate] = useState(initialData?.statusDate || new Date().toISOString().split('T')[0]);
  const [patient, setPatient] = useState(initialData?.patientName || '');
  const [phone, setPhone] = useState(initialData?.phoneNumber || '');
  const [accInput, setAccInput] = useState('');
  const [accessories, setAccessories] = useState<string[]>(initialData?.accessories || []);
  const [loading, setLoading] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await recognizeSerialNumber(base64);
        if (result) {
          setSn(result);
        } else {
          alert('無法辨識，請確保標籤清晰或嘗試手動輸入。');
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('辨識異常');
      setLoading(false);
    }
  };

  const handleAddAcc = () => {
    if (accInput.trim() && !accessories.includes(accInput.trim())) {
      setAccessories([...accessories, accInput.trim()]);
      setAccInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sn.trim()) return alert('請輸入序號');
    
    const needsPatientInfo = [MachineStatus.TRIAL, MachineStatus.RENTAL, MachineStatus.PURCHASED].includes(status);
    if (needsPatientInfo && !patient.trim()) return alert('請輸入個案姓名');

    onSave({
      id: initialData?.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + Date.now().toString(36)),
      serialNumber: sn.trim().toUpperCase(),
      model,
      category,
      status,
      statusDate: date,
      patientName: needsPatientInfo ? patient.trim() : undefined,
      phoneNumber: needsPatientInfo ? phone.trim() : undefined,
      accessories: needsPatientInfo ? accessories : [],
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800">{initialData ? '修改資料' : '新增紀錄'}</h2>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
          {/* Machine Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">機器類別</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(MachineCategory).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`py-2 rounded-xl border-2 font-black text-sm transition-all ${category === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Machine Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">品牌型號</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(MachineModel).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`py-2 rounded-xl border-2 font-black text-sm transition-all ${model === m ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">機器序號</label>
            <div className="flex gap-2">
              <input type="text" value={sn} onChange={e => setSn(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="輸入或辨識序號" />
              <button type="button" onClick={() => fileRef.current?.click()} className="px-4 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                {loading ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
              </button>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileRef} onChange={handlePhoto} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">狀態</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(MachineStatus).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)} className={`py-2.5 rounded-xl border-2 font-black text-sm transition-all ${status === s ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">生效日期</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {[MachineStatus.TRIAL, MachineStatus.RENTAL, MachineStatus.PURCHASED].includes(status) && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">個案姓名</label>
                  <input type="text" value={patient} onChange={e => setPatient(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="姓名" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">聯絡電話</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="電話" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">配件</label>
                <div className="flex gap-2">
                  <input type="text" value={accInput} onChange={e => setAccInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAcc())} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none" placeholder="輸入配件名稱" />
                  <button type="button" onClick={handleAddAcc} className="px-4 bg-slate-200 text-slate-700 rounded-xl font-black text-xs hover:bg-slate-300">加入</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {accessories.map((acc, i) => (
                    <span key={i} className="bg-blue-50 px-2 py-1 rounded-lg text-[10px] font-black border border-blue-100 text-blue-600 flex items-center gap-1">
                      {acc}
                      <button type="button" onClick={() => setAccessories(accessories.filter((_, idx) => idx !== i))} className="hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 bg-white border border-slate-300 text-slate-600 rounded-2xl font-black active:scale-95">取消</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95">儲存</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MachineForm;
