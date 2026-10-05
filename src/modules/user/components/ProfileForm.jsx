import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PROFILE, UPDATE_USER_PROFILE } from "../graphql/queries";
import { useFormik } from "formik";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { FormField } from "../../../components/ui";

const MIN_NAME_LENGTH = 3;
// Formato internacional: + y entre 7 y 15 dígitos
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

/**
 * Traduce el error del backend a un mensaje entendible para el usuario
 */
const getSaveErrorMessage = (error) => {
  if (error.networkError) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }

  const message = error.graphQLErrors?.[0]?.message ?? "";

  if (/email.*already exists/i.test(message)) {
    return "Ese correo ya lo usa otra cuenta.";
  }
  if (/mobile.*already exists/i.test(message)) {
    return "Ese teléfono ya lo usa otra cuenta.";
  }
  if (/system user/i.test(message)) {
    return "El usuario del sistema no se puede modificar.";
  }

  return "No se pudieron guardar los cambios. Revisa los datos e inténtalo de nuevo.";
};

export function ProfileForm({ showSuccess }) {
  const { loading, error, data } = useQuery(GET_PROFILE);
  const [rejectedValues, setRejectedValues] = useState(null);
  const [updateProfile, { loading: updating, error: saveError }] =
    useMutation(UPDATE_USER_PROFILE, {
      // "Profile" renueva también el perfil de la sesión (nombre en la barra)
      refetchQueries: ["Profile"],
      onCompleted: () => showSuccess("Perfil actualizado correctamente"),
    });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: data?.profile?.email || "",
      name: data?.profile?.name || "",
      lastName: data?.profile?.lastName || "",
      mobile: data?.profile?.mobile || "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.email) {
        errors.email = "Email es requerido";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        errors.email = "Email inválido";
      }

      if (!values.name.trim()) {
        errors.name = "Nombres es requerido";
      } else if (values.name.trim().length < MIN_NAME_LENGTH) {
        errors.name = `Nombres debe tener al menos ${MIN_NAME_LENGTH} caracteres`;
      }

      if (
        values.lastName.trim() &&
        values.lastName.trim().length < MIN_NAME_LENGTH
      ) {
        errors.lastName = `Apellidos debe tener al menos ${MIN_NAME_LENGTH} caracteres`;
      }

      if (!values.mobile.trim()) {
        errors.mobile = "Teléfono es requerido";
      } else if (!PHONE_PATTERN.test(values.mobile.trim())) {
        errors.mobile =
          "Escribe el teléfono con el código de país, por ejemplo +5352345678";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        await updateProfile({
          variables: {
            input: {
              email: values.email.trim(),
              name: values.name.trim(),
              lastName: values.lastName.trim(),
              mobile: values.mobile.trim(),
            },
          },
        });
      } catch (e) {
        console.error("Error updating profile:", e);
        setRejectedValues(JSON.stringify(values));
      }
    },
  });

  // El error del servidor solo se muestra mientras los datos sigan siendo los
  // que se rechazaron; al corregir algo desaparece
  const showSaveError =
    saveError && rejectedValues === JSON.stringify(formik.values);

  const isFormFieldValid = (field) =>
    !!(formik.touched[field] && formik.errors[field]);
  const getFormErrorMessage = (field) =>
    isFormFieldValid(field) ? formik.errors[field] : undefined;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="grid">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="col-12 md:col-6">
            <Skeleton width="100%" height="2.5rem" className="mb-2" />
          </div>
        ))}
      </div>
    );

  if (error) return <Message severity="error" text="Error cargando perfil" />;

  return (
    <div className="flex flex-column gap-4">
      {/* Sección de Información Básica */}
      <Card title="Información Básica">
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField
              label="Nombres"
              htmlFor="name"
              required
              error={getFormErrorMessage("name")}
            >
              <InputText
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={isFormFieldValid("name")}
                disabled={updating}
                className="w-full"
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField
              label="Apellidos"
              htmlFor="lastName"
              error={getFormErrorMessage("lastName")}
            >
              <InputText
                id="lastName"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={isFormFieldValid("lastName")}
                disabled={updating}
                className="w-full"
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField
              label="Email"
              htmlFor="email"
              required
              error={getFormErrorMessage("email")}
            >
              <InputText
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={isFormFieldValid("email")}
                disabled={updating}
                className="w-full"
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField
              label="Teléfono"
              htmlFor="mobile"
              required
              hint="Con código de país, por ejemplo +5352345678"
              error={getFormErrorMessage("mobile")}
            >
              <InputText
                id="mobile"
                name="mobile"
                type="tel"
                value={formik.values.mobile}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={isFormFieldValid("mobile")}
                disabled={updating}
                className="w-full"
              />
            </FormField>
          </div>

          {showSaveError && (
            <div className="col-12">
              <Message
                severity="error"
                text={getSaveErrorMessage(saveError)}
                className="w-full mb-4"
              />
            </div>
          )}

          {/* Botón de Guardar (solo para campos editables) */}
          <div className="col-12 flex justify-content-end">
            <Button
              type="button"
              onClick={formik.handleSubmit}
              label="Guardar Cambios"
              icon="pi pi-save"
              loading={updating}
              disabled={!formik.dirty || !formik.isValid || updating}
            />
          </div>
        </div>
      </Card>

      {/* Sección de Información del Sistema */}
      <Card title="Información del Sistema">
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                {data?.profile?.enabled ? (
                  <Tag severity="success" value="Activo" />
                ) : (
                  <Tag severity="danger" value="Inactivo" />
                )}
              </div>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Fecha de Creación">
              <span>{formatDate(data?.profile?.createdAt)}</span>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Última Actualización">
              <span>{formatDate(data?.profile?.updatedAt)}</span>
            </FormField>
          </div>
        </div>
      </Card>

      {/* Sección de Roles y Permisos */}
      <Card title="Roles y Permisos">
        <FormField label="Roles Asignados">
          <div className="flex flex-wrap gap-2">
            {data?.profile?.role?.length > 0 ? (
              data.profile.role.map((role, index) => (
                <Tag key={index} value={role} severity="info" />
              ))
            ) : (
              <span className="text-color-secondary">No roles asignados</span>
            )}
          </div>
        </FormField>
      </Card>

      {/* Sección de Organización */}
      <Card title="Organización">
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Empresa">
              <span>{data?.profile?.business?.name || "N/A"}</span>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <span>{data?.profile?.office?.name || "N/A"}</span>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Departamento">
              <span>{data?.profile?.department?.name || "N/A"}</span>
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Equipo">
              <span>
                {data?.profile?.team?.name ||
                  (data?.profile?.team?.id
                    ? `Equipo #${data.profile.team.id}`
                    : "N/A")}
              </span>
            </FormField>
          </div>
        </div>
      </Card>
    </div>
  );
}
