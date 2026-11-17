export type ContaminationType = 'mines' | 'cluster' | 'uxo' | 'mixed';
export type SectorStatus = 'pending' | 'in_progress' | 'cleared' | 'verified';
export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Sector {
  id: string;
  code: string;
  name: string;
  region: string;
  district: string;
  areaHectares: number;
  contaminationType: ContaminationType;
  threatLevel: ThreatLevel;
  status: SectorStatus;
  
  // Критерії СППР (оцінка 1 - 10)
  infrastructureCrit: number;     // c1: Критичність інфраструктури (лікарні, ЛЕП, школи)
  populationDensity: number;      // c2: Щільність населення прилеглих територій
  economicValue: number;          // c3: Економічна цінність (с/г угіддя, логістичні шляхи)
  contaminationSeverity: number;  // c4: Щільність та небезпека ВНП
  incidentHistory: number;        // c5: Історія інцидентів та жертв серед цивільних
  
  coordinates: [number, number];  // Центроїд сектору [lat, lng]
  polygon: [number, number][];    // Географічний полігон меж сектору
  
  assignedTeam?: string;          // Закріплений саперний розрахунок (ДСНС / ЗСУ / NGO)
  calculatedPriority?: number;    // Обчислений СППР індекс пріоритету (0..100)
  rank?: number;                  // Позиція в оперативній черзі розмінування
  lastUpdated: string;
  notes?: string;
}

export interface DssWeights {
  infrastructure: number; // w1
  population: number;     // w2
  economic: number;       // w3
  severity: number;       // w4
  incidents: number;      // w5
}

export interface FilterState {
  region: string;
  status: string;
  threatLevel: string;
  searchQuery: string;
  minPriority: number;
}

export interface DeminingStats {
  totalSectors: number;
  totalAreaHectares: number;
  clearedAreaHectares: number;
  inProgressAreaHectares: number;
  pendingAreaHectares: number;
  criticalSectorsCount: number;
  clearingProgressPercent: number;
}
