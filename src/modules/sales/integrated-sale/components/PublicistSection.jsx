import React from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";

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
  // NUEVOS PROPS PARA MENSAJERÍA
  hasDelivery,
  onHasDeliveryChange,
  deliveryWorkerId,
  onDeliveryWorkerChange,
  deliveryNotes,
  onDeliveryNotesChange,
  deliveryWorkers = [], // Lista de workers disponibles como mensajeros
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

            {/* NUEVA SECCIÓN: MENSAJERÍA */}
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

                {/* Campos condicionales que se muestran solo si hasDelivery es true */}
                {hasDelivery && (
                  <div className="delivery-fields mt-3">
                    <div className="p-grid">
                      {/* Selector de Mensajero */}
                      <div className="p-col-12 md:p-col-6">
                        <div className="p-field">
                          <label htmlFor="deliveryWorker">Mensajero</label>
                          <Dropdown
                            id="deliveryWorker"
                            value={deliveryWorkerId}
                            options={deliveryWorkers}
                            onChange={(e) => onDeliveryWorkerChange(e.value)}
                            optionLabel="label"
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
                          <small className="text-secondary block mt-1">
                            Seleccione el trabajador que realizará la entrega
                          </small>
                        </div>
                      </div>

                      {/* Notas de mensajería */}
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
                          <small className="text-secondary block mt-1">
                            Detalles adicionales para la entrega (opcional)
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* FIN SECCIÓN MENSAJERÍA */}
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
            {hasDelivery && (
              <>
                <br />
                <i className="pi pi-truck mr-2"></i>
                Esta venta incluye servicio de mensajería.
                {deliveryWorkerId && " Mensajero asignado."}
                {!deliveryWorkerId && " Pendiente asignar mensajero."}
              </>
            )}
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
