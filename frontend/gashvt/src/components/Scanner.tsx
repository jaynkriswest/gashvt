'use client'

export default function Scanner({ onScan }: { onScan: (id: string) => void }) {
  return (
    <div className="p-10 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900">
      <p className="text-slate-400">Camera Scanner Module Placeholder</p>
      <button 
        onClick={() => onScan('TEST-SCAN-123')}
        className="mt-4 bg-blue-600 px-4 py-2 rounded text-sm"
      >
        Simulate Scan
      </button>
    </div>
  )
}