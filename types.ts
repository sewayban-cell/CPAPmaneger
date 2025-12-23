
export enum MachineStatus {
  IN_STOCK = '在庫',
  TRIAL = '試機',
  RENTAL = '租機',
  PURCHASED = '購機'
}

export enum MachineModel {
  FP = 'F&P',
  PHILIPS = 'Philips',
  RESMED = 'Resmed'
}

export enum MachineCategory {
  NEW = '新機',
  RENTAL_UNIT = '租賃機'
}

export interface MachineRecord {
  id: string;
  serialNumber: string;
  model: MachineModel;
  category: MachineCategory;
  status: MachineStatus;
  statusDate: string;
  patientName?: string;
  phoneNumber?: string;
  accessories: string[];
  lastUpdated: string;
}

export const STATUS_COLORS = {
  [MachineStatus.IN_STOCK]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [MachineStatus.TRIAL]: 'bg-amber-100 text-amber-700 border-amber-200',
  [MachineStatus.RENTAL]: 'bg-blue-100 text-blue-700 border-blue-200',
  [MachineStatus.PURCHASED]: 'bg-slate-100 text-slate-700 border-slate-200'
};
