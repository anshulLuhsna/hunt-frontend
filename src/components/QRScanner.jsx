import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { FaCamera } from 'react-icons/fa';

const QrScannerComponent = ({ isScannerOpen, setIsScannerOpen, onScanned }) => {
  const toggleScanner = () => {
    setIsScannerOpen(!isScannerOpen);
  };

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      onScanned?.(result);
      toggleScanner();
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
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{ facingMode: 'environment' }}
          />
        )}
      </div>
    </>
  );
};

export default QrScannerComponent;


