import React from "react";
import { Card } from "primereact/card";
import { ProductTable } from "../components/ProductTable";
import "../styles/ProductList.css";

export function ProductListPage() {
  return (
    <div className="product-list-page">
      <Card title="Gestión de Productos">
        <ProductTable />
      </Card>
    </div>
  );
}
