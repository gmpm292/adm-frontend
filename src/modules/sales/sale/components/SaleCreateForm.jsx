import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { useMutation } from "@apollo/client";
import { CREATE_SALE } from "../graphql/queries";
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

export const SaleCreateForm = ({ visible, onHide, onSuccess }) => {
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
    details: [],
  });

  const [customers, setCustomers] = useState([]);
  const toast = useRef(null);
  const [createSale] = useMutation(CREATE_SALE);
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
        !formData.paymentMethod ||
        !formData.salesWorkerId ||
        formData.totalAmount <= 0
      ) {
        throw new Error(
          "Método de pago, vendedor y monto total son requeridos"
        );
      }

      await createSale({
        variables: {
          sale: {
            ...formData,
            effectiveDate: formData.effectiveDate.toISOString(),
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Venta creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
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
        details: [],
      });
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
        label="Crear"
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
        header="Crear Nueva Venta"
        visible={visible}
        style={{ width: "70vw" }}
        footer={footer}
        onHide={onHide}
      >
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
              value={formData.totalAmount}
              onValueChange={(e) =>
                setFormData((prev) => ({ ...prev, totalAmount: e.value }))
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
              showWorkerSelector
              onSelectionChange={handleSecurityEntitiesChange}
              onWorkerSelect={(workerId) =>
                setFormData((prev) => ({ ...prev, salesWorkerId: workerId }))
              }
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
