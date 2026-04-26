import React from 'react';
import MasterPageTemplate from '@/components/masters/MasterPageTemplate';
import { SizeService } from '@/service/size.service';

const SizesPage: React.FC = () => {
  return (
    <MasterPageTemplate 
      title="Product Sizes"
      description="Define standard sizes for your products (e.g. S, M, L, XL, 32, 34)"
      itemName="Size"
      service={SizeService}
      deleteMethodName="DeleteSize"
    />
  );
};

export default SizesPage;
