import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { useMutation, useQuery } from "@apollo/client";
import { GET_SALE_BY_ID, UPDATE_SALE } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { useLazyQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "../../customer/graphql/queries";

const paymentMethods = [
  { label: "Efectivo", value: "CASH" },
  { label: "Tarjeta", value: "CARD" },
  { label: "Transferencia", value: "TRANSFER" },
  { label: "Otro", value: "OTHER" },
];

export const SaleEditForm = ({ saleId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    effectiveDate: new Date(),
    totalAmount: 0,
    paymentMethod: null,
    invoiceNumber: "",
    salesWorkerId: null,
    customerId: null,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const [customers, setCustomers] = useState([]);
  const toast = useRef(null);
  const [updateSale] = useMutation(UPDATE_SALE);
  const [getCustomers] = useLazyQuery(GET_CUSTOMERS, {
    onCompleted: (data) => {
      setCustomers(
        data?.customers?.data?.map((c) => ({
          label: c.name,
          value: c.id,
        })) || []
      );
    },
  });

  const { loading, error } = useQuery(GET_SALE_BY_ID, {
    variables: { id: saleId },
    skip: !saleId,
    onCompleted: (data) => {
      if (data?.sale) {
        setFormData({
          effectiveDate: new Date(data.sale.effectiveDate),
          totalAmount: data.sale.totalAmount,
          paymentMethod: data.sale.paymentMethod,
          invoiceNumber: data.sale.invoiceNumber || "",
          salesWorkerId: data.sale.salesUser?.id || null,
          customerId: data.sale.customer?.id || null,
          businessId: data.sale.business?.id || null,
          officeId: data.sale.office?.id || null,
          departmentId: data.sale.department?.id || null,
          teamId: data.sale.team?.id || null,
        });
      }
    },
  });

  useEffect(() => {
    if (visible) {
      getCustomers();
    }
  }, [visible, getCustomers]);

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      ...entities,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.paymentMethod //||
        //!formData.salesWorkerId ||
        //formData.totalAmount <= 0
      ) {
        throw new Error(
          "Método de pago, vendedor y monto total son requeridos"
        );
      }

      await updateSale({
        variables: {
          sale: {
            id: saleId,
            ...formData,
            effectiveDate: formData.effectiveDate.toISOString(),
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Venta actualizada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Venta"
        visible={visible}
        style={{ width: "70vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar venta</p>
        ) : (
          <div className="p-fluid grid">
            <div className="field col-12 md:col-6">
              <label htmlFor="effectiveDate">Fecha*</label>
              <Calendar
                id="effectiveDate"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, effectiveDate: e.value }))
                }
                dateFormat="dd/mm/yy"
                showIcon
                required
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="paymentMethod">Método de Pago*</label>
              <Dropdown
                id="paymentMethod"
                value={formData.paymentMethod}
                options={paymentMethods}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: e.value }))
                }
                optionLabel="label"
                placeholder="Seleccione método"
                required
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="totalAmount">Monto Total*</label>
              <InputNumber
                id="totalAmount"
                value={formData.totalAmount || 0} // ✅ Valor por defecto
                onValueChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalAmount: e.value || 0,
                  }))
                }
                mode="currency"
                currency="USD"
                locale="en-US"
                required
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="invoiceNumber">Número de Factura</label>
              <InputText
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
              />
            </div>

            <div className="field col-12 md:col-6">
              <label htmlFor="customerId">Cliente</label>
              <Dropdown
                id="customerId"
                value={formData.customerId}
                options={customers}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customerId: e.value }))
                }
                optionLabel="label"
                placeholder="Seleccione cliente"
                filter
              />
            </div>

            <div className="col-12">
              <SecurityEntitySelector
                initialValues={{
                  businessId: formData.businessId,
                  officeId: formData.officeId,
                  departmentId: formData.departmentId,
                  teamId: formData.teamId,
                }}
                showWorkerSelector
                initialWorkerId={formData.salesWorkerId}
                onSelectionChange={handleSecurityEntitiesChange}
                onWorkerSelect={(workerId) =>
                  setFormData((prev) => ({ ...prev, salesWorkerId: workerId }))
                }
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
