import React from 'react';
import MasterPageTemplate from '@/components/masters/MasterPageTemplate';
import { CategoryService } from '@/service/category.service';

const CategoriesPage: React.FC = () => {
  return (
    <MasterPageTemplate 
      title="Product Categories"
      description="Manage your clothing categories for better organization"
      itemName="Category"
      service={CategoryService}
      deleteMethodName="DeleteCategory"
    />
  );
};

export default CategoriesPage;
