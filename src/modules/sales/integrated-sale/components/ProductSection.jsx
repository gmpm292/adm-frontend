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
import { Tag } from "primereact/tag";
import PermissionGuard from "../../../../components/PermissionGuard";
import { FormField } from "../../../../components/ui";

const PANEL_CLASS = "p-3 border-round border-1 surface-border surface-50";

const DetailItem = ({ label, children }) => (
  <div className="col-12 md:col-6">
    <span className="block text-sm text-color-secondary mb-1">{label}</span>
    <span className="font-medium">{children}</span>
  </div>
);

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
        inputClassName="w-5rem"
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
        text
        rounded
        severity="danger"
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
    <>
      {/* Sección de Productos */}
      <Card title="Productos de la Venta">
        {/* Selector para agregar productos */}
        <div className="formgrid grid align-items-end">
          <div className="col-12 md:col-4">
            <FormField label="Categoría" htmlFor="category">
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
            </FormField>
          </div>

          <div className="col-12 md:col-4">
            <FormField label="Producto" htmlFor="product">
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
            </FormField>
          </div>

          <div className="col-12 md:col-2">
            <FormField label="Cantidad" htmlFor="quantity">
              <InputNumber
                id="quantity"
                value={quantity}
                onValueChange={(e) => setQuantity(e.value)}
                min={1}
                showButtons
                inputClassName="w-full"
              />
            </FormField>
          </div>

          <div className="col-12 md:col-2 mb-4">
            <Button
              label="Agregar"
              icon="pi pi-plus"
              onClick={handleAddProduct}
              disabled={!canAddProduct}
              severity="secondary"
              className="w-full"
            />
          </div>
        </div>

        {/* Tabla de productos agregados */}
        {saleDetails.length > 0 ? (
          <>
            <DataTable value={saleDetails} size="small">
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
                className="w-6rem"
              ></Column>
            </DataTable>

            {/* Total */}
            <div
              className={`${PANEL_CLASS} mt-3 flex justify-content-between align-items-center`}
            >
              <h4 className="m-0">Total:</h4>
              <h4 className="m-0 text-primary">
                ${totalAmount.toFixed(2)} {saleDetails[0]?.baseCurrency || ""}
              </h4>
            </div>
          </>
        ) : (
          <p className="text-color-secondary text-center">
            No hay productos agregados
          </p>
        )}
      </Card>

      {/* Sección de Cliente */}
      {customer && (
        <Card title="Cliente" className="mt-3">
          <div className="grid">
            <DetailItem label="Nombre">{customer.fullName}</DetailItem>
            {customer.ci && <DetailItem label="CI">{customer.ci}</DetailItem>}
            {customer.email && (
              <DetailItem label="Email">{customer.email}</DetailItem>
            )}
            {customer.phone && (
              <DetailItem label="Teléfono">{customer.phone}</DetailItem>
            )}
            {customer.existingCustomer && (
              <div className="col-12">
                <Tag
                  severity="success"
                  icon="pi pi-check-circle"
                  value="Cliente existente"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Sección de Personal, Pago y Mensajería */}
      <Card title="Asignación de Personal y Pago" className="mt-3">
        <div className="formgrid grid">
          {/* Publicistas */}
          <div className="col-12">
            <PublicistSelector
              selectedPublicistIds={selectedPublicists}
              onPublicistsChange={onPublicistsChange}
              label="Publicistas Asociados"
            />
          </div>

          {/* Vendedor - Solo para SUPER, PRINCIPAL, ADMIN */}
          <PermissionGuard requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}>
            <div className="col-12 md:col-6">
              <FormField
                label="Vendedor"
                htmlFor="seller"
                hint={
                  sellers.length === 0
                    ? "Cargando lista de vendedores..."
                    : undefined
                }
              >
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
              </FormField>
            </div>
          </PermissionGuard>

          <PermissionGuard
            requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}
            showFallback
            fallback={
              <div className="col-12 md:col-6">
                <FormField label="Vendedor Actual" htmlFor="currentSeller">
                  <InputText
                    id="currentSeller"
                    value="Usted es el vendedor"
                    disabled
                  />
                </FormField>
              </div>
            }
          />

          {/* Método de Pago */}
          <div className="col-12 md:col-6">
            <FormField label="Método de Pago" htmlFor="paymentMethod" required>
              <Dropdown
                id="paymentMethod"
                value={paymentMethod}
                options={paymentMethods}
                onChange={(e) => onPaymentMethodChange(e.value)}
                optionLabel="label"
                placeholder="Seleccione método de pago"
                required
              />
            </FormField>
          </div>

          {/* Sección de Mensajería */}
          <div className="col-12">
            <div className={PANEL_CLASS}>
              <div className="flex align-items-center">
                <Checkbox
                  inputId="hasDelivery"
                  checked={hasDelivery || false}
                  onChange={(e) => onHasDeliveryChange(e.checked)}
                />
                <label htmlFor="hasDelivery" className="ml-2 font-semibold">
                  ¿Incluye servicio de mensajería?
                </label>
              </div>

              {hasDelivery && (
                <div className="formgrid grid mt-3 pt-3 border-top-1 surface-border">
                  <div className="col-12 md:col-6">
                    <FormField
                      label="Mensajero"
                      htmlFor="deliveryWorker"
                      hint={
                        deliveryWorkers.length === 0
                          ? "Cargando lista de mensajeros..."
                          : undefined
                      }
                    >
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
                    </FormField>
                  </div>

                  <div className="col-12">
                    <FormField
                      label="Notas de Mensajería"
                      htmlFor="deliveryNotes"
                    >
                      <InputTextarea
                        id="deliveryNotes"
                        value={deliveryNotes || ""}
                        onChange={(e) => onDeliveryNotesChange(e.target.value)}
                        rows={3}
                        placeholder="Instrucciones especiales, dirección de entrega, horario preferido, etc."
                      />
                    </FormField>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Botones de navegación */}
      <div className="flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
        <Button
          label="Volver a Clientes"
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          onClick={onBackToCustomer}
        />

        <div className="flex flex-wrap align-items-center gap-3">
          {isEditingExistingSale && (
            <Tag
              severity="info"
              icon="pi pi-pencil"
              value={`Editando venta #${createdSaleId}`}
            />
          )}
          <Button
            label={hasDelivery ? "Finalizar" : "Continuar al Pago"}
            icon={hasDelivery ? "pi pi-check" : "pi pi-arrow-right"}
            severity={hasDelivery ? "success" : undefined}
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
    </>
  );
};
