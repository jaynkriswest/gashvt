'use client'
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createClient } from '@/utils/supabase/client';

// 1. Update the interface to include both props
interface ScannerProps {
  userProfile: any;
  onResult?: (data: any) => void; 
}

export default function Scanner({ userProfile, onResult }: ScannerProps) {
  const supabase = createClient();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    async function onScanSuccess(decodedText: string) {
      console.log("Code Scanned:", decodedText);
      
      // Look up the asset in Supabase
      const { data, error } = await supabase
        .from('assets') 
        .select('*')
        .eq('serial_number', decodedText)
        .single();

      if (data && onResult) {
        // Pass the database info back to the parent page
        onResult(data);
      } else if (error) {
        console.error("Asset not found or DB error:", error.message);
      }
    }

    scanner.render(onScanSuccess, (err) => {
      // Silent error for frame-by-frame scan failures
    });

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onResult, supabase]);

  return (
    <div className="relative w-full overflow-hidden">
      <div id="reader" className="w-full"></div>
    </div>
  );
}