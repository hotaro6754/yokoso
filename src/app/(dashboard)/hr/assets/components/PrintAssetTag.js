"use client";

import { useRef, useEffect, useState } from "react";
import { Printer, X } from "lucide-react";

export default function PrintAssetTag({ asset, isOpen, onClose }) {
  const printRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (asset?.serialNumber) {
      // Generate QR code using a free API service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(asset.serialNumber)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const serialNumber = asset.serialNumber || "N/A";
    const assetName = asset.name || "Asset";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Tag - ${serialNumber}</title>
          <style>
            @media print {
              @page {
                size: 3in 2in;
                margin: 0.2in;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 10px;
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .tag-container {
              border: 2px solid #000;
              padding: 15px;
              text-align: center;
              width: 2.5in;
              min-height: 1.5in;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .asset-name {
              font-size: 11px;
              margin-bottom: 5px;
              word-wrap: break-word;
            }
            .serial-number {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
              letter-spacing: 1px;
            }
            .qr-code {
              margin-top: 5px;
            }
            .qr-code img {
              width: 80px;
              height: 80px;
            }
          </style>
        </head>
        <body>
          <div class="tag-container">
            <div class="company-name">ZODECK</div>
            <div class="asset-name">${assetName}</div>
            <div class="serial-number">${serialNumber}</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Print Asset Tag
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex justify-center">
          <div
            ref={printRef}
            className="border-2 border-gray-800 p-4 text-center bg-white"
            style={{ width: "250px" }}
          >
            <div className="font-bold text-sm mb-1">ZODECK</div>
            <div className="text-xs mb-2">{asset.name || "Asset"}</div>
            <div className="font-bold text-base mb-2 tracking-wider">
              {asset.serialNumber || "N/A"}
            </div>
            {qrCodeUrl && (
              <div className="flex justify-center mt-2">
                <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition font-semibold"
          >
            <Printer className="h-4 w-4" />
            Print Tag
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
