'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Papa from 'papaparse';

export default function IngestionPage({ userProfile }: { userProfile: any }) {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'csv'>('scan');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [formData, setFormData] = useState({ 
    Cylinder_ID: '', 
    batch_id: '', 
    Customer_Name: userProfile?.client_link || '',
    Status: 'EMPTY' 
  });

  const supabase = createClient();

  useEffect(() => {
    if (activeTab === 'scan') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        videoConstraints: { facingMode: { ideal: "environment" } }
      }, false);

      scanner.render((text) => {
        setFormData(prev => ({ ...prev, Cylinder_ID: text }));
        setActiveTab('manual'); 
        scanner.clear();
      }, () => {});

      return () => { scanner.clear().catch(() => {}); };
    }
  }, [activeTab]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <header>
        {/* Fixed hardcoded text-white */}
        <h1 className="text-xl md:text-2xl font-bold text-text-main mb-2 uppercase tracking-tighter">Ingestion Hub</h1>
        <p className="text-slate-500 text-[10px] md:text-sm italic uppercase font-mono tracking-widest">Asset Registration</p>
      </header>

      {/* Tabs - Fixed bg-[#0d1117] */}
      <div className="flex bg-brand-panel p-1 rounded-xl border border-brand-border w-fit transition-colors">
        {['scan', 'manual', 'csv'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)} 
            className={`px-6 py-2 text-[10px] font-bold rounded-lg uppercase transition-all ${
              activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Portal - Fixed bg-[#161b22] */}
        <div className="bg-brand-panel p-6 rounded-2xl border border-brand-border shadow-xl transition-colors">
          <h2 className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6">Entry Portal</h2>
          
          {activeTab === 'scan' && (
            <div className="space-y-4">
              {/* Scanner wrapper remains black for camera contrast, but border follows theme */}
              <div id="reader" className="bg-black rounded-xl overflow-hidden aspect-square border border-brand-border"></div>
              <p className="text-[9px] text-center text-slate-500 font-bold uppercase">Scanner Active</p>
            </div>
          )}
          {/* ... manual and csv forms follow same pattern ... */}
        </div>

        {/* Protocol Card - Fixed bg-[#161b22] and text-white */}
        <div className="lg:col-span-2 bg-brand-panel border border-brand-border rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center text-center transition-colors">
          <div className="max-w-md">
            <h3 className="text-text-main font-bold mb-4 text-sm uppercase">Compliance Protocol</h3>
            <ul className="text-slate-500 text-[10px] space-y-3 text-left list-disc list-inside font-mono uppercase">
              <li>Manual entry requires unique <span className="text-blue-500">Cylinder ID</span>.</li>
              <li>CSV headers must match database schema.</li>
              <li>Registration logs are stored for <span className="text-blue-500">Audit Trail</span>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}