import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomerListPage } from './customer/pages/CustomerListPage';
import { SaleListPage } from './sale/pages/SaleListPage';
import { SaleDetailListPage } from './sale-detail/pages/SaleDetailListPage';

export function SalesModule() {
  return (
    <Routes>
      <Route path="customers" element={<CustomerListPage />} />
      <Route path="sales" element={<SaleListPage />} />
      <Route path="sales/:saleId/details" element={<SaleDetailListPage />} />
    </Routes>
  );
}