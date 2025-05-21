import React from "react";
import { Routes, Route } from "react-router-dom";
import { BusinessListPage } from "./business/pages/BusinessListPage";
import { OfficeListPage } from "./office/pages/OfficeListPage";
import { DepartmentListPage } from "./department/pages/DepartmentListPage";
import { TeamListPage } from "./team/pages/TeamListPage";

export function CompanyModule() {
  return (
    <Routes>
      <Route path="business" element={<BusinessListPage />} />
      <Route path="office" element={<OfficeListPage />} />
      <Route path="department" element={<DepartmentListPage />} />
      <Route path="team" element={<TeamListPage />} />
    </Routes>
  );
}
