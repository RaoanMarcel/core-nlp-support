import type { IQuote } from '../types'; 

export interface QuoteDetailsProps {
  quote: IQuote;
  onBack: () => void;
  onUpdate: (updatedFields: Partial<IQuote>) => void;
  onDelete?: () => void; 
  onEdit?: (quote: IQuote) => void;
}