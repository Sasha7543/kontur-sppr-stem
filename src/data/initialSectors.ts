import { Sector } from '../types';

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'sec-1',
    code: 'SEC-KH-01',
    name: 'Ізюмський лісовий масив (вузол ЛЕП)',
    region: 'Харківська',
    district: 'Ізюмський район',
    areaHectares: 45.2,
    contaminationType: 'mixed',
    threatLevel: 'critical',
    status: 'in_progress',
    infrastructureCrit: 9, // Магістральна лінія електропередач та підстанція
    populationDensity: 6,
    economicValue: 8,
    contaminationSeverity: 9, // Протипіхотні міни ПФМ-1 ("пелюстки"), розтяжки
    incidentHistory: 8,
    coordinates: [49.2084, 37.2798],
    polygon: [
      [49.215, 37.270],
      [49.218, 37.290],
      [49.205, 37.295],
      [49.202, 37.275]
    ],
    assignedTeam: 'Розрахунок ДСНС № 3 (Харків)',
    lastUpdated: '2026-11-10',
    notes: 'Виявлено значну кількість мін ПФМ-1С та касетних боєприпасів 9Н210. Пріоритет для відновлення живлення громади.'
  },
  {
    id: 'sec-2',
    code: 'SEC-KY-02',
    name: 'Макарівський агросектор (Озимі культури)',
    region: 'Київська',
    district: 'Бучанський район',
    areaHectares: 120.0,
    contaminationType: 'mines',
    threatLevel: 'high',
    status: 'pending',
    infrastructureCrit: 5,
    populationDensity: 5,
    economicValue: 10, // Посівні площі, блокування посівної кампанії
    contaminationSeverity: 7, // ТМ-62М, мінні поля
    incidentHistory: 6,
    coordinates: [50.4589, 29.8130],
    polygon: [
      [50.465, 29.800],
      [50.470, 29.830],
      [50.450, 29.835],
      [50.445, 29.805]
    ],
    assignedTeam: 'HALO Trust (Україна)',
    lastUpdated: '2026-11-08',
    notes: 'Сільськогосподарські угіддя під весняну посівну. Зафіксовано підрив трактора у 2024 р.'
  },
  {
    id: 'sec-3',
    code: 'SEC-CH-03',
    name: 'Новоселівка (Околиці школи та водогону)',
    region: 'Чернігівська',
    district: 'Чернігівський район',
    areaHectares: 18.5,
    contaminationType: 'uxo',
    threatLevel: 'critical',
    status: 'pending',
    infrastructureCrit: 10, // Школа, дитячий садок, центральний водогін
    populationDensity: 9,  // Безпосередня близькість до приватного сектора
    economicValue: 6,
    contaminationSeverity: 8, // Артилерійські снаряди, що не розірвалися, мінометні міни
    incidentHistory: 7,
    coordinates: [51.5283, 31.3789],
    polygon: [
      [51.535, 31.370],
      [51.536, 31.390],
      [51.522, 31.392],
      [51.521, 31.372]
    ],
    lastUpdated: '2026-11-11',
    notes: 'Найвищий пріоритет цивільної безпеки. Скарги місцевих жителів на підозрілі предмети на пришкільній ділянці.'
  },
  {
    id: 'sec-4',
    code: 'SEC-KH-04',
    name: 'Посад-Покровське (Транспортна розв\'язка М-14)',
    region: 'Херсонська',
    district: 'Херсонський район',
    areaHectares: 32.0,
    contaminationType: 'mixed',
    threatLevel: 'critical',
    status: 'in_progress',
    infrastructureCrit: 9, // Логістична артерія, міст, оптоволоконний кабель
    populationDensity: 7,
    economicValue: 9,
    contaminationSeverity: 9, // Дистанційне мінування, протитанкові міни
    incidentHistory: 8,
    coordinates: [46.8041, 32.2612],
    polygon: [
      [46.812, 32.250],
      [46.815, 32.275],
      [46.795, 32.278],
      [46.792, 32.252]
    ],
    assignedTeam: 'Зведена саперна група ДСНС "Південь"',
    lastUpdated: '2026-11-12',
    notes: 'Роботи з супроводу ремонтно-відновлювальних бригад дорожньої інфраструктури.'
  },
  {
    id: 'sec-5',
    code: 'SEC-MY-05',
    name: 'Снігурівський зрошувальний канал',
    region: 'Миколаївська',
    district: 'Баштанський район',
    areaHectares: 64.0,
    contaminationType: 'cluster',
    threatLevel: 'high',
    status: 'pending',
    infrastructureCrit: 8, // Меліоративна система півдня
    populationDensity: 4,
    economicValue: 8,
    contaminationSeverity: 8, // Касетні суббоєприпаси реактивної артилерії
    incidentHistory: 5,
    coordinates: [47.0725, 32.7981],
    polygon: [
      [47.080, 32.785],
      [47.085, 32.810],
      [47.065, 32.815],
      [47.060, 32.790]
    ],
    lastUpdated: '2026-11-09',
    notes: 'Канал замулений через наявність боєприпасів, неможливість пуску води для поливу угідь.'
  },
  {
    id: 'sec-6',
    code: 'SEC-KY-06',
    name: 'Бучанський міський парк (Периметр)',
    region: 'Київська',
    district: 'Бучанський район',
    areaHectares: 12.4,
    contaminationType: 'uxo',
    threatLevel: 'low',
    status: 'cleared',
    infrastructureCrit: 7,
    populationDensity: 9,
    economicValue: 4,
    contaminationSeverity: 3,
    incidentHistory: 2,
    coordinates: [50.5510, 30.2225],
    polygon: [
      [50.556, 30.215],
      [50.558, 30.230],
      [50.546, 30.232],
      [50.544, 30.218]
    ],
    assignedTeam: 'Мобільна група розмінування НГУ',
    lastUpdated: '2026-10-25',
    notes: 'Повне очищення завершено. Проведено контроль якості та підписано акт передачі громаді.'
  },
  {
    id: 'sec-7',
    code: 'SEC-SU-07',
    name: 'Тростянецький залізничний перегін',
    region: 'Сумська',
    district: 'Охтирський район',
    areaHectares: 24.8,
    contaminationType: 'mines',
    threatLevel: 'medium',
    status: 'in_progress',
    infrastructureCrit: 9, // Залізниця
    populationDensity: 6,
    economicValue: 7,
    contaminationSeverity: 6,
    incidentHistory: 4,
    coordinates: [50.4764, 34.9682],
    polygon: [
      [50.485, 34.955],
      [50.488, 34.980],
      [50.468, 34.985],
      [50.465, 34.960]
    ],
    assignedTeam: 'Саперний підрозділ Держспецтрансслужби',
    lastUpdated: '2026-11-05',
    notes: 'Очищення смуги відведення залізниці від протитанкових мін та розтяжок.'
  }
];
