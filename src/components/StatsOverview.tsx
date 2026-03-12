
import React from 'react';
import { BarChart3, AlertCircle, Files, Search, PieChart as PieChartIcon, FileSearch } from 'lucide-react';
import { SearchStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface StatsOverviewProps {
  stats: SearchStats;
  isDarkMode: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isDarkMode }) => {
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];
  
  const fileData = Object.entries(stats.filesByType).map(([name, value]) => ({ 
    name: name.toUpperCase(), 
    value 
  }));
  const termData = Object.entries(stats.termsCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard 
        title="ARCHIVOS LEIDOS" 
        value={stats.totalFiles} 
        icon={<Files className="w-4 h-4" />} 
        color="from-indigo-500 to-indigo-600" 
        isDarkMode={isDarkMode}
      />
      <StatCard 
        title="Procesados OCR" 
        value={stats.ocrFilesCount} 
        icon={<FileSearch className="w-4 h-4" />} 
        color="from-blue-500 to-blue-600" 
        isDarkMode={isDarkMode}
      />
      <StatCard 
        title="DETECTADOS (Sin Contexto)" 
        value={stats.totalTermsUnique} 
        icon={<Search className="w-4 h-4" />} 
        color="from-emerald-500 to-emerald-600" 
        isDarkMode={isDarkMode}
        subtitle="Sin computar repeticiones"
      />
      <StatCard 
        title="DETECTADOS (Con Contexto)" 
        value={stats.totalTerms} 
        icon={<Search className="w-4 h-4" />} 
        color="from-teal-500 to-teal-600" 
        isDarkMode={isDarkMode}
        subtitle="Computando repeticiones"
      />
      <StatCard 
        title="Términos Hallados" 
        value={Object.keys(stats.termsCount).length} 
        icon={<BarChart3 className="w-4 h-4" />} 
        color="from-amber-500 to-amber-600" 
        isDarkMode={isDarkMode}
      />
      <StatCard 
        title="Errores" 
        value={stats.errors.length} 
        icon={<AlertCircle className="w-4 h-4" />} 
        color="from-rose-500 to-rose-600" 
        isDarkMode={isDarkMode}
      />

      <div className={`lg:col-span-3 xl:col-span-2 p-8 rounded-3xl border shadow-xl transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-500" /> Distribución por Extensión
          </h3>
        </div>
        <div className={`h-52 rounded-2xl flex items-center justify-center p-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-indigo-50/30'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fileData}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {fileData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  padding: '12px',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
              <Legend 
                verticalAlign="middle" 
                align="right"
                layout="vertical"
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`lg:col-span-3 xl:col-span-4 p-8 rounded-3xl border shadow-xl transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" /> Ocurrencias por Término
          </h3>
        </div>
        <div className={`h-52 rounded-2xl p-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-emerald-50/30'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={termData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="name" 
                fontSize={9} 
                fontWeight="900" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}}
              />
              <YAxis 
                fontSize={9} 
                fontWeight="900" 
                axisLine={false} 
                tickLine={false}
                tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}}
              />
              <Tooltip 
                cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {stats.errors.length > 0 && (
        <div className="lg:col-span-6 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Incidentes Detectados</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.errors.map((err, i) => (
              <div key={i} className={`p-3 rounded-xl border text-[11px] font-bold ${isDarkMode ? 'bg-slate-900/50 border-rose-900/50 text-rose-400' : 'bg-white border-rose-100 text-rose-600'}`}>
                • {err}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isDarkMode: boolean;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, isDarkMode, subtitle }) => (
  <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
    <div className="flex items-start gap-4 relative z-10">
      <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br shadow-lg shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 leading-tight break-words">{title}</div>
        <div className="text-xl font-black tracking-tight tabular-nums leading-none mb-1">{value}</div>
        {subtitle && <div className="text-[8px] font-bold text-slate-400 uppercase leading-tight opacity-80">{subtitle}</div>}
      </div>
    </div>
    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-[0.03] -mr-6 -mt-6 rounded-full`}></div>
  </div>
);

export default StatsOverview;
