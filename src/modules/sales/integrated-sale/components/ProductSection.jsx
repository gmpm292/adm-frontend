import React, { useState, useEffect, useMemo } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Fieldset } from "primereact/fieldset";
import { useLazyQuery } from "@apollo/client";
import { GET_CATEGORIES, GET_PRODUCTS_BY_CATEGORY } from "../graphql/queries";
import { PublicistSelector } from "../../sale-detail/components/PublicistSelector";
import PermissionGuard from "../../../../components/PermissionGuard";

export const ProductSection = ({
  // Props originales de productos
  onAddProduct,
  saleDetails,
  onRemoveProduct,
  onUpdateQuantity,
  // Props del cliente
  customer,
  // Props de publicistas y vendedor
  selectedPublicists,
  onPublicistsChange,
  selectedSeller,
  onSellerChange,
  paymentMethod,
  onPaymentMethodChange,
  sellers = [],
  currentUserBusinessId,
  currentUserOfficeId,
  isAdministrativeUser,
  // Props de mensajería
  hasDelivery,
  onHasDeliveryChange,
  deliveryWorkerId,
  onDeliveryWorkerChange,
  deliveryNotes,
  onDeliveryNotesChange,
  deliveryWorkers = [],
  // Props de navegación
  onBackToCustomer,
  onContinueToPayment,
  // Props de edición
  isEditingExistingSale,
  createdSaleId,
}) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const paymentMethods = [
    { label: "Efectivo", value: "CASH" },
    { label: "Tarjeta", value: "CARD" },
    { label: "Transferencia", value: "TRANSFER" },
    { label: "Otro", value: "OTHER" },
  ];

  const [getCategories] = useLazyQuery(GET_CATEGORIES, {
    onCompleted: (data) => {
      setCategories(
        data?.categories?.data?.map((cat) => ({
          label: cat.name,
          value: cat.id,
        })) || [],
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
        })) || [],
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
        (p) => p.value === selectedProduct,
      )?.product;

      if (product) {
        const unitPrice = product.basePrice || 0;
        const subtotal = quantity * unitPrice;

        onAddProduct({
          productId: selectedProduct,
          productName: product.name,
          productCode: product.id,
          quantity: quantity,
          unitPrice: unitPrice,
          baseCurrency: product.baseCurrency || "",
          unitOfMeasure: product.unitOfMeasure || "Unidad",
          subtotal: subtotal,
        });

        setSelectedProduct(null);
        setQuantity(1);
      }
    }
  };

  // Calcular total
  const totalAmount =
    saleDetails?.reduce(
      (sum, detail) => sum + detail.quantity * (detail.unitPrice || 0),
      0,
    ) || 0;

  // Templates para la tabla de productos
  const priceBodyTemplate = (rowData) => {
    const unitPrice = rowData.unitPrice || 0;
    return `$${unitPrice.toFixed(2)} ${rowData.baseCurrency || ""}`;
  };

  const quantityBodyTemplate = (rowData, column) => {
    const rowIndex = column.rowIndex;
    return (
      <InputNumber
        value={rowData.quantity}
        onValueChange={(e) => onUpdateQuantity(rowIndex, e.value)}
        min={1}
        showButtons
        size={1}
        inputStyle={{ width: "80px" }}
      />
    );
  };

  const subtotalBodyTemplate = (rowData) => {
    const subtotal = rowData.subtotal || 0;
    return `$${subtotal.toFixed(2)} ${rowData.baseCurrency || ""}`;
  };

  const actionBodyTemplate = (rowData, column) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-text"
        onClick={() => onRemoveProduct(column.rowIndex)}
        tooltip="Eliminar producto"
      />
    );
  };

  const canAddProduct = selectedProduct && quantity > 0;

  // Agrupar deliveryWorkers por workerType
  const groupedDeliveryWorkers = useMemo(() => {
    if (!deliveryWorkers || deliveryWorkers.length === 0) return [];

    const workerTypeTranslations = {
      SERVICE: "Servicio",
      PUBLICIST: "Publicista",
      AGENT: "Agente",
      TECHNICIAN: "Técnico",
      SUPERVISOR: "Supervisor",
      ECONOMIC: "Económico",
      COURIER: "Mensajero",
      OPERATIVE: "Operativo",
      COMMUNITY_MANAGER: "Community Manager",
      PRINCIPAL: "Principal",
      ADMINISTRATIVE: "Administrativo",
      MANAGER: "Gerente",
      OTHER: "Otro",
    };

    // Verificar la estructura del primer elemento para debug
    if (deliveryWorkers.length > 0) {
      console.log("Estructura de deliveryWorkers:", deliveryWorkers[0]);
    }

    // Agrupar por workerType, manejando diferentes estructuras posibles
    const grouped = deliveryWorkers.reduce((acc, worker) => {
      // Intentar obtener workerType de diferentes ubicaciones posibles
      const type =
        worker.workerType ||
        worker.originalData?.workerType ||
        worker.__typename?.replace("Worker", "").toUpperCase() ||
        "Sin Tipo";

      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(worker);
      return acc;
    }, {});

    // Transformar al formato que PrimeReact necesita
    return Object.entries(grouped)
      .map(([workerType, workers]) => ({
        label: workerTypeTranslations[workerType] || workerType,
        value: workerType,
        items: workers,
        workerType: workerType, // Guardamos el tipo para ordenar
      }))
      .sort((a, b) => {
        // COURIER siempre primero
        if (a.workerType === "COURIER") return -1;
        if (b.workerType === "COURIER") return 1;
        // Luego ordenar alfabéticamente por la etiqueta traducida
        return a.label.localeCompare(b.label);
      });
  }, [deliveryWorkers]);

  return (
    <div className="sale-configuration">
      {/* Sección de Productos */}
      <Card title="Productos de la Venta">
        {/* Selector para agregar productos */}
        <div className="p-fluid mb-4">
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
                  filter
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

        {/* Tabla de productos agregados */}
        {saleDetails.length > 0 ? (
          <div className="product-list">
            <DataTable value={saleDetails} className="p-datatable-sm">
              <Column field="productName" header="Producto"></Column>
              <Column field="productCode" header="Código"></Column>
              <Column
                field="quantity"
                header="Cantidad"
                body={quantityBodyTemplate}
              ></Column>
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
              <Column
                body={actionBodyTemplate}
                header="Acciones"
                style={{ width: "80px" }}
              ></Column>
            </DataTable>

            {/* Total */}
            <div
              className="total-section mt-3 p-3 border-round"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="flex justify-content-between align-items-center">
                <h4 className="m-0">Total:</h4>
                <h4 className="m-0 text-primary">
                  ${totalAmount.toFixed(2)} {saleDetails[0]?.baseCurrency || ""}
                </h4>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No hay productos agregados
          </p>
        )}
      </Card>

      {/* Sección de Cliente */}
      {customer && (
        <Card title="Cliente" className="mt-3">
          <div className="customer-summary">
            <p>
              <strong>Nombre:</strong> {customer.fullName}
            </p>
            {customer.ci && (
              <p>
                <strong>CI:</strong> {customer.ci}
              </p>
            )}
            {customer.email && (
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
            )}
            {customer.phone && (
              <p>
                <strong>Teléfono:</strong> {customer.phone}
              </p>
            )}
            {customer.existingCustomer && (
              <span className="text-sm text-green-600">
                <i className="pi pi-check-circle mr-1"></i>
                Cliente existente
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Sección de Personal, Pago y Mensajería */}
      <Card title="Asignación de Personal y Pago" className="mt-3">
        <div className="p-fluid">
          <div className="p-grid">
            {/* Publicistas */}
            <div className="p-col-12">
              <PublicistSelector
                selectedPublicistIds={selectedPublicists}
                onPublicistsChange={onPublicistsChange}
                label="Publicistas Asociados"
              />
            </div>

            {/* Vendedor - Solo para SUPER, PRINCIPAL, ADMIN */}
            <PermissionGuard requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}>
              <div className="p-col-12 md:p-col-6">
                <div className="p-field">
                  <label htmlFor="seller">Vendedor</label>
                  <Dropdown
                    id="seller"
                    value={selectedSeller}
                    options={sellers}
                    onChange={(e) => onSellerChange(e.value)}
                    optionLabel="label"
                    placeholder="Seleccione vendedor"
                    filter
                    disabled={sellers.length === 0}
                  />
                  {sellers.length === 0 && (
                    <small className="text-secondary">
                      Cargando lista de vendedores...
                    </small>
                  )}
                </div>
              </div>
            </PermissionGuard>

            <PermissionGuard
              requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}
              showFallback
              fallback={
                <div className="p-col-12 md:p-col-6">
                  <div className="p-field">
                    <label htmlFor="currentSeller">Vendedor Actual</label>
                    <InputText
                      id="currentSeller"
                      value="Usted es el vendedor"
                      disabled
                    />
                  </div>
                </div>
              }
            />

            {/* Método de Pago */}
            <div className="p-col-12 md:p-col-6">
              <div className="p-field">
                <label htmlFor="paymentMethod">Método de Pago *</label>
                <Dropdown
                  id="paymentMethod"
                  value={paymentMethod}
                  options={paymentMethods}
                  onChange={(e) => onPaymentMethodChange(e.value)}
                  optionLabel="label"
                  placeholder="Seleccione método de pago"
                  required
                />
              </div>
            </div>

            {/* Sección de Mensajería */}
            <div className="p-col-12">
              <div className="delivery-section mt-3 p-3 border-round border-1 surface-border">
                <div className="p-field-checkbox mb-3">
                  <Checkbox
                    inputId="hasDelivery"
                    checked={hasDelivery || false}
                    onChange={(e) => onHasDeliveryChange(e.checked)}
                  />
                  <label htmlFor="hasDelivery" className="ml-2 font-bold">
                    ¿Incluye servicio de mensajería?
                  </label>
                </div>

                {hasDelivery && (
                  <div className="delivery-fields mt-3">
                    <div className="p-grid">
                      <div className="p-col-12 md:p-col-6">
                        <div className="p-field">
                          <label htmlFor="deliveryWorker">Mensajero</label>
                          <Dropdown
                            id="deliveryWorker"
                            value={deliveryWorkerId}
                            options={groupedDeliveryWorkers}
                            onChange={(e) => onDeliveryWorkerChange(e.value)}
                            optionLabel="label"
                            optionGroupLabel="label"
                            optionGroupChildren="items"
                            placeholder="Seleccione mensajero"
                            filter
                            showClear
                            disabled={deliveryWorkers.length === 0}
                          />
                          {deliveryWorkers.length === 0 && (
                            <small className="text-secondary">
                              Cargando lista de mensajeros...
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="p-col-12">
                        <div className="p-field">
                          <label htmlFor="deliveryNotes">
                            Notas de Mensajería
                          </label>
                          <InputTextarea
                            id="deliveryNotes"
                            value={deliveryNotes || ""}
                            onChange={(e) =>
                              onDeliveryNotesChange(e.target.value)
                            }
                            rows={3}
                            placeholder="Instrucciones especiales, dirección de entrega, horario preferido, etc."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Botones de navegación */}
      <div className="navigation-buttons mt-4">
        <div className="flex justify-content-between align-items-center">
          <Button
            label="Volver a Clientes"
            icon="pi pi-arrow-left"
            className="p-button-text"
            onClick={onBackToCustomer}
          />

          <div className="flex align-items-center gap-2">
            {isEditingExistingSale && (
              <span className="text-blue-600 mr-3">
                <i className="pi pi-pencil mr-1"></i>
                Editando venta #{createdSaleId}
              </span>
            )}
            <Button
              label={hasDelivery ? "Finalizar" : "Continuar al Pago"}
              icon={hasDelivery ? "pi pi-check" : "pi pi-arrow-right"}
              className={hasDelivery ? "p-button-success" : "p-button-primary"}
              onClick={onContinueToPayment}
              disabled={
                saleDetails.length === 0 || (hasDelivery && !deliveryWorkerId)
              }
              tooltip={
                saleDetails.length === 0
                  ? "Agregue al menos un producto"
                  : hasDelivery && !deliveryWorkerId
                    ? "Debe seleccionar un mensajero"
                    : hasDelivery
                      ? "Finalizar y procesar la venta"
                      : "Ir al paso de pago"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
