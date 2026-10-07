import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { FormField, FormSection } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import {
  GET_DEPARTMENT_OPTIONS,
  GET_OFFICE_OPTIONS,
} from "../../../company/shared/queries";
import {
  CREATE_WORKER,
  GET_WORKER_FORM_OPTIONS,
  UPDATE_WORKER,
} from "../graphql/queries";
import { WORKER_TYPE_OPTIONS } from "../../format";
import { useHasRole } from "../../useHasRole";

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYSTEM_USER_EMAIL = "system@admin.com";

/**
 * Alta o edición de un trabajador (con `worker` edita). Su nombre y contacto
 * son suyos; si además usa la aplicación, se vincula a su cuenta de usuario.
 */
export function WorkerForm({ worker, onHide, onSaved }) {
  const isEdit = !!worker;
  const hasRole = useHasRole();
  const canLinkAccount = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const [form, setForm] = useState({
    userId: worker?.user?.id ?? null,
    firstName: worker?.tempFirstName ?? "",
    lastName: worker?.tempLastName ?? "",
    phone: worker?.tempPhone ?? "",
    email: worker?.tempEmail ?? "",
    workerType: worker?.workerType ?? "AGENT",
    otherType: worker?.otherType ?? "",
    baseSalary: worker?.baseSalary ?? 0,
    officeId: worker?.office?.id ?? null,
    departmentId: worker?.department?.id ?? null,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: options, loading: loadingOptions } = useQuery(
    GET_WORKER_FORM_OPTIONS,
    { errorPolicy: "all", fetchPolicy: "network-only" },
  );
  const { data: officeData, loading: loadingOffices } =
    useQuery(GET_OFFICE_OPTIONS);
  const { data: departmentData } = useQuery(GET_DEPARTMENT_OPTIONS);
  const [createWorker, createState] = useMutation(CREATE_WORKER);
  const [updateWorker, updateState] = useMutation(UPDATE_WORKER);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const offices = officeData?.offices?.data ?? [];
  const office = offices.find((o) => o.id === form.officeId);
  const departments = (departmentData?.departments?.data ?? []).filter(
    (d) => d.office?.id === form.officeId,
  );
  // Cuentas de personal (no de clientes) de la empresa de la oficina
  const accounts = (options?.users?.data ?? []).filter(
    (u) =>
      u.email !== SYSTEM_USER_EMAIL &&
      !u.role?.includes("USER") &&
      (!office?.business?.id ||
        !u.business?.id ||
        u.business.id === office.business.id),
  );
  const account = accounts.find((u) => u.id === form.userId);

  const phone = form.phone.replace(/[\s-]/g, "");
  const errors = {
    firstName:
      form.firstName.trim() || form.userId
        ? null
        : "Escribe el nombre o vincula su cuenta",
    phone:
      !phone || PHONE_PATTERN.test(phone)
        ? null
        : "Con el código del país, por ejemplo +5351234567",
    email:
      !form.email.trim() || EMAIL_PATTERN.test(form.email.trim())
        ? null
        : "El correo no es válido",
    workerType: form.workerType ? null : "Elige el tipo",
    officeId: form.officeId ? null : "Elige la oficina",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    // `null` vacía un dato al editar
    const values = {
      tempFirstName: form.firstName.trim() || null,
      tempLastName: form.lastName.trim() || null,
      tempPhone: phone || null,
      tempEmail: form.email.trim() || null,
      workerType: form.workerType,
      otherType:
        form.workerType === "OTHER" ? form.otherType.trim() || null : null,
      baseSalary: form.baseSalary ?? 0,
      businessId: office?.business?.id,
      officeId: form.officeId,
      departmentId: form.departmentId,
      ...(canLinkAccount && { userId: form.userId }),
    };
    try {
      if (isEdit) {
        await updateWorker({
          variables: { worker: { id: worker.id, ...values } },
        });
      } else {
        await createWorker({ variables: { worker: values } });
      }
      onSaved(
        {
          name:
            [values.tempFirstName, values.tempLastName]
              .filter(Boolean)
              .join(" ") ||
            [account?.name, account?.lastName].filter(Boolean).join(" "),
        },
        { created: !isEdit },
      );
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar trabajador" : "Nuevo trabajador"}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      closable={!saving}
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

        <FormSection title="Persona">
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Nombre"
                htmlFor="worker-first-name"
                required={!form.userId}
                error={shown("firstName")}
              >
                <InputText
                  id="worker-first-name"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  invalid={!!shown("firstName")}
                  maxLength={50}
                  autoFocus
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField label="Apellidos" htmlFor="worker-last-name">
                <InputText
                  id="worker-last-name"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  maxLength={50}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Teléfono"
                htmlFor="worker-phone"
                hint="Con el código del país"
                error={shown("phone")}
              >
                <InputText
                  id="worker-phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+5351234567"
                  inputMode="tel"
                  invalid={!!shown("phone")}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField
                label="Correo"
                htmlFor="worker-email"
                error={shown("email")}
              >
                <InputText
                  id="worker-email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  inputMode="email"
                  invalid={!!shown("email")}
                  maxLength={100}
                />
              </FormField>
            </div>
            {canLinkAccount && (
              <div className="col-12">
                <FormField
                  label="Cuenta en la aplicación"
                  htmlFor="worker-account"
                  hint="Si entra a la aplicación, su cuenta de usuario. Las cuentas se crean en Usuarios."
                >
                  <Dropdown
                    inputId="worker-account"
                    value={form.userId}
                    options={accounts.map((u) => ({
                      label: `${[u.name, u.lastName].filter(Boolean).join(" ")} · ${u.email}`,
                      value: u.id,
                    }))}
                    onChange={(e) => set("userId", e.value ?? null)}
                    placeholder="Sin cuenta"
                    emptyMessage="No hay cuentas disponibles"
                    emptyFilterMessage="Ninguna cuenta coincide"
                    loading={loadingOptions}
                    filter
                    showClear
                  />
                </FormField>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Trabajo">
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Tipo de trabajador"
                htmlFor="worker-type"
                required
                error={shown("workerType")}
              >
                <Dropdown
                  inputId="worker-type"
                  value={form.workerType}
                  options={WORKER_TYPE_OPTIONS}
                  onChange={(e) => set("workerType", e.value)}
                  invalid={!!shown("workerType")}
                />
              </FormField>
            </div>
            {form.workerType === "OTHER" && (
              <div className="col-12 md:col-6">
                <FormField label="¿Qué hace?" htmlFor="worker-other-type">
                  <InputText
                    id="worker-other-type"
                    value={form.otherType}
                    onChange={(e) => set("otherType", e.target.value)}
                    maxLength={100}
                  />
                </FormField>
              </div>
            )}
            <div className="col-12 md:col-6">
              <FormField label="Salario base" htmlFor="worker-salary">
                <InputNumber
                  inputId="worker-salary"
                  value={form.baseSalary}
                  onChange={(e) => set("baseSalary", e.value)}
                  min={0}
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  locale="es-ES"
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection title="Dónde trabaja">
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField
                label="Oficina"
                htmlFor="worker-office"
                required
                hint="La tienda donde vende o trabaja"
                error={shown("officeId")}
              >
                <Dropdown
                  inputId="worker-office"
                  value={form.officeId}
                  options={offices.map((o) => ({
                    label: [o.name, o.business?.name]
                      .filter(Boolean)
                      .join(" · "),
                    value: o.id,
                  }))}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      officeId: e.value,
                      departmentId: null,
                    }))
                  }
                  placeholder="Elige la oficina"
                  emptyMessage="No hay oficinas"
                  loading={loadingOffices}
                  invalid={!!shown("officeId")}
                  filter={offices.length > 8}
                />
              </FormField>
            </div>
            <div className="col-12 md:col-6">
              <FormField label="Departamento" htmlFor="worker-department">
                <Dropdown
                  inputId="worker-department"
                  value={form.departmentId}
                  options={departments.map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                  onChange={(e) => set("departmentId", e.value ?? null)}
                  placeholder={
                    form.officeId ? "Sin departamento" : "Elige la oficina"
                  }
                  emptyMessage="Esta oficina no tiene departamentos"
                  disabled={!form.officeId}
                  showClear
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={saving}
          />
          <Button
            type="submit"
            label={isEdit ? "Guardar cambios" : "Guardar trabajador"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
