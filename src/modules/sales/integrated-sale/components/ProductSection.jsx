import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useLazyQuery } from "@apollo/client";
import { GET_CATEGORIES, GET_PRODUCTS_BY_CATEGORY } from "../graphql/queries";

export const ProductSection = ({
  onAddProduct,
  saleDetails,
  onRemoveProduct,
}) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [getCategories] = useLazyQuery(GET_CATEGORIES, {
    onCompleted: (data) => {
      setCategories(
        data?.categories?.data?.map((cat) => ({
          label: cat.name,
          value: cat.id,
        })) || []
      );
    },
  });

  const [getProducts] = useLazyQuery(GET_PRODUCTS_BY_CATEGORY, {
    onCompleted: (data) => {
      setProducts(
        data?.productsByCategory?.map((prod) => ({
          label: `${prod.name} - $${prod.basePrice || 0} ${
            prod.baseCurrency || ""
          }`,
          value: prod.id,
          product: prod,
        })) || []
      );
    },
  });

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (selectedCategory) {
      getProducts({ variables: { categoryId: parseInt(selectedCategory) } });
    } else {
      setProducts([]);
    }
  }, [selectedCategory, getProducts]);

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      const product = products.find(
        (p) => p.value === selectedProduct
      )?.product;

      if (product) {
        const unitPrice = product.basePrice || 0;
        const subtotal = quantity * unitPrice;

        onAddProduct({
          productId: selectedProduct,
          productName: product.name,
          productCode: product.id, // Usar ID como código si no hay código
          quantity: quantity,
          unitPrice: unitPrice,
          baseCurrency: product.baseCurrency || "",
          unitOfMeasure: product.unitOfMeasure || "Unidad",
          subtotal: subtotal,
        });

        // Reset form
        setSelectedProduct(null);
        setQuantity(1);
      }
    }
  };

  const priceBodyTemplate = (rowData) => {
    const unitPrice = rowData.unitPrice || 0;
    return `$${unitPrice.toFixed(2)} ${rowData.baseCurrency || ""}`;
  };

  const subtotalBodyTemplate = (rowData) => {
    const subtotal = rowData.subtotal || 0;
    return `$${subtotal.toFixed(2)} ${rowData.baseCurrency || ""}`;
  };

  const actionBodyTemplate = (rowData, rowIndex) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-text"
        onClick={() => onRemoveProduct(rowIndex)}
      />
    );
  };

  const canAddProduct = selectedProduct && quantity > 0;

  return (
    <div className="product-section">
      <Card title="Agregar Productos">
        <div className="p-fluid">
          <div className="p-grid">
            <div className="p-col-12 md:p-col-4">
              <div className="p-field">
                <label htmlFor="category">Categoría</label>
                <Dropdown
                  id="category"
                  value={selectedCategory}
                  options={categories}
                  onChange={(e) => {
                    setSelectedCategory(e.value);
                    setSelectedProduct(null);
                  }}
                  optionLabel="label"
                  placeholder="Seleccione categoría"
                />
              </div>
            </div>

            <div className="p-col-12 md:p-col-4">
              <div className="p-field">
                <label htmlFor="product">Producto</label>
                <Dropdown
                  id="product"
                  value={selectedProduct}
                  options={products}
                  onChange={(e) => setSelectedProduct(e.value)}
                  optionLabel="label"
                  placeholder="Seleccione producto"
                  disabled={!selectedCategory}
                  filter
                />
              </div>
            </div>

            <div className="p-col-12 md:p-col-2">
              <div className="p-field">
                <label htmlFor="quantity">Cantidad</label>
                <InputNumber
                  id="quantity"
                  value={quantity}
                  onValueChange={(e) => setQuantity(e.value)}
                  min={1}
                  showButtons
                />
              </div>
            </div>

            <div className="p-col-12 md:p-col-2">
              <div className="p-field" style={{ paddingTop: "1.8rem" }}>
                <Button
                  label="Agregar"
                  icon="pi pi-plus"
                  onClick={handleAddProduct}
                  disabled={!canAddProduct}
                  className="p-button-success"
                />
              </div>
            </div>
          </div>
        </div>

        {saleDetails.length > 0 && (
          <div className="product-list mt-4">
            <h4>Productos Agregados</h4>
            <DataTable value={saleDetails} className="p-datatable-sm">
              <Column field="productName" header="Producto"></Column>
              <Column field="productCode" header="Código"></Column>
              <Column field="quantity" header="Cantidad"></Column>
              <Column
                field="unitPrice"
                header="Precio Unitario"
                body={priceBodyTemplate}
              ></Column>
              <Column
                field="subtotal"
                header="Subtotal"
                body={subtotalBodyTemplate}
              ></Column>
              <Column body={actionBodyTemplate} header="Acciones"></Column>
            </DataTable>
          </div>
        )}
      </Card>
    </div>
  );
};
