import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sector, DssWeights, SectorStatus } from './types';
import { INITIAL_SECTORS } from './data/initialSectors';
import { processDssQueue, computeDeminingStats } from './services/dssEngine';

declare const L: any;

export const PRESETS: Record<string, { name: string; weights: DssWeights }> = {
  balanced: {
    name: 'Збалансований (Базовий)',
    weights: { infrastructure: 0.30, population: 0.25, economic: 0.20, severity: 0.15, incidents: 0.10 }
  },
  civilSafety: {
    name: 'Цивільна безпека (Населення та діти)',
    weights: { infrastructure: 0.20, population: 0.45, economic: 0.10, severity: 0.10, incidents: 0.15 }
  },
  criticalInfra: {
    name: 'Відновлення інфраструктури (Світло/Вода)',
    weights: { infrastructure: 0.50, population: 0.20, economic: 0.15, severity: 0.10, incidents: 0.05 }
  },
  agriculture: {
    name: 'Агробезпека (Посівна та продовольство)',
    weights: { infrastructure: 0.15, population: 0.15, economic: 0.50, severity: 0.10, incidents: 0.10 }
  }
};

export const App: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [weights, setWeights] = useState<DssWeights>(PRESETS.balanced.weights);
  const [activeTab, setActiveTab] = useState<'dss' | 'queue' | 'add' | 'analytics'>('dss');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('balanced');

  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const rankedSectors = useMemo(() => {
    return processDssQueue(sectors, weights);
  }, [sectors, weights]);

  const filteredSectors = useMemo(() => {
    return rankedSectors.filter(sec => {
      const matchRegion = filterRegion === 'all' || sec.region === filterRegion;
      const matchStatus = filterStatus === 'all' || sec.status === filterStatus;
      const matchSearch = sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sec.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchStatus && matchSearch;
    });
  }, [rankedSectors, filterRegion, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return computeDeminingStats(sectors);
  }, [sectors]);

  // Leaflet ініціалізація
  useEffect(() => {
    if (typeof L === 'undefined') return;

    if (!mapInstanceRef.current) {
      const map = L.map('map', {
        center: [49.0, 32.5],
        zoom: 6,
        zoomControl: true,
      });

      const baseTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Topo'
      });

      const baseStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Street'
      });

      const baseSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Satellite'
      });

      baseSatellite.addTo(map);

      L.control.layers({
        "🛰️ Супутниковий знімок": baseSatellite,
        "🗺️ Топографічна карта (Esri Topo)": baseTopo,
        "🛣️ Карта доріг (Esri Streets)": baseStreet
      }, null, { position: 'topright' }).addTo(map);

      layersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const group = layersGroupRef.current;
    if (group) {
      group.clearLayers();

      filteredSectors.forEach(sec => {
        let color = '#ef4444';
        if (sec.status === 'cleared') color = '#10b981';
        else if (sec.status === 'in_progress') color = '#f59e0b';
        else if ((sec.calculatedPriority || 0) < 50) color = '#3b82f6';

        if (sec.polygon && sec.polygon.length > 0) {
          const polygon = L.polygon(sec.polygon, {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: sec.status === 'cleared' ? 0.2 : 0.45
          });

          polygon.bindTooltip(`
            <div style="font-size:12px;">
              <strong>${sec.code}: ${sec.name}</strong><br/>
              <span>Пріоритет СППР: <b>${sec.calculatedPriority || 0} / 100</b> (Ранг: #${sec.rank || '-'})</span><br/>
              <span>Статус: ${sec.status}</span>
            </div>
          `, { sticky: true });

          polygon.on('click', () => {
            setSelectedSector(sec);
          });

          group.addLayer(polygon);
        }

        const marker = L.circleMarker(sec.coordinates, {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1
        });
        marker.on('click', () => setSelectedSector(sec));
        group.addLayer(marker);
      });
    }
  }, [filteredSectors]);

  const handleUpdateStatus = (id: string, newStatus: SectorStatus) => {
    setSectors(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, lastUpdated: '2026-11-12' } : s));
    if (selectedSector && selectedSector.id === id) {
      setSelectedSector(prev => prev ? ({ ...prev, status: newStatus }) : null);
    }
    showToast(`Статус оновлено: ${newStatus}`);
  };

  const applyPreset = (key: string) => {
    setActivePreset(key);
    setWeights(PRESETS[key].weights);
    showToast(`Застосовано стратегічний пресет: "${PRESETS[key].name}"`);
  };

  const exportCSV = () => {
    const headers = ["Ранг", "Код", "Назва", "Область", "Район", "Площа (га)", "Статус", "Пріоритет СППР"];
    const rows = rankedSectors.map(s => [
      s.rank || '-',
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.region}"`,
      `"${s.district}"`,
      s.areaHectares,
      s.status,
      s.calculatedPriority || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operatyvnyi_plan_demining_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Оперативний план розмінування експортовано у CSV!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg font-bold">🧭 КОНТУР-СППР</div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">
                Платформа пріоритизації гуманітарного розмінування «Контур-СППР»
                <span className="ml-2 text-xs bg-emerald-800 px-2 py-0.5 rounded-full border border-emerald-600">v2.4</span>
              </h1>
              <p className="text-xs text-slate-400">КНУ імені Тараса Шевченка | Кафедра ПСТ | Лисий О. О., гр. ІПЗ-32 (5)</p>
            </div>
          </div>
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow"
          >
            Експорт CSV
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="bg-white border-b py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500 font-medium">Загальна площа загроз</p>
            <p className="text-lg font-bold text-slate-900">{stats.totalAreaHectares} га</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500 font-medium">Очищено територій</p>
            <p className="text-lg font-bold text-emerald-600">{stats.clearedAreaHectares} га ({stats.clearingProgressPercent}%)</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500 font-medium">В активній роботі</p>
            <p className="text-lg font-bold text-amber-600">{stats.inProgressAreaHectares} га</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500 font-medium">Критичних секторів</p>
            <p className="text-lg font-bold text-rose-600">{stats.criticalSectorsCount}</p>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="bg-white p-3 rounded-xl border flex justify-between items-center text-sm font-semibold">
            <span>Інтерактивна ГІС-карта відкритих секторів</span>
            <span className="text-xs text-slate-400">{filteredSectors.length} секторів</span>
          </div>
          <div className="flex-1 min-h-[500px] bg-slate-100 rounded-xl overflow-hidden border relative">
            <div id="map"></div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="bg-white p-1.5 rounded-xl border flex space-x-1">
            <button
              onClick={() => setActiveTab('dss')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${activeTab === 'dss' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              СППР Ваги
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${activeTab === 'queue' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Черга завдань
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Аналітика
            </button>
          </div>

          {activeTab === 'dss' && (
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <h3 className="text-sm font-bold">Налаштування вагових коефіцієнтів СППР</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(PRESETS).map(key => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`text-xs p-2 rounded-lg border text-left ${activePreset === key ? 'bg-blue-50 border-blue-500 font-bold text-blue-700' : 'border-slate-200'}`}
                  >
                    {PRESETS[key].name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="bg-white p-4 rounded-xl border space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              <h3 className="text-sm font-bold">Оперативна черга розмінування (WLC)</h3>
              {filteredSectors.map(s => (
                <div key={s.id} className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold">#{s.rank || '-'}</span> <b>{s.code}</b>: {s.name}
                    <div className="text-slate-500">{s.region} обл. | Площа: {s.areaHectares} га</div>
                  </div>
                  <div className="font-bold text-blue-600">P = {s.calculatedPriority || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
