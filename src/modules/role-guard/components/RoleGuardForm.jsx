import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { FormField, InfoRow } from "../../../components/ui";
import { getErrorMessage } from "../../../utils/errors";
import { ROLE_OPTIONS, roleLabel } from "../../user/roles";
import { UPDATE_ROLE_GUARD } from "../graphql/queries";
import { TYPE_LABELS } from "../labels";

const rolesText = (roles) =>
  roles?.length ? roles.map(roleLabel).join(", ") : "Cualquier rol";

/**
 * Roles de una operación. Guardar una lista sustituye la del código; el
 * superadministrador no se puede quitar.
 */
export function RoleGuardForm({ roleGuard, onHide, onSaved }) {
  const [roles, setRoles] = useState(
    roleGuard.roles ?? roleGuard.codeRoles ?? ["SUPER"]
  );
  const [description, setDescription] = useState(roleGuard.description ?? "");
  const [updateRoleGuard, { loading: saving, error }] =
    useMutation(UPDATE_ROLE_GUARD);

  const options = ROLE_OPTIONS.map((option) => ({
    ...option,
    disabled: option.value === "SUPER",
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await updateRoleGuard({
        variables: {
          updateRoleGuardInput: {
            id: roleGuard.id,
            roles: Array.from(new Set(["SUPER", ...roles])),
            description: description.trim(),
          },
        },
      });
      onSaved(data.updateRoleGuard);
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header="Roles de la operación"
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
        <div className="flex flex-column gap-3 mb-3">
          <InfoRow
            icon="pi pi-bolt"
            label="Operación"
            detail={TYPE_LABELS[roleGuard.type] ?? roleGuard.type}
          >
            {roleGuard.queryOrEndPointURL}
          </InfoRow>
          <InfoRow icon="pi pi-code" label="Según el código">
            {rolesText(roleGuard.codeRoles)}
          </InfoRow>
        </div>
        <div className="formgrid grid">
          <div className="col-12">
            <FormField
              label="Roles que pueden usarla"
              htmlFor="role-guard-roles"
              required
              hint="Sustituye a los del código. El rol Super siempre se conserva"
            >
              <MultiSelect
                inputId="role-guard-roles"
                value={roles}
                options={options}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => setRoles(e.value)}
                display="chip"
                placeholder="Elige los roles"
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Nota" htmlFor="role-guard-description">
              <InputText
                id="role-guard-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Por qué se cambió, para quien venga después"
                maxLength={255}
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
          <Button type="submit" label="Guardar roles" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
