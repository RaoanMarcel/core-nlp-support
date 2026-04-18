import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { reportsService } from '../../../services/reports.service';
import { REPORT_MODULES, ITEMS_PER_PAGE } from '../constants';

const getFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; 
};

const getInitialDates = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  return { start: getFormattedDate(oneMonthAgo), end: getFormattedDate(today) };
};

export function useReports() {
  const [selectedModule, setSelectedModule] = useState<string>('prospects');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  const initialDates = getInitialDates();
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);

  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const moduleConfig = REPORT_MODULES[selectedModule];
  const canGenerate = selectedDimensions.length > 0 && selectedMetrics.length > 0;

  const totalPages = Math.ceil(reportData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = reportData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reseta ao trocar de módulo
  useEffect(() => {
    setSelectedDimensions([]);
    setSelectedMetrics([]);
    setReportData([]);
    setHasPreview(false);
    setCurrentPage(1); 
  }, [selectedModule]);

  const toggleDimension = (id: string) => {
    setSelectedDimensions(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleToggleAllDimensions = () => {
    const allDimIds = moduleConfig.dimensions.map(d => d.id);
    setSelectedDimensions(selectedDimensions.length === allDimIds.length ? [] : allDimIds);
  };

  const handleGerarPrevia = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    
    try {
      const data = await reportsService.buildReport({
        modulo: selectedModule,
        dataInicial: startDate,
        dataFinal: endDate,
        dimensoes: selectedDimensions,
        metricas: selectedMetrics // Nome corrigido para o Backend
      });

      setReportData(data);
      setCurrentPage(1); 
      setHasPreview(true);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('@CRM:token');
        localStorage.removeItem('@CRM:user');
        window.location.reload();
      }
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadXLSX = () => {
    if (reportData.length === 0) return;

    const selectedKeys = [...selectedDimensions, ...selectedMetrics];
    const headerLabels = selectedKeys.map(key => {
      const dim = moduleConfig.dimensions.find(d => d.id === key);
      const met = moduleConfig.metrics.find(m => m.id === key);
      return dim?.label || met?.label || key;
    });

    const dataRows = reportData.map(row => 
      selectedKeys.map(key => row[key] !== null && row[key] !== undefined ? row[key] : '')
    );

    const worksheetData = [headerLabels, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

    const dataBR = startDate.split('-').reverse().join('-');
    XLSX.writeFile(workbook, `exportacao_${selectedModule}_${dataBR}.xlsx`);
  };

  return {
    state: {
      selectedModule, setSelectedModule,
      selectedDimensions,
      selectedMetrics,
      startDate, setStartDate,
      endDate, setEndDate,
      reportData,
      isLoading,
      hasPreview,
      currentPage, setCurrentPage,
      totalPages,
      startIndex,
      paginatedData,
      moduleConfig,
      canGenerate
    },
    actions: {
      toggleDimension,
      toggleMetric,
      handleToggleAllDimensions,
      handleGerarPrevia,
      handleDownloadXLSX
    }
  };
}