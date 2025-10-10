import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useMutation } from "@apollo/client";
import { CREATE_WORKER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { UserSelector } from "../../../user/components/UserSelector";
import { MultiSelect } from "primereact/multiselect";

export const WorkerCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: null,
    workerType: null,
    baseSalary: 0,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
    paymentRuleId: null,
    // Campos temporales
    tempFirstName: "",
    tempLastName: "",
    tempEmail: "",
    tempPhone: "",
    tempRole: [],
  });

  const [userCreationMode, setUserCreationMode] = useState(true);
  const toast = useRef(null);
  const [createWorker, { loading }] = useMutation(CREATE_WORKER);

  const workerTypes = [
    { label: "Publicista", value: "PUBLICIST" },
    { label: "Económico", value: "ECONOMIC" },
    { label: "Trabajador de servicios", value: "SERVICE" },
    { label: "Mensajero", value: "COURIER" },
    { label: "Técnico/Especialista", value: "TECHNICIAN" },
    { label: "Personal operativo", value: "OPERATIVE" },
    { label: "Director", value: "PRINCIPAL" },
    { label: "Administrativo", value: "ADMINISTRATIVE" },
    { label: "Gerente", value: "MANAGER" },
    { label: "Supervisor", value: "SUPERVISOR" },
    { label: "Agente", value: "AGENT" },
    { label: "Otro", value: "OTHER" },
  ];

  const roles = [
    { label: "Principal", value: "PRINCIPAL" },
    { label: "Administrador", value: "ADMIN" },
    { label: "Gerente", value: "MANAGER" },
    { label: "Supervisor", value: "SUPERVISOR" },
    { label: "Agente", value: "AGENT" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, baseSalary: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => {
      const newData = { ...prev, ...entities };
      // Evitar actualizar si no hay cambios
      if (JSON.stringify(newData) === JSON.stringify(prev)) {
        return prev;
      }
      return newData;
    });
  };

  const handleUserChange = (user) => {
    setFormData((prev) => ({ ...prev, userId: user?.id || null }));
  };

  const handleTempRoleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: [value] }));
  };

  const toggleUserCreationMode = () => {
    setUserCreationMode(!userCreationMode);
    if (!userCreationMode) {
      // Al activar modo creación, limpiar userId
      setFormData((prev) => ({ ...prev, userId: null }));
    } else {
      // Al desactivar modo creación, limpiar campos temporales
      setFormData((prev) => ({
        ...prev,
        tempFirstName: "",
        tempLastName: "",
        tempEmail: "",
        tempPhone: "",
        tempRole: [],
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.workerType || !formData.tempRole) {
        throw new Error("Tipo de trabajador y rol son campos requeridos");
      }

      if (!userCreationMode && !formData.userId) {
        throw new Error("Usuario es requerido cuando no se crea uno nuevo");
      }

      if (
        userCreationMode &&
        (!formData.tempFirstName ||
          !formData.tempLastName ||
          !formData.tempEmail)
      ) {
        throw new Error(
          "Nombre, apellido y email son requeridos para crear usuario"
        );
      }

      const createWorkerInput = {
        ...formData,
        baseSalary: Number(formData.baseSalary),
        // Si no está en modo creación, limpiar campos temporales
        tempFirstName: userCreationMode ? formData.tempFirstName : null,
        tempLastName: userCreationMode ? formData.tempLastName : null,
        tempEmail: userCreationMode ? formData.tempEmail : null,
        tempPhone: userCreationMode ? formData.tempPhone : null,
        tempRole: userCreationMode ? formData.tempRole : [],
        userId: userCreationMode ? null : formData.userId,
      };

      await createWorker({
        variables: {
          createWorkerInput,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Trabajador creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        userId: null,
        workerType: null,
        baseSalary: 0,
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
        paymentRuleId: null,
        tempFirstName: "",
        tempLastName: "",
        tempEmail: "",
        tempPhone: "",
        tempRole: [],
      });
      setUserCreationMode(true);
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
        disabled={loading}
      />
      <Button
        label={loading ? "Creando..." : "Crear"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nuevo Trabajador"
        visible={visible}
        style={{ width: "60vw" }}
        footer={footer}
        onHide={onHide}
        closable={!loading}
        onShow={() => {
          setFormData({
            userId: null,
            workerType: null,
            baseSalary: 0,
            businessId: null,
            officeId: null,
            departmentId: null,
            teamId: null,
            paymentRuleId: null,
            tempFirstName: "",
            tempLastName: "",
            tempEmail: "",
            tempPhone: "",
            tempRole: [],
          });
          setUserCreationMode(true);
        }}
      >
        <div className="p-fluid">
          <div className="p-field mb-3">
            <div className="flex align-items-center">
              <label className="mr-2">Crear nuevo usuario</label>
              <input
                type="checkbox"
                checked={userCreationMode}
                onChange={toggleUserCreationMode}
                className="mr-2"
              />
              <small className="text-gray-600">
                {userCreationMode
                  ? "Creando usuario nuevo"
                  : "Usar usuario existente"}
              </small>
            </div>
          </div>

          {!userCreationMode ? (
            <div className="p-field mb-4">
              <label htmlFor="user">Usuario Existente*</label>
              <UserSelector
                onUserSelected={handleUserChange}
                selectedUserId={formData.userId}
              />
            </div>
          ) : (
            <>
              <div className="grid">
                <div className="col-6">
                  <div className="p-field mb-3">
                    <label htmlFor="tempFirstName">Nombre*</label>
                    <InputText
                      id="tempFirstName"
                      value={formData.tempFirstName}
                      onChange={handleChange}
                      name="tempFirstName"
                      placeholder="Nombre del usuario"
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-field mb-3">
                    <label htmlFor="tempLastName">Apellido*</label>
                    <InputText
                      id="tempLastName"
                      value={formData.tempLastName}
                      onChange={handleChange}
                      name="tempLastName"
                      placeholder="Apellido del usuario"
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="col-6">
                  <div className="p-field mb-3">
                    <label htmlFor="tempEmail">Email*</label>
                    <InputText
                      id="tempEmail"
                      value={formData.tempEmail}
                      onChange={handleChange}
                      name="tempEmail"
                      placeholder="email@ejemplo.com"
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-field mb-3">
                    <label htmlFor="tempPhone">Teléfono</label>
                    <InputText
                      id="tempPhone"
                      value={formData.tempPhone}
                      onChange={handleChange}
                      name="tempPhone"
                      placeholder="+1234567890"
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="p-field mb-4">
                <label htmlFor="tempRole">Rol del Usuario*</label>
                <Dropdown
                  id="tempRole"
                  value={formData.tempRole[0] || null}
                  options={roles}
                  onChange={handleTempRoleChange}
                  optionLabel="label"
                  name="tempRole"
                  placeholder="Seleccione un rol"
                  className="w-full"
                  disabled={loading}
                  required
                />
              </div>
            </>
          )}

          <div className="p-field mb-4">
            <label htmlFor="workerType">Tipo de Trabajador*</label>
            <Dropdown
              id="workerType"
              value={formData.workerType}
              options={workerTypes}
              onChange={handleChange}
              optionLabel="label"
              name="workerType"
              placeholder="Seleccione un tipo"
              className="w-full"
              disabled={loading}
              required
            />
          </div>

          <div className="p-field mb-4">
            <label htmlFor="baseSalary">Salario Base</label>
            <InputNumber
              id="baseSalary"
              value={formData.baseSalary}
              onValueChange={handleNumberChange}
              mode="currency"
              currency="USD"
              locale="en-US"
              min={0}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="p-field">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              disabled={loading}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
