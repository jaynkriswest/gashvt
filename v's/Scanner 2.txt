'use client'
import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { createClient } from '@/utils/supabase/client';

export default function Scanner({ userProfile }: { userProfile: any }) {
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const supabase = createClient();

  // 1. Fetch available cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        // MOBILE OPTIMIZATION: Default to the back camera if detected
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('0')
        );
        setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
      }
    }).catch(err => console.error("Camera fetch error:", err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // 2. Start/Stop Scanner logic
  const startScanning = async () => {
    if (!selectedCameraId) return;
    
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      setIsScanning(true);
      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 20, // Higher FPS for smoother mobile tracking
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Dynamic box size (70% of the smallest dimension)
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.7);
            return { width: size, height: size };
          },
          // FIX: Casting to 'any' allows focusMode to pass Vercel build
          videoConstraints: {
            focusMode: "continuous",
            whiteBalanceMode: "continuous",
          } as any
        },
        async (decodedText) => {
          // Haptic feedback for mobile users
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          await handleLookup(decodedText);
          stopScanning();
        },
        () => {} // Ignore frame-by-frame errors
      );
    } catch (err) {
      console.error("Start error:", err);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error("Stop error", e);
      }
      setIsScanning(false);
    }
  };

  const handleLookup = async (id: string) => {
    // Clean data: remove whitespace and common hidden QR characters
    const cleanId = id.trim().replace(/[\n\r\t]/g, "");
    
    let query = supabase.from('cylinders').select('*').eq('Cylinder_ID', cleanId);
    
    if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
      query = query.eq('Customer_Name', userProfile.client_link);
    }
    
    const { data } = await query.single();
    if (data) {
      setScannedResult(data);
    } else {
      // Optional: Add a small toast or error state here if unit isn't found
      console.log("Unit not found in database");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-brand-panel p-6 rounded-3xl border border-brand-border shadow-2xl transition-colors">
        
        {/* CAMERA SELECTION */}
        <div className="mb-6 space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Hardware Source
          </label>
          <div className="flex gap-2">
            <select 
              className="flex-1 bg-brand-dark border border-brand-border text-text-main text-xs p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              disabled={isScanning}
            >
              {cameras.map(camera => (
                <option key={camera.id} value={camera.id}>{camera.label}</option>
              ))}
            </select>
            
            <button 
              onClick={isScanning ? stopScanning : startScanning}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg ${
                isScanning 
                  ? 'bg-red-500 text-white shadow-red-500/20' 
                  : 'bg-blue-600 text-white shadow-blue-500/20'
              }`}
            >
              {isScanning ? 'Stop' : 'Launch'}
            </button>
          </div>
        </div>

        {/* SCANNER VIEWPORT */}
        <div 
          id="reader" 
          className="w-full rounded-2xl border border-brand-border bg-black overflow-hidden aspect-square relative"
        >
          {isScanning && (
            <div className="absolute inset-0 border-2 border-blue-500/30 rounded-2xl pointer-events-none animate-pulse" />
          )}
        </div>
        
        {!isScanning && !scannedResult && (
          <div className="mt-8 text-center p-10 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-slate-500 text-[10px] font-black uppercase">Sensor Offline</p>
            <p className="text-slate-400 text-[9px] mt-1 italic font-mono uppercase">
              Ready for high-speed cylinder verification
            </p>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      {scannedResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Database Match Verified</p>
              <h3 className="text-2xl font-mono font-bold text-text-main mt-1">{scannedResult.Cylinder_ID}</h3>
            </div>
            <button 
              onClick={() => setScannedResult(null)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-600 transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-emerald-500/10">
            <div>
              <p className="text-slate-500 uppercase font-bold text-[9px]">Status</p>
              <p className="text-text-main text-xs font-semibold">{scannedResult.Status || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase font-bold text-[9px]">Owner</p>
              <p className="text-text-main text-xs font-semibold">{scannedResult.owner_company || 'None'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}