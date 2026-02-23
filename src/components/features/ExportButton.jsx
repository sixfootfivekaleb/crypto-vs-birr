import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiImage, FiFileText, FiPrinter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { Button } from '../common/Button';

/**
 * Export button with dropdown menu
 */
export const ExportButton = ({ chartRef, data, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = useCallback(async () => {
    if (!chartRef?.current) {
      toast.error('No chart to export');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `crypto-vs-birr-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Chart exported as PNG');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export chart');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  }, [chartRef]);

  const handleExportCSV = useCallback(() => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const csvData = data.map((row) => ({
        Date: row.date?.toISOString?.() || row.date,
        'Birr Value': row.birr,
        'Bitcoin Value': row.bitcoin,
        'Ethereum Value': row.ethereum,
        'USDT Value': row.tether,
        'USD Value': row.usd,
        'Exchange Rate': row.exchangeRate,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `crypto-vs-birr-${Date.now()}.csv`;
      link.click();

      toast.success('Data exported as CSV');
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsOpen(false);
    }
  }, [data]);

  const handlePrint = useCallback(() => {
    window.print();
    setIsOpen(false);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        icon={FiDownload}
        loading={isExporting}
      >
        Export
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 w-48 py-2 rounded-xl bg-white dark:bg-dark-800 shadow-lg border border-dark-200 dark:border-dark-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={handleExportImage}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
              >
                <FiImage className="w-4 h-4" />
                Export as PNG
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
              >
                <FiFileText className="w-4 h-4" />
                Export as CSV
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700"
              >
                <FiPrinter className="w-4 h-4" />
                Print
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

ExportButton.propTypes = {
  chartRef: PropTypes.object,
  data: PropTypes.array,
  className: PropTypes.string,
};

export default ExportButton;
