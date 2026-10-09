import React, { useState } from 'react';
import { Student, MeasurementRecord } from '../types';
import { 
  WHO_HFA_BOYS, 
  WHO_HFA_GIRLS, 
  WHO_BMI_BOYS, 
  WHO_BMI_GIRLS,
  WHOTableEntry
} from '../data/whoReference';
import { Calendar, TrendingUp, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GrowthChartProps {
  student: Student;
}

export function GrowthChart({ student }: GrowthChartProps) {
  const [metric, setMetric] = useState<'HFA' | 'BMI'>('HFA');
  const [hoveredPoint, setHoveredPoint] = useState<MeasurementRecord | null>(null);

  const isBoy = student.gender === 'L';
  const tableData: WHOTableEntry[] = metric === 'HFA' 
    ? (isBoy ? WHO_HFA_BOYS : WHO_HFA_GIRLS)
    : (isBoy ? WHO_BMI_BOYS : WHO_BMI_GIRLS);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 360;
  const padding = { top: 25, right: 35, bottom: 45, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // X axis scale (Age in Months: 60 to 156)
  const minAge = 60;
  const maxAge = 156;

  // Y axis scale
  const minY = metric === 'HFA' ? 90 : 10;
  const maxY = metric === 'HFA' ? 180 : 32;

  const getX = (ageMonths: number) => {
    const clamped = Math.max(minAge, Math.min(maxAge, ageMonths));
    return padding.left + ((clamped - minAge) / (maxAge - minAge)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padding.top + plotHeight - ((clamped - minY) / (maxY - minY)) * plotHeight;
  };

  // Generate SVG path for a specific SD line
  const makeLinePath = (key: keyof WHOTableEntry) => {
    return tableData.map((d, i) => {
      const val = d[key] as number;
      const x = getX(d.ageMonths);
      const y = getY(val);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  // Sort student measurements by date
  const sortedMeasurements = [...student.measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Generate trajectory path of student
  const studentPath = sortedMeasurements.map((m, i) => {
    const val = metric === 'HFA' ? m.heightCm : m.bmi;
    const x = getX(m.ageMonths);
    const y = getY(val);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const latestMeas = sortedMeasurements[sortedMeasurements.length - 1];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      {/* Chart Header & Metric Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Kurva Pertumbuhan WHO Reference 2007 (Anak Usia 5 - 13 Tahun)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Siswa: <strong className="text-slate-800">{student.name}</strong> (Kelas {student.className}) • {isBoy ? 'Laki-laki' : 'Perempuan'} • Tanggal Lahir: {student.birthDate}
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMetric('HFA')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              metric === 'HFA'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tinggi Badan (TB/U - Stunting)
          </button>
          <button
            onClick={() => setMetric('BMI')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              metric === 'BMI'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Indeks Massa Tubuh (IMT/U - Gizi)
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[580px] select-none"
        >
          {/* Grid lines X (Age in years: 5, 6, 7, 8, 9, 10, 11, 12, 13) */}
          {[60, 72, 84, 96, 108, 120, 132, 144, 156].map((age) => {
            const x = getX(age);
            const year = age / 12;
            return (
              <g key={age}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 20}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="system-ui"
                >
                  {year} Th
                </text>
              </g>
            );
          })}

          {/* Grid lines Y */}
          {metric === 'HFA'
            ? [100, 115, 130, 145, 160, 175].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="11"
                      textAnchor="end"
                      fontFamily="system-ui"
                    >
                      {val} cm
                    </text>
                  </g>
                );
              })
            : [12, 16, 20, 24, 28].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="11"
                      textAnchor="end"
                      fontFamily="system-ui"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

          {/* Standard WHO Lines */}
          {/* +3 SD */}
          <path
            d={makeLinePath('sd3pos')}
            fill="none"
            stroke="#9333ea"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* +2 SD */}
          <path
            d={makeLinePath('sd2pos')}
            fill="none"
            stroke="#eab308"
            strokeWidth="1.8"
          />
          {/* Median (0 SD) */}
          <path
            d={makeLinePath('median')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          {/* -2 SD */}
          <path
            d={makeLinePath('sd2neg')}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
          />
          {/* -3 SD */}
          <path
            d={makeLinePath('sd3neg')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Student Trajectory Line */}
          {studentPath && (
            <path
              d={studentPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Student Measurement Points */}
          {sortedMeasurements.map((m, idx) => {
            const val = metric === 'HFA' ? m.heightCm : m.bmi;
            const cx = getX(m.ageMonths);
            const cy = getY(val);
            const isLatest = idx === sortedMeasurements.length - 1;

            return (
              <g
                key={m.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(m)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glow ring for latest */}
                {isLatest && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="9"
                    fill="#38bdf8"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? "6" : "5"}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-[#ef4444]"></span>
            <span>-3 SD ({metric === 'HFA' ? 'Sangat Pendek' : 'Gizi Buruk'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-[#f97316]"></span>
            <span>-2 SD (Batas {metric === 'HFA' ? 'Stunting' : 'Gizi Kurang'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded bg-[#10b981]"></span>
            <span>Median (Standar Rata-rata Normal WHO)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-[#eab308]"></span>
            <span>+2 SD ({metric === 'HFA' ? 'Tinggi' : 'Batas Obesitas'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0284c7] border-2 border-white"></span>
            <span className="font-bold text-sky-800">Pertumbuhan Siswa (IoT SDN 1)</span>
          </div>
        </div>
      </div>

      {/* Tooltip & Current Status Card */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {hoveredPoint ? (
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Titik Pengukuran: {hoveredPoint.date} (Usia {Math.floor(hoveredPoint.ageMonths / 12)} Thn {hoveredPoint.ageMonths % 12} Bln)
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-3">
              <span>TB: <strong>{hoveredPoint.heightCm} cm</strong></span>
              <span>BB: <strong>{hoveredPoint.weightKg} kg</strong></span>
              <span>IMT: <strong>{hoveredPoint.bmi}</strong></span>
              <span className="text-emerald-700">
                Z-Score {metric === 'HFA' ? 'TB/U' : 'IMT/U'}: <strong>{metric === 'HFA' ? hoveredPoint.zScoreHFA : hoveredPoint.zScoreBMI} SD</strong>
              </span>
            </div>
          </div>
        ) : latestMeas ? (
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Hasil Pengukuran Terkini ({latestMeas.date})
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-3">
              <span>TB: {latestMeas.heightCm} cm</span>
              <span>BB: {latestMeas.weightKg} kg</span>
              <span>IMT: {latestMeas.bmi}</span>
              <span className="text-emerald-700">
                Z-Score: {metric === 'HFA' ? latestMeas.zScoreHFA : latestMeas.zScoreBMI} SD
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Belum ada riwayat pengukuran tercatat.</div>
        )}

        {latestMeas && (
          <div className="shrink-0">
            {latestMeas.stuntingStatus === 'Normal' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Pertumbuhan Normal
              </span>
            ) : latestMeas.stuntingStatus === 'Pendek' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Terindikasi Pendek (Stunted)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Sangat Pendek (Perlu Intervensi)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
