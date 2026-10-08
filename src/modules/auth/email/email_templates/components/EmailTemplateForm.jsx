import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField, FormSection } from "../../../../../components/ui";
import { getErrorMessage } from "../../../../../utils/errors";
import {
  CREATE_EMAIL_TEMPLATE,
  UPDATE_EMAIL_TEMPLATE,
} from "../graphql/email-templates.queries";

const toForm = (template) => ({
  name: template?.name ?? "",
  subject: template?.subject ?? "",
  body: template?.body ?? "",
  defaultContext: template?.defaultContext
    ? JSON.stringify(template.defaultContext, null, 2)
    : "",
  isActive: template?.isActive ?? true,
});

/** Alta o edición de una plantilla de correo (con `template` edita) */
export function EmailTemplateForm({ template, onHide, onSaved }) {
  const isEdit = !!template;
  const [form, setForm] = useState(() => toForm(template));
  const [submitted, setSubmitted] = useState(false);
  const [jsonError, setJsonError] = useState(null);

  const [createTemplate, createState] = useMutation(CREATE_EMAIL_TEMPLATE);
  const [updateTemplate, updateState] = useMutation(UPDATE_EMAIL_TEMPLATE);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const errors = {
    name: form.name.trim() ? null : "Escribe un nombre",
    subject: form.subject.trim() ? null : "Escribe el asunto",
    body: form.body.trim() ? null : "Escribe el cuerpo del mensaje",
  };
  const hasErrors = Object.values(errors).some(Boolean) || !!jsonError;
  const shown = (field) => (submitted ? errors[field] : null);

  const parseContext = () => {
    if (!form.defaultContext.trim()) {
      setJsonError(null);
      return null;
    }
    try {
      const parsed = JSON.parse(form.defaultContext);
      setJsonError(null);
      return parsed;
    } catch {
      setJsonError("El contexto por defecto no es JSON válido");
      return undefined;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    const defaultContext = parseContext();
    if (defaultContext === undefined) return;
    if (
      !form.name.trim() ||
      !form.subject.trim() ||
      !form.body.trim()
    ) {
      return;
    }

    const values = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      body: form.body,
      defaultContext,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        const { data } = await updateTemplate({
          variables: { input: { id: template.id, ...values } },
        });
        onSaved(data.updateEmailTemplate, { created: false });
      } else {
        const { data } = await createTemplate({ variables: { input: values } });
        onSaved(data.createEmailTemplate, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar plantilla" : "Nueva plantilla"}
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

        <FormSection title="La plantilla">
          <div className="formgrid grid">
            <div className="col-12 md:col-8">
              <FormField
                label="Nombre"
                htmlFor="template-name"
                required
                error={shown("name")}
                hint="Identifica la plantilla al elegirla para enviar un correo"
              >
                <InputText
                  id="template-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  invalid={!!shown("name")}
                  maxLength={100}
                  autoFocus
                />
              </FormField>
            </div>
            <div className="col-12 md:col-4">
              <FormField label="Activa" htmlFor="template-active">
                <span className="flex align-items-center gap-2">
                  <InputSwitch
                    inputId="template-active"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.value)}
                  />
                  {form.isActive ? "Se puede usar" : "Deshabilitada"}
                </span>
              </FormField>
            </div>
            <div className="col-12">
              <FormField
                label="Asunto"
                htmlFor="template-subject"
                required
                error={shown("subject")}
              >
                <InputText
                  id="template-subject"
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  invalid={!!shown("subject")}
                  maxLength={200}
                />
              </FormField>
            </div>
            <div className="col-12">
              <FormField
                label="Cuerpo"
                htmlFor="template-body"
                required
                error={shown("body")}
                hint="Admite HTML y variables como {{nombre}}, según lo que reciba el contexto al enviar"
              >
                <InputTextarea
                  id="template-body"
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  invalid={!!shown("body")}
                  rows={8}
                  autoResize
                />
              </FormField>
            </div>
            <div className="col-12">
              <FormField
                label="Contexto por defecto"
                htmlFor="template-context"
                hint="Opcional: valores JSON que rellenan las variables cuando el envío no los indica"
                error={jsonError}
              >
                <InputTextarea
                  id="template-context"
                  value={form.defaultContext}
                  onChange={(e) => set("defaultContext", e.target.value)}
                  invalid={!!jsonError}
                  rows={4}
                  autoResize
                  placeholder={'{ "empresa": "Mi Mipyme" }'}
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
            label={isEdit ? "Guardar cambios" : "Guardar plantilla"}
            loading={saving}
            disabled={hasErrors && submitted}
          />
        </div>
      </form>
    </Dialog>
  );
}
