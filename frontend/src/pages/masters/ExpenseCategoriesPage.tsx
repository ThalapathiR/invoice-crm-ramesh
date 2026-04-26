import React from 'react';
import MasterPageTemplate from '@/components/masters/MasterPageTemplate';
import { ExpenseCategoryService } from '@/service/expense-category.service';

const ExpenseCategoriesPage: React.FC = () => {
  return (
    <MasterPageTemplate 
      title="Expense Categories"
      description="Categorize your business expenses for better profit analysis"
      itemName="Category"
      service={ExpenseCategoryService}
      deleteMethodName="Delete"
    />
  );
};

export default ExpenseCategoriesPage;
