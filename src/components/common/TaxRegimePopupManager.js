'use client';

import { useState, useEffect } from 'react';
import TaxRegimeSelectionPopup from './TaxRegimeSelectionPopup';
import taxRegimeService from '@/services/tax-regime.service';

const TaxRegimePopupManager = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the tax regime popup
    const shouldShowPopup = localStorage.getItem('showTaxRegimePopup');
    const savedEmployeeName = localStorage.getItem('taxRegimeEmployeeName');

    if (shouldShowPopup === 'true' && savedEmployeeName) {
      setEmployeeName(savedEmployeeName);
      setShowPopup(true);
      
      // Clear the flag so it doesn't show again on every page load
      localStorage.removeItem('showTaxRegimePopup');
      localStorage.removeItem('taxRegimeEmployeeName');
    }
  }, []);

  const handleTaxRegimeSelect = async (taxRegime) => {
    setIsLoading(true);
    try {
      await taxRegimeService.updateTaxRegime(taxRegime);
      console.log('Tax regime updated successfully:', taxRegime);
    } catch (error) {
      console.error('Failed to update tax regime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  if (!showPopup) {
    return null;
  }

  return (
    <TaxRegimeSelectionPopup
      isOpen={showPopup}
      onClose={handleClose}
      onSelect={handleTaxRegimeSelect}
      employeeName={employeeName}
    />
  );
};

export default TaxRegimePopupManager;
