import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { FormField } from "../../../components/ui";
import { getErrorMessage } from "../../../utils/errors";
import { GET_BUSINESS_OPTIONS } from "../../company/shared/queries";
import { TYPE_LABELS } from "../../role-guard/labels";
import { ACCESS_LEVELS, isEnabled } from "../accessLevels";
import {
  CREATE_SCOPED_ACCESS,
  GET_OPERATION_OPTIONS,
  UPDATE_SCOPED_ACCESS,
} from "../graphql/queries";

/** Alta o edición de un nivel de acceso (con `scopedAccess` edita) */
export function ScopedAccessForm({ scopedAccess, businessId, onHide, onSaved }) {
  const isEdit = !!scopedAccess;
  const [form, setForm] = useState({
    businessId: scopedAccess?.business?.id ?? businessId ?? null,
    roleGuardId: scopedAccess?.roleGuard?.id ?? null,
    accessLevels: scopedAccess?.accessLevels ?? [],
    enabled: scopedAccess ? isEnabled(scopedAccess) : true,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: businessData, loading: loadingBusinesses } =
    useQuery(GET_BUSINESS_OPTIONS);
  const { data: operationData, loading: loadingOperations } = useQuery(
    GET_OPERATION_OPTIONS
  );
  const [createScopedAccess, createState] = useMutation(CREATE_SCOPED_ACCESS);
  const [updateScopedAccess, updateState] = useMutation(UPDATE_SCOPED_ACCESS);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const businesses = businessData?.businesses?.data ?? [];
  // `_empty` es un relleno del esquema, no una operación
  const operations = (operationData?.roleGuards?.data ?? [])
    .filter((operation) => operation.queryOrEndPointURL !== "_empty")
    .sort((a, b) => a.queryOrEndPointURL.localeCompare(b.queryOrEndPointURL));

  const errors = {
    businessId: form.businessId ? null : "Elige la empresa",
    roleGuardId: form.roleGuardId ? null : "Elige la operación",
    accessLevels: form.accessLevels.length ? null : "Elige al menos un nivel",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    const values = {
      businessId: form.businessId,
      roleGuardId: form.roleGuardId,
      accessLevels: form.accessLevels,
      entityStatus: form.enabled ? "ENABLED" : "DISABLED",
    };
    try {
      if (isEdit) {
        const { data } = await updateScopedAccess({
          variables: {
            updateScopedAccessInput: { id: scopedAccess.id, ...values },
          },
        });
        onSaved(data.updateScopedAccess, { created: false });
      } else {
        const { data } = await createScopedAccess({
          variables: { createScopedAccessInput: values },
        });
        onSaved(data.createScopedAccess, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar nivel de acceso" : "Nuevo nivel de acceso"}
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
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
        <div className="formgrid grid">
          <div className="col-12">
            <FormField
              label="Empresa"
              htmlFor="scoped-business"
              required
              error={shown("businessId")}
            >
              <Dropdown
                inputId="scoped-business"
                value={form.businessId}
                options={businesses}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => set("businessId", e.value)}
                placeholder="Elige la empresa"
                emptyMessage="No hay empresas"
                loading={loadingBusinesses}
                invalid={!!shown("businessId")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Operación"
              htmlFor="scoped-operation"
              required
              error={shown("roleGuardId")}
            >
              <Dropdown
                inputId="scoped-operation"
                value={form.roleGuardId}
                options={operations.map((operation) => ({
                  value: operation.id,
                  label: `${operation.queryOrEndPointURL} · ${
                    TYPE_LABELS[operation.type] ?? operation.type
                  }`,
                }))}
                onChange={(e) => set("roleGuardId", e.value)}
                placeholder="Busca la operación"
                emptyMessage="No hay operaciones"
                emptyFilterMessage="Ninguna operación coincide"
                loading={loadingOperations}
                filter
                virtualScrollerOptions={{ itemSize: 38 }}
                invalid={!!shown("roleGuardId")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Qué registros ve el usuario"
              htmlFor="scoped-levels"
              required
              hint="Si eliges varios, ve lo que cumpla cualquiera de ellos"
              error={shown("accessLevels")}
            >
              <MultiSelect
                inputId="scoped-levels"
                value={form.accessLevels}
                options={ACCESS_LEVELS}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => set("accessLevels", e.value)}
                placeholder="Elige los niveles"
                display="chip"
                invalid={!!shown("accessLevels")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Activo"
              htmlFor="scoped-enabled"
              hint="Inactivo se guarda pero no se aplica"
            >
              <InputSwitch
                inputId="scoped-enabled"
                checked={form.enabled}
                onChange={(e) => set("enabled", !!e.value)}
              />
            </FormField>
          </div>
        </div>
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
            label={isEdit ? "Guardar cambios" : "Guardar nivel"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
