import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import { GET_WORKER_BY_ID, UPDATE_WORKER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { UserSelector } from "../../../user/components/UserSelector";

export const WorkerEditForm = ({ workerId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: null,
    workerType: null,
    baseSalary: 0,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
    paymentRuleId: null,
  });
  const toast = useRef(null);
  const [updateWorker] = useMutation(UPDATE_WORKER);

  const workerTypes = [
    { label: "Agente", value: "AGENT" },
    { label: "Publicista", value: "PUBLICIST" },
    { label: "Económico", value: "ECONOMIC" },
    { label: "Otro", value: "OTHER" },
  ];

  const { loading, error } = useQuery(GET_WORKER_BY_ID, {
    variables: { id: workerId },
    skip: !workerId,
    onCompleted: (data) => {
      if (data?.worker) {
        setFormData({
          userId: data.worker.user?.id || null,
          workerType: data.worker.workerType,
          baseSalary: data.worker.baseSalary || 0,
          businessId: data.worker.business?.id || null,
          officeId: data.worker.office?.id || null,
          departmentId: data.worker.department?.id || null,
          teamId: data.worker.team?.id || null,
          paymentRuleId: data.worker.paymentRule?.id || null,
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleUserChange = (user) => {
    setFormData((prev) => ({ ...prev, userId: user?.id || null }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.userId || !formData.workerType) {
        throw new Error("Usuario y tipo de trabajador son campos requeridos");
      }

      await updateWorker({
        variables: {
          updateWorkerInput: {
            id: workerId,
            ...formData,
            baseSalary: Number(formData.baseSalary),
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Trabajador actualizado correctamente",
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
        header="Editar Trabajador"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar trabajador</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="user">Usuario</label>
              <UserSelector
                onUserSelected={handleUserChange}
                selectedUserId={formData.userId}
                disabled
              />
            </div>

            <div className="p-field">
              <label htmlFor="workerType">Tipo de Trabajador*</label>
              <Dropdown
                id="workerType"
                value={formData.workerType}
                options={workerTypes}
                onChange={handleChange}
                optionLabel="label"
                name="workerType"
                placeholder="Seleccione un tipo"
                required
              />
            </div>

            <div className="p-field">
              <label htmlFor="baseSalary">Salario Base</label>
              <InputNumber
                id="baseSalary"
                name="baseSalary"
                value={formData.baseSalary}
                onValueChange={handleNumberChange}
                mode="currency"
                currency="USD"
                locale="en-US"
                min={0}
              />
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
