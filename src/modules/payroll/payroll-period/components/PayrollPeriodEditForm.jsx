import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_PAYROLL_PERIOD_BY_ID,
  UPDATE_PAYROLL_PERIOD,
} from "../graphql/queries";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

export const PayrollPeriodEditForm = ({
  payrollPeriodId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
    isClosed: false,
    description: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });
  const toast = useRef(null);
  const [updatePayrollPeriod] = useMutation(UPDATE_PAYROLL_PERIOD);

  const { loading, error } = useQuery(GET_PAYROLL_PERIOD_BY_ID, {
    variables: { id: payrollPeriodId },
    skip: !payrollPeriodId,
    onCompleted: (data) => {
      if (data?.payrollPeriod) {
        setFormData({
          id: data.payrollPeriod.id,
          name: data.payrollPeriod.name,
          startDate: new Date(data.payrollPeriod.startDate),
          endDate: new Date(data.payrollPeriod.endDate),
          isClosed: data.payrollPeriod.isClosed,
          description: data.payrollPeriod.description || "",
          businessId: data.payrollPeriod.business?.id || null,
          officeId: data.payrollPeriod.office?.id || null,
          departmentId: data.payrollPeriod.department?.id || null,
          teamId: data.payrollPeriod.team?.id || null,
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, isClosed: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.startDate || !formData.endDate) {
        throw new Error(
          "Nombre, fecha de inicio y fecha de fin son campos requeridos"
        );
      }

      await updatePayrollPeriod({
        variables: {
          updatePayrollPeriodInput: {
            id: formData.id,
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isClosed: formData.isClosed,
            description: formData.description,
            businessId: formData.businessId,
            officeId: formData.officeId,
            departmentId: formData.departmentId,
            teamId: formData.teamId,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Período de nómina actualizado correctamente",
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
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Período de Nómina"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p className="text-color-secondary">Cargando...</p>
        ) : error ? (
          <Message
            severity="error"
            text="Error al cargar período de nómina"
            className="w-full"
          />
        ) : (
          <div className="formgrid grid">
            <div className="col-12">
              <FormField label="Nombre" htmlFor="name" required>
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Fecha Inicio" htmlFor="startDate" required>
                <Calendar
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange("startDate", e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  required
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField label="Fecha Fin" htmlFor="endDate" required>
                <Calendar
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange("endDate", e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  required
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Descripción" htmlFor="description">
                <InputText
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Estado" htmlFor="isClosed">
                <div className="flex align-items-center gap-2">
                  <InputSwitch
                    id="isClosed"
                    checked={formData.isClosed}
                    onChange={handleStatusChange}
                  />
                  <span>
                    {formData.isClosed ? "Cerrado" : "Abierto"}
                  </span>
                </div>
              </FormField>
            </div>

            <div className="col-12">
              <SecurityEntitySelector
                onSelectionChange={handleSecurityEntitiesChange}
                initialValues={{
                  businessId: formData.businessId,
                  officeId: formData.officeId,
                  departmentId: formData.departmentId,
                  teamId: formData.teamId,
                }}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
