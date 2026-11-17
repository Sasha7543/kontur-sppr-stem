import { Sector, DssWeights, DeminingStats } from '../types';

export const DEFAULT_WEIGHTS: DssWeights = {
  infrastructure: 0.30, // 30% - інфраструктура (лікарні, ЛЕП, водогін)
  population: 0.25,     // 25% - безпека цивільного населення
  economic: 0.20,       // 20% - агросектор та логістика
  severity: 0.15,       // 15% - тип мінної загрози
  incidents: 0.10,      // 10% - зафіксовані інциденти
};

/**
 * Нормалізація ваг, щоб їх сума завжди дорівнювала 1.0 (100%)
 */
export function normalizeWeights(weights: DssWeights): DssWeights {
  const sum = weights.infrastructure + weights.population + weights.economic + weights.severity + weights.incidents;
  if (sum === 0) return DEFAULT_WEIGHTS;
  return {
    infrastructure: weights.infrastructure / sum,
    population: weights.population / sum,
    economic: weights.economic / sum,
    severity: weights.severity / sum,
    incidents: weights.incidents / sum,
  };
}

/**
 * Розрахунок інтегрального індексу пріоритету сектору за методом WLC
 * P_i = 100 * sum(w_k * (c_ik / 10))
 */
export function calculateSectorPriority(sector: Sector, normalizedWeights: DssWeights): number {
  if (sector.status === 'cleared' || sector.status === 'verified') {
    return 0; // Очищені сектори не потребують черги
  }

  const normInfra = sector.infrastructureCrit / 10;
  const normPop = sector.populationDensity / 10;
  const normEcon = sector.economicValue / 10;
  const normSev = sector.contaminationSeverity / 10;
  const normInc = sector.incidentHistory / 10;

  const score = (
    normalizedWeights.infrastructure * normInfra +
    normalizedWeights.population * normPop +
    normalizedWeights.economic * normEcon +
    normalizedWeights.severity * normSev +
    normalizedWeights.incidents * normInc
  ) * 100;

  return Math.round(score * 10) / 10;
}

/**
 * Перерахунок пріоритетів та ранжування оперативної черги розмінування
 */
export function processDssQueue(sectors: Sector[], weights: DssWeights): Sector[] {
  const normalized = normalizeWeights(weights);

  // Обчислення пріоритету для кожного сектору
  const computed = sectors.map((sector) => ({
    ...sector,
    calculatedPriority: calculateSectorPriority(sector, normalized),
  }));

  // Сортування: активні сектори за спаданням пріоритету, завершені — в кінець
  computed.sort((a, b) => {
    if (a.status === 'cleared' || a.status === 'verified') return 1;
    if (b.status === 'cleared' || b.status === 'verified') return -1;
    return (b.calculatedPriority || 0) - (a.calculatedPriority || 0);
  });

  // Присвоєння порядкового номера в черзі
  let currentRank = 1;
  return computed.map((sector) => {
    if (sector.status === 'cleared' || sector.status === 'verified') {
      return { ...sector, rank: undefined };
    }
    return { ...sector, rank: currentRank++ };
  });
}

/**
 * Обчислення аналітичних показників та KPI
 */
export function computeDeminingStats(sectors: Sector[]): DeminingStats {
  const totalSectors = sectors.length;
  let totalArea = 0;
  let clearedArea = 0;
  let inProgressArea = 0;
  let pendingArea = 0;
  let criticalCount = 0;

  sectors.forEach((sec) => {
    totalArea += sec.areaHectares;
    if (sec.status === 'cleared' || sec.status === 'verified') {
      clearedArea += sec.areaHectares;
    } else if (sec.status === 'in_progress') {
      inProgressArea += sec.areaHectares;
    } else {
      pendingArea += sec.areaHectares;
    }

    if (sec.threatLevel === 'critical' && sec.status !== 'cleared' && sec.status !== 'verified') {
      criticalCount++;
    }
  });

  const progressPercent = totalArea > 0 ? Math.round((clearedArea / totalArea) * 100) : 0;

  return {
    totalSectors,
    totalAreaHectares: Math.round(totalArea * 10) / 10,
    clearedAreaHectares: Math.round(clearedArea * 10) / 10,
    inProgressAreaHectares: Math.round(inProgressArea * 10) / 10,
    pendingAreaHectares: Math.round(pendingArea * 10) / 10,
    criticalSectorsCount: criticalCount,
    clearingProgressPercent: progressPercent,
  };
}
