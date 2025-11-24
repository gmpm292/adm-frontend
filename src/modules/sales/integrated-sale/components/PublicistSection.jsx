import React from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

import { PublicistSelector } from "../../sale-detail/components/PublicistSelector";
import PermissionGuard from "../../../../components/PermissionGuard";

export const PublicistSection = ({
  selectedPublicists,
  onPublicistsChange,
  selectedSeller,
  onSellerChange,
  paymentMethod,
  onPaymentMethodChange,
  sellers = [],
}) => {
  const paymentMethods = [
    { label: "Efectivo", value: "CASH" },
    { label: "Tarjeta", value: "CARD" },
    { label: "Transferencia", value: "TRANSFER" },
    { label: "Otro", value: "OTHER" },
  ];

  return (
    <div className="publicist-section">
      <Card title="Asignación de Personal y Pago">
        <div className="p-fluid">
          <div className="p-grid">
            <div className="p-col-12">
              <PublicistSelector
                selectedPublicistIds={selectedPublicists}
                onPublicistsChange={onPublicistsChange}
                label="Publicistas Asociados"
              />
            </div>

            {/* Selector de Vendedor - Solo para SUPER, PRINCIPAL, ADMIN */}
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

            {/* Para usuarios que NO son SUPER, PRINCIPAL, ADMIN - mostrar info del vendedor actual */}
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
                    <small className="text-secondary">
                      Los datos de empresa y oficina se tomarán de su perfil
                    </small>
                  </div>
                </div>
              }
            />

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
          </div>
        </div>

        <div
          className="info-section mt-3 p-3 border-round"
          style={{ backgroundColor: "#e9ecef" }}
        >
          <small className="text-secondary">
            <i className="pi pi-info-circle mr-2"></i>
            Los publicistas son opcionales y pueden ser múltiples. El método de
            pago es requerido.
            <PermissionGuard requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}>
              {" "}
              Puede seleccionar un vendedor diferente.
            </PermissionGuard>
            <PermissionGuard
              requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}
              showFallback
            >
              {" "}
              Usted es el vendedor de esta venta.
            </PermissionGuard>
          </small>
        </div>
      </Card>
    </div>
  );
};
