import React from "react";
import { PageHeader } from "../../../../components/ui";
import { CategoryTable } from "../components/CategoryTable";

export function CategoryListPage() {
  return (
    <>
      <PageHeader
        title="Categorías"
        subtitle="Agrupa los productos para encontrarlos y analizarlos con facilidad."
      />
      <CategoryTable />
    </>
  );
}
