import React from "react";
import { Routes, Route } from "react-router-dom";
import { CurrencyListPage } from "./currency/pages/CurrencyListPage";
import { PaymentRuleListPage } from "./payment-rule/pages/PaymentRuleListPage";
import { PayrollPeriodListPage } from "./payroll-period/pages/PayrollPeriodListPage";
import { WorkScheduleListPage } from "./work-schedule/pages/WorkScheduleListPage";
import { WorkerPaymentListPage } from "./worker-payment/pages/WorkerPaymentListPage";
import { WorkerListPage } from "./worker/pages/WorkerListPage";
import { AttendanceListPage } from "./attendance";
import MaterialCostListPage from "./material-cost/pages/MaterialCostListPage";


export function PayrollModule() {
  return (
    <Routes>
      <Route path="attendance" element={<AttendanceListPage />} />
      <Route path="currencies" element={<CurrencyListPage />} />
      <Route path="payment-rules" element={<PaymentRuleListPage />} />
      <Route path="payroll-periods" element={<PayrollPeriodListPage />} />
      <Route path="work-schedules" element={<WorkScheduleListPage />} />
      <Route path="workers" element={<WorkerListPage />} />
      <Route path="worker-payments" element={<WorkerPaymentListPage />} />
      <Route path="material-costs" element={<MaterialCostListPage />} />
    </Routes>
  );
}
