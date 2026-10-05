import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useMutation } from "@apollo/client";
import { CREATE_WORKER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { FormField } from "../../../../components/ui";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { UserSelector } from "../../../user/components/UserSelector";

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
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
        disabled={loading}
      />
      <Button
        label={loading ? "Creando..." : "Crear"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nuevo Trabajador"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
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
        <div className="formgrid grid">
          <div className="col-12">
            <div className="flex align-items-center gap-2 mb-4">
              <label>Crear nuevo usuario</label>
              <input
                type="checkbox"
                checked={userCreationMode}
                onChange={toggleUserCreationMode}
              />
              <small className="text-color-secondary">
                {userCreationMode
                  ? "Creando usuario nuevo"
                  : "Usar usuario existente"}
              </small>
            </div>
          </div>

          {!userCreationMode ? (
            <div className="col-12">
              <FormField label="Usuario Existente" htmlFor="user" required>
                <UserSelector
                  onUserSelected={handleUserChange}
                  selectedUserId={formData.userId}
                />
              </FormField>
            </div>
          ) : (
            <>
              <div className="col-12 md:col-6">
                <FormField label="Nombre" htmlFor="tempFirstName" required>
                  <InputText
                    id="tempFirstName"
                    value={formData.tempFirstName}
                    onChange={handleChange}
                    name="tempFirstName"
                    placeholder="Nombre del usuario"
                    disabled={loading}
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-6">
                <FormField label="Apellido" htmlFor="tempLastName" required>
                  <InputText
                    id="tempLastName"
                    value={formData.tempLastName}
                    onChange={handleChange}
                    name="tempLastName"
                    placeholder="Apellido del usuario"
                    disabled={loading}
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-6">
                <FormField label="Email" htmlFor="tempEmail" required>
                  <InputText
                    id="tempEmail"
                    value={formData.tempEmail}
                    onChange={handleChange}
                    name="tempEmail"
                    placeholder="email@ejemplo.com"
                    disabled={loading}
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-6">
                <FormField label="Teléfono" htmlFor="tempPhone">
                  <InputText
                    id="tempPhone"
                    value={formData.tempPhone}
                    onChange={handleChange}
                    name="tempPhone"
                    placeholder="+1234567890"
                    disabled={loading}
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-6">
                <FormField label="Rol del Usuario" htmlFor="tempRole" required>
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
                </FormField>
              </div>
            </>
          )}

          <div className="col-12 md:col-6">
            <FormField label="Tipo de Trabajador" htmlFor="workerType" required>
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
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Salario Base" htmlFor="baseSalary">
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
            </FormField>
          </div>

          <div className="col-12">
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
