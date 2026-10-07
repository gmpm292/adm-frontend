import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField, FormSection } from "../../../components/ui";
import { getErrorMessage } from "../../../utils/errors";
import { UPDATE_CONFIG } from "../graphql/queries";
import { GROUP_LABELS, KEY_HINTS, SECRET_MASK } from "../labels";

/** Cómo se edita cada valor: se conserva el tipo con el que llegó */
const kindOf = (value) => {
  if (value === SECRET_MASK) return "secret";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (value !== null && typeof value === "object") return "json";
  if (typeof value === "string" && (value.includes("\n") || value.length > 80))
    return "long";
  return "text";
};

const initialDraft = (values) =>
  Object.fromEntries(
    Object.entries(values ?? {}).map(([key, value]) => {
      const kind = kindOf(value);
      if (kind === "secret") return [key, ""];
      if (kind === "json") return [key, JSON.stringify(value, null, 2)];
      return [key, value];
    })
  );

/** Edición de un grupo de configuración: valores y si está activo */
export function ConfigForm({ config, onHide, onSaved }) {
  const kinds = Object.fromEntries(
    Object.entries(config.values ?? {}).map(([key, value]) => [
      key,
      kindOf(value),
    ])
  );
  const [draft, setDraft] = useState(() => initialDraft(config.values));
  const [enabled, setEnabled] = useState(config.configStatus === "ENABLED");
  const [description, setDescription] = useState(config.description ?? "");
  const [jsonErrors, setJsonErrors] = useState({});
  const [updateConfig, { loading: saving, error }] = useMutation(UPDATE_CONFIG);

  const set = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    const values = {};
    for (const [key, kind] of Object.entries(kinds)) {
      const value = draft[key];
      if (kind === "secret") {
        // Vacío: no se cambia (el backend conserva el valor si llega la máscara)
        values[key] = value === "" ? SECRET_MASK : value;
      } else if (kind === "json") {
        try {
          values[key] = JSON.parse(value);
        } catch {
          errors[key] = "No es un JSON válido";
        }
      } else {
        values[key] = value;
      }
    }
    setJsonErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      const { data } = await updateConfig({
        variables: {
          input: {
            id: config.id,
            description: description.trim(),
            values,
            configStatus: enabled ? "ENABLED" : "DISABLED",
          },
        },
      });
      onSaved(data.updateConfig);
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  const editor = (key) => {
    const id = `config-${key}`;
    switch (kinds[key]) {
      case "boolean":
        return (
          <span className="flex align-items-center gap-2">
            <Checkbox
              inputId={id}
              checked={!!draft[key]}
              onChange={(e) => set(key, !!e.checked)}
            />
            <label htmlFor={id}>{draft[key] ? "Sí" : "No"}</label>
          </span>
        );
      case "number":
        return (
          <InputNumber
            inputId={id}
            value={draft[key]}
            onChange={(e) => set(key, e.value ?? 0)}
            useGrouping={false}
          />
        );
      case "secret":
        return (
          <InputText
            id={id}
            type="password"
            value={draft[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder="Guardado: escribe solo para cambiarlo"
            autoComplete="new-password"
          />
        );
      case "json":
      case "long":
        return (
          <InputTextarea
            id={id}
            value={draft[key]}
            onChange={(e) => set(key, e.target.value)}
            rows={kinds[key] === "json" ? 4 : 3}
            autoResize
            invalid={!!jsonErrors[key]}
            className="ui-code-input"
          />
        );
      default:
        return (
          <InputText
            id={id}
            value={draft[key] ?? ""}
            onChange={(e) => set(key, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog
      header={GROUP_LABELS[config.group] ?? config.group}
      visible
      onHide={onHide}
      className="w-full md:w-40rem"
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
              label="Activo"
              htmlFor="config-enabled"
              hint="Si se desactiva, el servidor usa los valores de su archivo .env"
            >
              <InputSwitch
                inputId="config-enabled"
                checked={enabled}
                onChange={(e) => setEnabled(!!e.value)}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción" htmlFor="config-description">
              <InputText
                id="config-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
              />
            </FormField>
          </div>
        </div>

        <FormSection title="Valores" hint={`Grupo ${config.group}`}>
          <div className="formgrid grid">
            {Object.keys(kinds).map((key) => (
              <div className="col-12" key={key}>
                <FormField
                  label={key}
                  htmlFor={`config-${key}`}
                  hint={KEY_HINTS[key]}
                  error={jsonErrors[key]}
                >
                  {editor(key)}
                </FormField>
              </div>
            ))}
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
          <Button type="submit" label="Guardar cambios" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
