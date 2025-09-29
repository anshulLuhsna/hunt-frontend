import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { FaCamera, FaCheckCircle } from 'react-icons/fa';

const QrScannerComponent = ({ isScannerOpen, setIsScannerOpen, onScanned }) => {
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const toggleScanner = () => {
    setIsScannerOpen(!isScannerOpen);
    setScanSuccess(false);
  };

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      console.log('[QRScanner] Detected codes:', detectedCodes);
      console.log('[QRScanner] Raw value:', result);
      
      setScanSuccess(true);
      
      // Add a small delay to show the scan was successful
      setTimeout(() => {
        onScanned?.(result);
        toggleScanner();
      }, 1000);
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner Error:', error);
  };

  return (
    <>
      <FaCamera
        className={`camera-icon ${isScannerOpen ? 'active' : ''}`}
        onClick={toggleScanner}
        style={{ cursor: 'pointer' }}
      />

      <div className="qr-scanner-container" style={{ marginTop: 12 }}>
        {isScannerOpen && (
          <div style={{ position: 'relative' }}>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
            />
            {scanSuccess && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(34, 197, 94, 0.9)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                zIndex: 1000,
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.5)'
              }}>
                <FaCheckCircle style={{ fontSize: '2rem', marginBottom: '10px' }} />
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                  QR Code Scanned!
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                  Processing...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QrScannerComponent;


