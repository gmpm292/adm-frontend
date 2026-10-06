import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField } from "../../../components/ui";
import { getErrorMessage } from "../../../utils/errors";
import { useAuthContext } from "../../auth/components/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Alta o edición (con `row`) de una empresa, oficina, departamento o equipo.
 * Los campos salen de la descripción del nivel (`unit`, ver `units.js`).
 */
export function CompanyUnitForm({ unit, row, onHide, onSaved }) {
  const { user } = useAuthContext();
  const isEdit = !!row;
  const { parent } = unit;
  const isSuper = user?.role?.includes("SUPER");

  const [values, setValues] = useState(() =>
    Object.fromEntries(
      unit.fields.map((field) => [
        field.key,
        row?.[field.key] ?? field.initial ?? (field.type === "select" ? null : ""),
      ]),
    ),
  );
  const [parentId, setParentId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // El nivel superior solo se elige al crear. Quien pertenece a una empresa
  // crea sus oficinas en ella sin preguntar.
  const ownParentId = parent?.own?.(user) ?? null;
  const choosesParent =
    !!parent && !isEdit && (!parent.superOnly || isSuper || !ownParentId);
  const { data: parentData, loading: loadingParents } = useQuery(
    parent?.query ?? unit.query,
    { skip: !choosesParent, fetchPolicy: "cache-and-network" },
  );
  const parentOptions = (parentData?.[parent?.list]?.data ?? []).map((item) => ({
    label: parent.optionLabel(item),
    value: item.id,
  }));
  const selectedParentId = choosesParent
    ? (parentId ?? (parentOptions.length === 1 ? parentOptions[0].value : null))
    : ownParentId;

  const [create, { loading: creating }] = useMutation(unit.create);
  const [update, { loading: updating }] = useMutation(unit.update);
  const saving = creating || updating;

  const errorOf = (field) => {
    const value = values[field.key];
    const text = typeof value === "string" ? value.trim() : value;
    if (field.required && !text) {
      return field.type === "select" ? "Selecciona una opción" : "Obligatorio";
    }
    if (field.type === "email" && text && !EMAIL_PATTERN.test(text)) {
      return "El correo no es válido";
    }
    return null;
  };
  const parentError =
    parent && !isEdit && !selectedParentId
      ? `Selecciona ${parent.label.toLowerCase()}`
      : null;
  const hasErrors = !!parentError || unit.fields.some((field) => errorOf(field));
  const shown = (error) => (submitted ? error : null);

  const setValue = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSaveError(null);
    if (hasErrors) return;

    // Un texto opcional vacío viaja como `null`: así se borra al editar
    const input = Object.fromEntries(
      unit.fields.map((field) => {
        const value = values[field.key];
        const clean = typeof value === "string" ? value.trim() : value;
        return [field.key, clean === "" ? null : clean];
      }),
    );

    try {
      const { data } = isEdit
        ? await update({ variables: { input: { id: row.id, ...input } } })
        : await create({
            variables: {
              input: parent ? { [parent.key]: selectedParentId, ...input } : input,
            },
          });
      onSaved(Object.values(data)[0], !isEdit);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  const renderControl = (field, id, invalid) => {
    if (field.type === "select") {
      return (
        <Dropdown
          inputId={id}
          value={values[field.key]}
          options={field.options}
          onChange={(e) => setValue(field.key, e.value)}
          placeholder="Selecciona"
          invalid={invalid}
        />
      );
    }
    if (field.type === "textarea") {
      return (
        <InputTextarea
          id={id}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          rows={2}
          autoResize
        />
      );
    }
    return (
      <InputText
        id={id}
        value={values[field.key] ?? ""}
        onChange={(e) => setValue(field.key, e.target.value)}
        invalid={invalid}
        inputMode={field.type === "email" ? "email" : undefined}
        autoFocus={field.key === "name"}
      />
    );
  };

  return (
    <Dialog
      header={isEdit ? `Editar ${unit.singular}` : unit.newLabel}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      closable={!saving}
      modal
    >
      <form onSubmit={handleSubmit} noValidate>
        {saveError && (
          <Message severity="error" text={saveError} className="w-full mb-3" />
        )}

        <div className="formgrid grid">
          {parent && isEdit && (
            <div className="col-12 md:col-6">
              <FormField
                label={parent.label}
                htmlFor="unit-parent"
                hint="No se puede cambiar"
              >
                <InputText
                  id="unit-parent"
                  value={parent.of(row)?.name ?? "—"}
                  disabled
                />
              </FormField>
            </div>
          )}
          {choosesParent && (
            <div className="col-12 md:col-6">
              <FormField
                label={parent.label}
                htmlFor="unit-parent"
                required
                error={shown(parentError)}
              >
                <Dropdown
                  inputId="unit-parent"
                  value={selectedParentId}
                  options={parentOptions}
                  onChange={(e) => setParentId(e.value)}
                  placeholder={`Selecciona ${parent.label.toLowerCase()}`}
                  emptyMessage="No hay ninguno creado todavía"
                  loading={loadingParents}
                  invalid={!!shown(parentError)}
                  filter={parentOptions.length > 8}
                />
              </FormField>
            </div>
          )}

          {unit.fields.map((field) => {
            const id = `unit-${field.key}`;
            const error = shown(errorOf(field));
            return (
              <div
                key={field.key}
                className={field.wide ? "col-12" : "col-12 md:col-6"}
              >
                <FormField
                  label={field.label}
                  htmlFor={id}
                  required={field.required}
                  hint={field.hint}
                  error={error}
                >
                  {renderControl(field, id, !!error)}
                </FormField>
              </div>
            );
          })}
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
            label={isEdit ? "Guardar cambios" : `Crear ${unit.singular}`}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
