import React from 'react';
import { useAuth } from '@/lib/auth';

interface TotalWeightDisplayProps {
  items: any[];
}

const TotalWeightDisplay: React.FC<TotalWeightDisplayProps> = ({ items }) => {
  const { user } = useAuth();
  
  // Formula: Total KG = Total Qty * (Shop Area * (GSM / 1000))
  // Area is stored in user.company.area (as per requirements)
  // GSM is stored in product (we will add this)
  
  const area = (user as any)?.company?.area || 1; // Fallback to 1 if not set
  
  const totalWeight = items.reduce((acc, item) => {
    const gsm = item.product?.gsm || 0;
    const qty = item.quantity || 0;
    const itemWeight = qty * (area * (gsm / 1000));
    return acc + itemWeight;
  }, 0);

  if (totalWeight === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1 mt-2 px-1">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span>Total Estimated Weight:</span>
        <span className="text-sm font-bold text-primary">{totalWeight.toFixed(3)} KG</span>
      </div>
      <div className="text-[10px] text-muted-foreground/60 italic">
        *Based on Area ({area} sq.m) and Product GSM
      </div>
    </div>
  );
};

export default TotalWeightDisplay;
