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
        header="Editar Período de Nómina"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar período de nómina</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="name">Nombre*</label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="p-grid">
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="startDate">Fecha Inicio*</label>
                  <Calendar
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleDateChange("startDate", e.value)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    required
                  />
                </div>
              </div>
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="endDate">Fecha Fin*</label>
                  <Calendar
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => handleDateChange("endDate", e.value)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-field">
              <label htmlFor="description">Descripción</label>
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="p-field">
              <label htmlFor="isClosed">Estado</label>
              <div className="flex align-items-center">
                <InputSwitch
                  id="isClosed"
                  checked={formData.isClosed}
                  onChange={handleStatusChange}
                />
                <span className="ml-2">
                  {formData.isClosed ? "Cerrado" : "Abierto"}
                </span>
              </div>
            </div>

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
        )}
      </Dialog>
    </>
  );
};
