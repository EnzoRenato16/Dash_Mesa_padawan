import { db } from '@/api/base44Client';

import React, { useState, useEffect, useMemo } from 'react';

import { fmtPts, todayMondayISO } from '@/lib/scoring';
import MemberAvatar from '@/components/padawan/MemberAvatar';
import { motion } from 'framer-motion';

const SCOPES = [
  { key: 'geral', label: 'Geral' },
  { key: 'mensal', label: 'Mensal' },
  { key: 'semanal', label: 'Semanal' },
];

export default function RankingTab() {
  const [entries, setEntries] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('geral');

  useEffect(() => {
    async function load() {
      const [e, t] = await Promise.all([
        db.entities.WeeklyEntry.list(),
        db.entities.TeamMember.list()
      ]);
      setEntries(e);
      setTeam(t);
      setLoading(false);
    }
    load();
  }, []);

  const filteredEntries = useMemo(() => {
    if (scope === 'semanal') {
      const week = todayMondayISO();
      return entries.filter(e => e.week_start === week);
    }
    if (scope === 'mensal') {
      const month = new Date().toISOString().slice(0, 7);
      return entries.filter(e => (e.week_start || '').slice(0, 7) === month);
    }
    return entries;
  }, [entries, scope]);

  const arr = useMemo(() => {
    const totals = {};
    team.forEach(m => { totals[m.name] = 0; });
    filteredEntries.forEach(e => {
      totals[e.assessor] = (totals[e.assessor] || 0) + (e.total_points || 0);
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [team, filteredEntries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-[#224030] border-t-[#A8E063] rounded-full animate-spin" />
      </div>
    );
  }

  const photoMap = {};
  team.forEach(m => { photoMap[m.name] = m; });
  const max = Math.max(1, ...arr.map(a => Math.abs(a[1])));

  if (team.length === 0) {
    return (
      <div className="rounded-xl border border-[#224030] bg-[#102A1E] p-10 text-center text-sm text-[#8FA897]">
        Nenhum assessor cadastrado ainda. Vá em <span className="text-[#F3F6F1] font-semibold">Equipe</span> para adicionar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {SCOPES.map(s => (
          <button
            key={s.key}
            onClick={() => setScope(s.key)}
            className={`font-mono text-xs tracking-wide px-4 py-2 rounded-md border transition-colors ${scope === s.key ? 'bg-[#A8E063] text-[#0A1F16] border-[#A8E063]' : 'text-[#8FA897] border-[#224030] hover:text-[#F3F6F1]'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#224030] bg-[#102A1E] p-5 md:p-6">
        {filteredEntries.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#8FA897]">
            {scope === 'semanal'
              ? 'Nenhum lançamento nesta semana ainda.'
              : 'Nenhum lançamento neste mês ainda.'}
          </div>
        ) : (
          <div key={scope} className="flex flex-col gap-0">
            {arr.map(([name, pts], i) => {
              const pct = Math.max(3, Math.min(100, (Math.abs(pts) / max) * 100));
              const isFirst = i === 0 && pts > 0;
              const isNeg = pts < 0;
              return (
                <div
                  key={name}
                  className="grid items-center gap-3 py-3 border-b border-[#1A3225] last:border-b-0"
                  style={{ gridTemplateColumns: '36px 150px 1fr 90px' }}
                >
                  <span className={`font-mono text-sm ${isFirst ? 'text-[#A8E063]' : 'text-[#5C7466]'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MemberAvatar member={photoMap[name]} size={32} />
                    <span className={`text-sm font-semibold truncate ${isFirst ? 'text-[#A8E063]' : 'text-[#F3F6F1]'}`}>
                      {name}
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#1A3225] rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                      className="h-full rounded-sm"
                      style={{
                        background: isNeg
                          ? 'linear-gradient(90deg, #7a3a2e, #F2705C)'
                          : 'linear-gradient(90deg, #4d7a2e, #A8E063)',
                      }}
                    />
                  </div>
                  <span className={`font-mono text-sm font-semibold text-right ${isNeg ? 'text-[#F2705C]' : 'text-[#F3F6F1]'}`}>
                    {fmtPts(pts)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
