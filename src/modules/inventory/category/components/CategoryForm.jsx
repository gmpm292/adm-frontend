import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_BUSINESS_OPTIONS } from "../../../company/shared/queries";
import { useHasRole } from "../../../../hooks/useHasRole";
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "../graphql/queries";

/**
 * Alta o edición de una categoría (con `category` edita). El SUPER elige la
 * empresa al crearla; los demás la crean en la suya.
 */
export function CategoryForm({ category, onHide, onSaved }) {
  const isEdit = !!category;
  const hasRole = useHasRole();
  const chooseBusiness = !isEdit && hasRole("SUPER");
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    businessId: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: businessData, loading: loadingBusinesses } = useQuery(
    GET_BUSINESS_OPTIONS,
    { skip: !chooseBusiness }
  );
  const [createCategory, createState] = useMutation(CREATE_CATEGORY);
  const [updateCategory, updateState] = useMutation(UPDATE_CATEGORY);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const errors = {
    name: form.name.trim() ? null : "Escribe un nombre",
    businessId:
      chooseBusiness && !form.businessId ? "Elige la empresa" : null,
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
      name: form.name.trim(),
      description: form.description.trim(),
    };
    try {
      if (isEdit) {
        const { data } = await updateCategory({
          variables: { category: { id: category.id, ...values } },
        });
        onSaved(data.updateCategory, { created: false });
      } else {
        const { data } = await createCategory({
          variables: {
            category: {
              ...values,
              ...(chooseBusiness && { businessId: form.businessId }),
            },
          },
        });
        onSaved(data.createCategory, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar categoría" : "Nueva categoría"}
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
          {chooseBusiness && (
            <div className="col-12">
              <FormField
                label="Empresa"
                htmlFor="category-business"
                required
                error={shown("businessId")}
              >
                <Dropdown
                  inputId="category-business"
                  value={form.businessId}
                  options={businessData?.businesses?.data ?? []}
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
          )}
          <div className="col-12">
            <FormField
              label="Nombre"
              htmlFor="category-name"
              required
              error={shown("name")}
            >
              <InputText
                id="category-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Por ejemplo: Anillos"
                invalid={!!shown("name")}
                maxLength={100}
                autoFocus
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción" htmlFor="category-description">
              <InputTextarea
                id="category-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                autoResize
                maxLength={500}
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
            label={isEdit ? "Guardar cambios" : "Guardar categoría"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
