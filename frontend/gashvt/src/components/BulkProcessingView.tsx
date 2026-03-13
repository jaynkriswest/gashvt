'use client'
import { useState } from 'react';

export default function BulkProcessingView() {
  const [batchId, setBatchId] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Processing</h2>
          <p className="text-slate-400 text-sm">Update status for multiple units in a single batch.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search Batch ID..." 
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            onChange={(e) => setBatchId(e.target.value)}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Load Batch
          </button>
        </div>
      </div>

      {/* Empty State / Grid Placeholder */}
      <div className="bg-[#1e2129] border border-dashed border-slate-800 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-500">
        <p>No batch selected.</p>
        <p className="text-xs">Enter a Batch ID or upload a CSV to begin triage.</p>
      </div>
    </div>
  );
}