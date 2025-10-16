import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import VentaButton from "./VentaButton";
import { TicketPreview, TemplateSelector } from "../tickets/TicketTemplates";
import { usePrint } from "../../hooks/usePrint";
import { formatSaleData } from "../../utils/ticketFormatters";

const VentaForm = () => {
  const [venta, setVenta] = useState({
    productos: [],
    subtotal: 0,
    impuestos: 0,
    total: 0,
    formaPago: "EFECTIVO",
    efectivo: 0,
    cambio: 0,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const toast = useRef();
  const { printerStatus, checkPrinterStatus } = usePrint();

  // Simular datos de venta
  const ventaEjemplo = {
    id: Math.floor(Math.random() * 1000),
    fecha: new Date(),
    cajero: { nombre: "Juan Pérez", id: 1 },
    productos: [
      { id: 1, nombre: "Producto 1", cantidad: 2, precio: 25.5 },
      { id: 2, nombre: "Producto 2", cantidad: 1, precio: 15.0 },
    ],
    subtotal: 66.0,
    impuestos: 10.56,
    total: 76.56,
    formaPago: "EFECTIVO",
    efectivo: 100.0,
    cambio: 23.44,
  };

  const handleVentaSuccess = (ventaGuardada) => {
    toast.current.show({
      severity: "success",
      summary: "Venta Exitosa",
      detail: "Venta completada y ticket impreso correctamente",
      life: 5000,
    });

    // Limpiar formulario o redirigir
    setVenta({
      productos: [],
      subtotal: 0,
      impuestos: 0,
      total: 0,
      formaPago: "EFECTIVO",
      efectivo: 0,
      cambio: 0,
    });
  };

  const handleVentaError = (error) => {
    toast.current.show({
      severity: "error",
      summary: "Error en Venta",
      detail: error.message || "No se pudo completar la venta",
      life: 5000,
    });
  };

  return (
    <div className="grid">
      <Toast ref={toast} />

      <div className="col-12 md:col-8">
        <Card title="Registro de Venta">
          {/* Aquí iría el formulario real de venta */}
          <div className="p-fluid">
            <p>Formulario de venta con productos, cantidades, etc.</p>

            <div className="flex gap-2 mt-4">
              <Button
                label="Vista Previa Ticket"
                icon="pi pi-eye"
                onClick={() => setShowPreview(true)}
                className="p-button-outlined"
              />

              <Button
                label="Verificar Impresora"
                icon="pi pi-print"
                onClick={checkPrinterStatus}
                severity="secondary"
              />
            </div>

            <div className="mt-4">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
            </div>

            <div className="mt-4">
              <VentaButton
                venta={ventaEjemplo}
                template={selectedTemplate}
                onSuccess={handleVentaSuccess}
                onError={handleVentaError}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12 md:col-4">
        <Card title="Estado Impresora">
          <div className="flex align-items-center gap-2 mb-3">
            <i
              className={`pi ${
                printerStatus?.connected
                  ? "pi-check-circle text-green-500"
                  : "pi-times-circle text-red-500"
              }`}
            />
            <span>
              {printerStatus?.connected ? "Conectada" : "Desconectada"}
            </span>
          </div>

          {printerStatus?.error && (
            <div className="text-red-500 text-sm">
              Error: {printerStatus.error}
            </div>
          )}
        </Card>
      </div>

      <Dialog
        header="Vista Previa del Ticket"
        visible={showPreview}
        onHide={() => setShowPreview(false)}
        style={{ width: "350px" }}
      >
        <TicketPreview
          type="VENTA"
          data={formatSaleData(ventaEjemplo)}
          template={selectedTemplate}
        />
      </Dialog>
    </div>
  );
};

export default VentaForm;
