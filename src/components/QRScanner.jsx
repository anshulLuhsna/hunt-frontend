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
    <div className="qr-component-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!isScannerOpen ? (
        <button
          className="camera-icon"
          onClick={toggleScanner}
          style={{ cursor: 'pointer', border: 'none', outline: 'none' }}
        >
          <FaCamera />
        </button>
      ) : (
        <button
          className="close-scanner-button"
          onClick={toggleScanner}
          style={{
            background: '#FF4500',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '10px 20px',
            fontWeight: 'bold',
            marginBottom: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 69, 0, 0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Close Scanner
        </button>
      )}

      <div className="qr-scanner-container" style={{ marginTop: 12, width: '100%' }}>
        {isScannerOpen && (
          <div style={{ position: 'relative', width: '100%', borderRadius: '15px', overflow: 'hidden' }}>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              styles={{
                container: { width: '100%', height: '300px' },
                video: { width: '100%', height: '100%', objectFit: 'cover' }
              }}
            />
            {scanSuccess && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(34, 197, 94, 0.95)',
                color: 'white',
                padding: '30px',
                borderRadius: '16px',
                textAlign: 'center',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                width: '80%',
                backdropFilter: 'blur(5px)'
              }}>
                <FaCheckCircle style={{ fontSize: '3rem', marginBottom: '15px' }} />
                <div style={{ fontWeight: '700', fontSize: '1.4rem', marginBottom: '8px' }}>
                  QR Code Scanned!
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  Verifying location...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScannerComponent;


