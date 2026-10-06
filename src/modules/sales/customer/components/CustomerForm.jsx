import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { CREATE_CUSTOMER, UPDATE_CUSTOMER } from "../graphql/queries";
import { GET_SALE_CATALOG } from "../../integrated-sale/graphql/queries";

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Alta o edición de un cliente (con `customer` edita). Lo usan el listado de
 * clientes y la venta integrada; esta última pasa `office` y el cliente nace
 * en esa tienda sin preguntar.
 */
export function CustomerFormDialog({
  customer,
  office,
  initialName = "",
  onHide,
  onSaved,
}) {
  const isEdit = !!customer;
  const [form, setForm] = useState({
    name: customer?.name ?? initialName,
    lastName: customer?.lastName ?? "",
    ci: customer?.ci ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
  });
  const [officeId, setOfficeId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // La tienda solo se pregunta al crear desde el listado
  const needsOffice = !isEdit && !office;
  // Las tiendas donde el usuario puede vender: la misma lista que la venta
  // integrada, disponible también para quien no administra la empresa.
  const { data: catalogData, loading: loadingOffices } = useQuery(
    GET_SALE_CATALOG,
    { variables: { officeId: null }, skip: !needsOffice },
  );
  const offices = catalogData?.saleCatalog?.offices ?? [];
  const selectedOffice = needsOffice
    ? (offices.find((o) => o.id === officeId) ??
      (offices.length === 1 ? offices[0] : null))
    : null;

  const [createCustomer, createState] = useMutation(CREATE_CUSTOMER);
  const [updateCustomer, updateState] = useMutation(UPDATE_CUSTOMER);
  const loading = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const phone = form.phone.replace(/[\s-]/g, "");
  const errors = {
    name: form.name.trim() ? null : "Escribe el nombre",
    phone:
      !phone || PHONE_PATTERN.test(phone)
        ? null
        : "Con el código del país, por ejemplo +5351234567",
    email:
      !form.email.trim() || EMAIL_PATTERN.test(form.email.trim())
        ? null
        : "El correo no es válido",
    office: needsOffice && !selectedOffice ? "Selecciona la tienda" : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    // `null` borra un dato opcional al editar
    const values = {
      name: form.name.trim(),
      lastName: form.lastName.trim() || null,
      ci: form.ci.trim() || null,
      phone: phone || null,
      email: form.email.trim() || null,
    };

    try {
      if (isEdit) {
        const { data } = await updateCustomer({
          variables: { customer: { id: customer.id, ...values } },
        });
        onSaved(data.updateCustomer);
      } else {
        const { data } = await createCustomer({
          variables: {
            customer: {
              businessId: office?.businessId ?? selectedOffice.businessId,
              officeId: office?.id ?? selectedOffice.id,
              ...values,
            },
          },
        });
        onSaved(data.createCustomer);
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar cliente" : "Nuevo cliente"}
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
      closable={!loading}
      modal
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <Message
            severity="error"
            text={getErrorMessage(error)}
            className="w-full mb-3"
          />
        )}
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField
              label="Nombre"
              htmlFor="customer-name"
              required
              error={shown("name")}
            >
              <InputText
                id="customer-name"
                value={form.name}
                onChange={setField("name")}
                invalid={!!shown("name")}
                maxLength={100}
                autoFocus
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Apellidos" htmlFor="customer-last-name">
              <InputText
                id="customer-last-name"
                value={form.lastName}
                onChange={setField("lastName")}
                maxLength={100}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Teléfono"
              htmlFor="customer-phone"
              hint="Con el código del país"
              error={shown("phone")}
            >
              <InputText
                id="customer-phone"
                value={form.phone}
                onChange={setField("phone")}
                invalid={!!shown("phone")}
                placeholder="+5351234567"
                inputMode="tel"
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Carné de identidad" htmlFor="customer-ci">
              <InputText
                id="customer-ci"
                value={form.ci}
                onChange={setField("ci")}
                maxLength={20}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Correo"
              htmlFor="customer-email"
              error={shown("email")}
            >
              <InputText
                id="customer-email"
                value={form.email}
                onChange={setField("email")}
                invalid={!!shown("email")}
                maxLength={100}
                inputMode="email"
              />
            </FormField>
          </div>
          {needsOffice && offices.length !== 1 && (
            <div className="col-12">
              <FormField
                label="Tienda"
                htmlFor="customer-office"
                required
                error={shown("office")}
              >
                <Dropdown
                  inputId="customer-office"
                  value={selectedOffice?.id ?? null}
                  options={offices.map((o) => ({
                    label: [o.name, o.businessName]
                      .filter(Boolean)
                      .join(" · "),
                    value: o.id,
                  }))}
                  onChange={(e) => setOfficeId(e.value)}
                  placeholder="Selecciona la tienda"
                  emptyMessage="No hay tiendas disponibles"
                  loading={loadingOffices}
                  invalid={!!shown("office")}
                  filter={offices.length > 8}
                />
              </FormField>
            </div>
          )}
        </div>
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            type="submit"
            label={isEdit ? "Guardar cambios" : "Guardar cliente"}
            loading={loading}
          />
        </div>
      </form>
    </Dialog>
  );
}
