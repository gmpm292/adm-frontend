import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { FormField, NoData } from "../../../components/ui";
import { getErrorMessage } from "../../../utils/errors";
import {
  CREATE_USER,
  GET_USER_BY_ID,
  GET_USER_ORGANIZATION,
  UPDATE_USER,
  UPDATE_USER_ROLE,
} from "../graphql/queries";
import { ROLES, ROLE_OPTIONS } from "../roles";

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME_LENGTH = 3;

// Niveles de la estructura, de mayor a menor, con el nivel del que cuelgan
const LEVELS = [
  { key: "business", label: "Empresa", list: "businesses" },
  { key: "office", label: "Oficina", list: "offices", parent: "business" },
  {
    key: "department",
    label: "Departamento",
    list: "departments",
    parent: "office",
  },
  { key: "team", label: "Equipo", list: "teams", parent: "department" },
];

const roleOptionTemplate = (option) => (
  <span className="flex flex-column">
    <span className="font-medium">{option.label}</span>
    <small className="text-color-secondary">{option.scope}</small>
  </span>
);

/** Campos del formulario, ya con el usuario (si se edita) cargado */
function UserFormFields({ user, isSelf, onHide, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
    enabled: user?.enabled ?? false,
    role: user?.role?.[0] ?? null,
    business: user?.business?.id ?? null,
    office: user?.office?.id ?? null,
    department: user?.department?.id ?? null,
    team: user?.team?.id ?? null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { data: organization, loading: loadingOrganization } = useQuery(
    GET_USER_ORGANIZATION,
  );
  const [createUser, { loading: creating }] = useMutation(CREATE_USER);
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);
  const [updateUserRole, { loading: updatingRole }] =
    useMutation(UPDATE_USER_ROLE);
  const saving = creating || updating || updatingRole;

  const levels = LEVELS.filter((level) =>
    ROLES[form.role]?.levels.includes(level.key),
  );

  // Opciones de cada nivel: solo las que cuelgan del nivel superior elegido
  const optionsOf = (level) =>
    (organization?.[level.list]?.data ?? [])
      .filter(
        (item) => !level.parent || item[level.parent]?.id === form[level.parent],
      )
      .map((item) => ({ label: item.name, value: item.id }));

  const placementChanged = () =>
    form.role !== user?.role?.[0] ||
    LEVELS.some(
      (level) =>
        (levels.includes(level) ? form[level.key] : null) !==
        (user?.[level.key]?.id ?? null),
    );

  // Editar solo el nombre de una cuenta antigua no obliga a reubicarla
  const checksPlacement = !isEdit || placementChanged();

  const mobile = form.mobile.replace(/[\s-]/g, "");
  const errors = {
    name:
      form.name.trim().length >= MIN_NAME_LENGTH
        ? null
        : `Al menos ${MIN_NAME_LENGTH} caracteres`,
    lastName:
      !form.lastName.trim() || form.lastName.trim().length >= MIN_NAME_LENGTH
        ? null
        : `Al menos ${MIN_NAME_LENGTH} caracteres, o déjalo vacío`,
    email: EMAIL_PATTERN.test(form.email.trim())
      ? null
      : "Escribe un correo válido",
    mobile: PHONE_PATTERN.test(mobile)
      ? null
      : "Con el código del país, por ejemplo +5351234567",
    role: form.role ? null : "Selecciona el rol",
    ...Object.fromEntries(
      levels.map((level) => [
        level.key,
        form[level.key] || !checksPlacement
          ? null
          : `Selecciona ${level.label.toLowerCase()}`,
      ]),
    ),
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  // Al cambiar un nivel se vacían los que cuelgan de él
  const setLevel = (key, value) =>
    setForm((current) => {
      const next = { ...current, [key]: value ?? null };
      const index = LEVELS.findIndex((level) => level.key === key);
      LEVELS.slice(index + 1).forEach((level) => {
        next[level.key] = null;
      });
      return next;
    });

  const placement = () =>
    Object.fromEntries(
      LEVELS.map((level) => [
        `${level.key}Id`,
        levels.includes(level) ? form[level.key] : null,
      ]),
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSaveError(null);
    if (hasErrors) return;

    const person = {
      name: form.name.trim(),
      // `null` borra los apellidos
      lastName: form.lastName.trim() || null,
      email: form.email.trim().toLowerCase(),
      mobile,
    };

    try {
      if (isEdit) {
        await updateUser({
          variables: {
            user: {
              id: user.id,
              ...person,
              // La propia cuenta no se desactiva desde aquí
              ...(!isSelf && { enabled: form.enabled }),
            },
          },
        });
        if (!isSelf && placementChanged()) {
          await updateUserRole({
            variables: {
              user: { id: user.id, role: [form.role], ...placement() },
            },
          });
        }
      } else {
        await createUser({
          variables: {
            user: { ...person, role: [form.role], ...placement() },
          },
        });
      }
      onSaved({ ...person, created: !isEdit });
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {saveError && (
        <Message severity="error" text={saveError} className="w-full mb-3" />
      )}
      {!isEdit && (
        <Message
          severity="info"
          text="La cuenta nace inactiva. Se activa cuando el usuario crea su contraseña con el enlace que recibe por correo, o cuando le asignas una desde el listado."
          className="w-full mb-3"
        />
      )}

      <div className="formgrid grid">
        <div className="col-12 md:col-6">
          <FormField
            label="Nombre"
            htmlFor="user-name"
            required
            error={shown("name")}
          >
            <InputText
              id="user-name"
              value={form.name}
              onChange={setField("name")}
              invalid={!!shown("name")}
              autoFocus
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField
            label="Apellidos"
            htmlFor="user-last-name"
            error={shown("lastName")}
          >
            <InputText
              id="user-last-name"
              value={form.lastName}
              onChange={setField("lastName")}
              invalid={!!shown("lastName")}
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField
            label="Correo"
            htmlFor="user-email"
            required
            hint="Con él inicia sesión"
            error={shown("email")}
          >
            <InputText
              id="user-email"
              value={form.email}
              onChange={setField("email")}
              invalid={!!shown("email")}
              inputMode="email"
              autoComplete="off"
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField
            label="Teléfono"
            htmlFor="user-mobile"
            required
            hint="Con el código del país"
            error={shown("mobile")}
          >
            <InputText
              id="user-mobile"
              value={form.mobile}
              onChange={setField("mobile")}
              invalid={!!shown("mobile")}
              placeholder="+5351234567"
              inputMode="tel"
            />
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField
            label="Rol"
            htmlFor="user-role"
            required
            hint={
              isSelf
                ? "No puedes cambiar tu propio rol"
                : ROLES[form.role]?.scope
            }
            error={shown("role")}
          >
            <Dropdown
              inputId="user-role"
              value={form.role}
              options={ROLE_OPTIONS}
              itemTemplate={roleOptionTemplate}
              onChange={(e) =>
                setForm((current) => ({ ...current, role: e.value }))
              }
              placeholder="Selecciona el rol"
              invalid={!!shown("role")}
              disabled={isSelf}
            />
          </FormField>
        </div>

        {isEdit && (
          <div className="col-12 md:col-6">
            <FormField
              label="Estado"
              htmlFor="user-enabled"
              hint={
                isSelf
                  ? "No puedes desactivar tu propia cuenta"
                  : "Una cuenta inactiva no puede iniciar sesión"
              }
            >
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  inputId="user-enabled"
                  checked={form.enabled}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, enabled: e.value }))
                  }
                  disabled={isSelf}
                />
                <span>{form.enabled ? "Activa" : "Inactiva"}</span>
              </div>
            </FormField>
          </div>
        )}

        {levels.map((level) => (
          <div key={level.key} className="col-12 md:col-6">
            <FormField
              label={level.label}
              htmlFor={`user-${level.key}`}
              required
              error={shown(level.key)}
            >
              <Dropdown
                inputId={`user-${level.key}`}
                value={form[level.key]}
                options={optionsOf(level)}
                onChange={(e) => setLevel(level.key, e.value)}
                placeholder={`Selecciona ${level.label.toLowerCase()}`}
                emptyMessage={
                  level.parent && !form[level.parent]
                    ? "Elige primero el nivel anterior"
                    : "No hay ninguno creado"
                }
                loading={loadingOrganization}
                invalid={!!shown(level.key)}
                disabled={isSelf}
                filter={optionsOf(level).length > 8}
              />
            </FormField>
          </div>
        ))}
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
          label={isEdit ? "Guardar cambios" : "Crear usuario"}
          loading={saving}
        />
      </div>
    </form>
  );
}

/**
 * Alta o edición de un usuario (con `userId` edita): sus datos, su rol y el
 * lugar de la empresa que le corresponde según ese rol.
 */
export function UserFormDialog({ userId, currentUserId, onHide, onSaved }) {
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });
  const user = data?.user;

  return (
    <Dialog
      header={userId ? "Editar usuario" : "Nuevo usuario"}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      modal
    >
      {!userId || user ? (
        <UserFormFields
          user={user}
          isSelf={!!user && user.id === currentUserId}
          onHide={onHide}
          onSaved={onSaved}
        />
      ) : loading ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : (
        <NoData
          message={error ? getErrorMessage(error) : "No se encontró el usuario"}
        />
      )}
    </Dialog>
  );
}
