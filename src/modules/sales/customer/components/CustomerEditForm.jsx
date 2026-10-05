import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CUSTOMER_BY_ID, UPDATE_CUSTOMER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { FormField } from "../../../../components/ui";

export const CustomerEditForm = ({ customerId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER);

  const { loading, error } = useQuery(GET_CUSTOMER_BY_ID, {
    variables: { id: customerId },
    skip: !customerId,
    onCompleted: (data) => {
      if (data?.customer) {
        setFormData({
          name: data.customer.name || "",
          email: data.customer.email || "",
          phone: data.customer.phone || "",
          businessId: data.customer.business?.id || null,
          officeId: data.customer.office?.id || null,
          departmentId: data.customer.department?.id || null,
          teamId: data.customer.team?.id || null
        });
      }
    }
  });

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({
      ...prev,
      ...entities
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        throw new Error("El nombre es requerido");
      }

      await updateCustomer({
        variables: {
          customer: {
            id: customerId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            businessId: formData.businessId,
            officeId: formData.officeId,
            departmentId: formData.departmentId,
            teamId: formData.teamId
          }
        }
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Cliente actualizado correctamente",
        life: 3000
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000
      });
    }
  };

  const footer = (
    <>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} severity="secondary" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Cliente"
        visible={visible}
        className="w-full md:w-8 xl:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p className="text-color-secondary">Cargando...</p>
        ) : error ? (
          <Message severity="error" className="w-full" text="Error al cargar cliente" />
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
              <FormField label="Email" htmlFor="email">
                <InputText
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Teléfono" htmlFor="phone">
                <InputText
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div className="col-12">
              <SecurityEntitySelector
                initialValues={{
                  businessId: formData.businessId,
                  officeId: formData.officeId,
                  departmentId: formData.departmentId,
                  teamId: formData.teamId
                }}
                onSelectionChange={handleSecurityEntitiesChange}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};