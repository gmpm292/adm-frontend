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
    // Campos temporales
    tempFirstName: "",
    tempLastName: "",
    tempEmail: "",
    tempPhone: "",
    tempRole: [],
  });

  const [userCreationMode, setUserCreationMode] = useState(false);
  const toast = useRef(null);
  const [updateWorker, { loading: updating }] = useMutation(UPDATE_WORKER);

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

  const { loading, error } = useQuery(GET_WORKER_BY_ID, {
    variables: { id: workerId },
    skip: !workerId,
    onCompleted: (data) => {
      if (data?.worker) {
        const worker = data.worker;
        const hasTempData =
          worker.tempFirstName || worker.tempLastName || worker.tempEmail;

        setFormData({
          userId: worker.user?.id || null,
          workerType: worker.workerType,
          baseSalary: worker.baseSalary || 0,
          businessId: worker.business?.id || null,
          officeId: worker.office?.id || null,
          departmentId: worker.department?.id || null,
          teamId: worker.team?.id || null,
          paymentRuleId: worker.paymentRule?.id || null,
          tempFirstName: worker.tempFirstName || "",
          tempLastName: worker.tempLastName || "",
          tempEmail: worker.tempEmail || "",
          tempPhone: worker.tempPhone || "",
          tempRole: worker.tempRole || [],
        });

        // Activar modo creación si hay datos temporales y no hay usuario
        setUserCreationMode(hasTempData && !worker.user);
      }
    },
  });

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

      const updateWorkerInput = {
        id: workerId,
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

      await updateWorker({
        variables: {
          updateWorkerInput,
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
        disabled={updating}
      />
      <Button
        label={updating ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={updating}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Trabajador"
        visible={visible}
        style={{ width: "60vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar trabajador</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field mb-3">
              <div className="flex align-items-center">
                <label className="mr-2">Modo creación de usuario</label>
                <input
                  type="checkbox"
                  checked={userCreationMode}
                  onChange={toggleUserCreationMode}
                  className="mr-2"
                  disabled={formData.userId !== null} // Deshabilitar si ya tiene usuario
                />
                <small className="text-gray-600">
                  {userCreationMode
                    ? "Editando usuario temporal"
                    : "Usar usuario existente"}
                  {formData.userId && " (Ya tiene usuario asignado)"}
                </small>
              </div>
            </div>

            {!userCreationMode ? (
              <div className="p-field mb-4">
                <label htmlFor="user">Usuario Existente*</label>
                <UserSelector
                  onUserSelected={handleUserChange}
                  selectedUserId={formData.userId}
                  disabled={formData.userId !== null} // Deshabilitar si ya tiene usuario
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
                        disabled={updating}
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
                        disabled={updating}
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
                        disabled={updating}
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
                        disabled={updating}
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
                    disabled={updating}
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
                disabled={updating}
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
                disabled={updating}
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
              disabled={updating}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};
