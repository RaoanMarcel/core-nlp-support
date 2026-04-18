export interface ReportDimension {
  id: string;
  label: string;
}

export interface ReportMetric {
  id: string;
  label: string;
}

export interface ReportModuleConfig {
  label: string;
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
}

export interface ReportPayload {
  modulo: string;
  dataInicial: string;
  dataFinal: string;
  dimensoes: string[];
  metricas: string[]; 
}