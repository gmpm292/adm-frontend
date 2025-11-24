import React from "react";
import { Routes, Route } from "react-router-dom";
import { CustomerListPage } from "./customer/pages/CustomerListPage";
import { SaleListPage } from "./sale/pages/SaleListPage";
import { SaleDetailListPage } from "./sale-detail/pages/SaleDetailListPage";
import { IntegratedSalePage } from "./integrated-sale/pages/IntegratedSalePage";

export function SalesModule() {
  return (
    <Routes>
      <Route path="customers" element={<CustomerListPage />} />
      <Route path="sales" element={<SaleListPage />} />
      <Route path="sale-details" element={<SaleDetailListPage />} />
      <Route path="sales/:saleId/details" element={<SaleDetailListPage />} />
      <Route path="integrated-sale" element={<IntegratedSalePage />} />
    </Routes>
  );
}
