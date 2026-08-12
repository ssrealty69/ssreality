'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

export default function AgentTopbar() {
  const [agentName, setAgentName] = useState('Agent');

  useEffect(() => {
    const dataStr = localStorage.getItem('agent_data');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        if (data.name) setAgentName(data.name);
      } catch {}
    }
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-[#C9A227] rounded-full hidden sm:block" />
        <h2 className="text-xl font-extrabold text-[#1A1800] tracking-tight">Agent Dashboard</h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 pl-5 border-l border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-800">{agentName}</span>
            <span className="text-[10px] font-black uppercase text-[#C9A227] tracking-wider">
              Calling Agent
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
