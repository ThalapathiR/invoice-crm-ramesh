import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scanner.render((decodedText) => {
      onScan(decodedText);
      // Optional: Clear or stop scanner after success if needed
      // scanner.clear(); 
    }, (err) => {
      // Ignore scan errors
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScan]);

  return (
    <div className="rounded-lg overflow-hidden border bg-black aspect-video flex items-center justify-center">
      <div id="reader" style={{ width: '100%' }}></div>
    </div>
  );
};

export default BarcodeScanner;
