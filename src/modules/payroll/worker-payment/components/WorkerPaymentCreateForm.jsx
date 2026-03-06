import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_WORKER_PAYMENT } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { PaymentBreakdownEditor } from "./PaymentBreakdownEditor";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { GET_WORKERS } from "../../worker/graphql/queries";
import { GET_PAYROLL_PERIODS } from "../../payroll-period/graphql/queries";

const paymentMethods = [
  { label: "Efectivo", value: "CASH" },
  { label: "Transferencia Bancaria", value: "BANK_TRANSFER" },
  { label: "Cheque", value: "CHECK" },
  { label: "Pago Móvil", value: "MOBILE_PAYMENT" },
  { label: "Otro", value: "OTHER" },
];

const paymentTypes = [
  { label: "Salario", value: "SALARY" },
  { label: "Comisión", value: "COMMISSION" },
  { label: "Bono", value: "BONUS" },
  { label: "Otro", value: "OTHER" },
];

export const WorkerPaymentCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    workerId: null,
    payrollPeriodId: null,
    amount: 0,
    currency: "USD",
    exchangeRate: 1,
    paymentMethod: null,
    paymentType: null,
    notes: "",
    breakdown: {
      baseSalary: 0,
      commissions: 0,
      bonuses: 0,
      deductions: 0,
    },
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });
  const toast = useRef(null);
  const [createWorkerPayment] = useMutation(CREATE_WORKER_PAYMENT);

  const { data: workersData } = useQuery(GET_WORKERS, {
    variables: { options: { take: 1000 } },
  });

  const { data: periodsData } = useQuery(GET_PAYROLL_PERIODS, {
    variables: { options: { take: 1000 } },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleBreakdownChange = (breakdown) => {
    setFormData((prev) => ({
      ...prev,
      breakdown,
      amount: calculateTotalAmount(breakdown),
    }));
  };

  const calculateTotalAmount = (breakdown) => {
    return (
      (breakdown.baseSalary || 0) +
      (breakdown.commissions || 0) +
      (breakdown.bonuses || 0) -
      (breakdown.deductions || 0)
    );
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.workerId ||
        !formData.payrollPeriodId ||
        !formData.paymentMethod ||
        !formData.paymentType
      ) {
        throw new Error(
          "Trabajador, período, método y tipo de pago son campos requeridos",
        );
      }

      if (formData.amount <= 0) {
        throw new Error("El monto debe ser mayor que cero");
      }

      await createWorkerPayment({
        variables: {
          createWorkerPaymentInput: {
            ...formData,
            amount: Number(formData.amount),
            exchangeRate: Number(formData.exchangeRate),
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Pago registrado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        workerId: null,
        payrollPeriodId: null,
        amount: 0,
        currency: "USD",
        exchangeRate: 1,
        paymentMethod: null,
        paymentType: null,
        notes: "",
        breakdown: {
          baseSalary: 0,
          commissions: 0,
          bonuses: 0,
          deductions: 0,
        },
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
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

  const workerOptions =
    workersData?.workers?.data?.map((worker) => ({
      label: `${worker?.user?.name ?? ""} ${worker?.user?.lastName ?? ""}`,
      value: worker.id,
    })) || [];

  const periodOptions =
    periodsData?.payrollPeriods?.data?.map((period) => ({
      label: period.name,
      value: period.id,
    })) || [];

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Registrar"
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
        header="Registrar Nuevo Pago"
        visible={visible}
        style={{ width: "70vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-grid">
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="workerId">Trabajador*</label>
                <Dropdown
                  id="workerId"
                  value={formData.workerId}
                  options={workerOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, workerId: e.value }))
                  }
                  optionLabel="label"
                  placeholder="Seleccione un trabajador"
                  required
                  filter
                />
              </div>
            </div>
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="payrollPeriodId">Período de Nómina*</label>
                <Dropdown
                  id="payrollPeriodId"
                  value={formData.payrollPeriodId}
                  options={periodOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payrollPeriodId: e.value,
                    }))
                  }
                  optionLabel="label"
                  placeholder="Seleccione un período"
                  required
                  filter
                />
              </div>
            </div>
          </div>

          <div className="p-grid">
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="paymentMethod">Método de Pago*</label>
                <Dropdown
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  options={paymentMethods}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: e.value }))
                  }
                  optionLabel="label"
                  placeholder="Seleccione"
                  required
                />
              </div>
            </div>
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="paymentType">Tipo de Pago*</label>
                <Dropdown
                  id="paymentType"
                  value={formData.paymentType}
                  options={paymentTypes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, paymentType: e.value }))
                  }
                  optionLabel="label"
                  placeholder="Seleccione"
                  required
                />
              </div>
            </div>
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="currency">Moneda*</label>
                <InputText
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-grid">
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="amount">Monto Total*</label>
                <InputNumber
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onValueChange={handleNumberChange}
                  mode="currency"
                  currency={formData.currency}
                  locale="en-US"
                  disabled
                />
              </div>
            </div>
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="exchangeRate">Tasa de Cambio</label>
                <InputNumber
                  id="exchangeRate"
                  name="exchangeRate"
                  value={formData.exchangeRate}
                  onValueChange={handleNumberChange}
                  mode="decimal"
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>

          <div className="p-field">
            <label>Desglose del Pago</label>
            <PaymentBreakdownEditor
              breakdown={formData.breakdown}
              onChange={handleBreakdownChange}
              currency={formData.currency}
            />
          </div>

          <div className="p-field">
            <label htmlFor="notes">Notas</label>
            <InputText
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <SecurityEntitySelector
            onSelectionChange={handleSecurityEntitiesChange}
          />
        </div>
      </Dialog>
    </>
  );
};
