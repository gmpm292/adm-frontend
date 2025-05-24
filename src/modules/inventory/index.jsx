import React from "react";
import { Routes, Route } from "react-router-dom";
import { CategoryListPage } from "./category/pages/CategoryListPage";
import { InventoryListPage } from "./inventory/pages/InventoryListPage";
import { InventoryMovementListPage } from "./inventory-movement/pages/InventoryMovementListPage";
import { ProductListPage } from "./product/pages/ProductListPage";

export function InventoryModule() {
  return (
    <Routes>
      <Route path="categories" element={<CategoryListPage />} />
      <Route path="inventories" element={<InventoryListPage />} />
      <Route path="movements" element={<InventoryMovementListPage />} />
      <Route path="products" element={<ProductListPage />} />
    </Routes>
  );
}
