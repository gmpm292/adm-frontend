import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PROFILE, UPDATE_USER_PROFILE } from "../graphql/queries";
import { useFormik } from "formik";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { classNames } from "primereact/utils";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";

export function ProfileForm({ showSuccess }) {
  const { loading, error, data } = useQuery(GET_PROFILE);
  const [updateProfile, { loading: updating }] = useMutation(
    UPDATE_USER_PROFILE,
    {
      refetchQueries: [{ query: GET_PROFILE }],
      onCompleted: () => showSuccess("Perfil actualizado correctamente"),
    }
  );

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

      if (!values.name) {
        errors.name = "Nombres es requerido";
      } else if (values.name.length < 2) {
        errors.name = "Nombre muy corto";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        await updateProfile({
          variables: {
            input: {
              email: values.email,
              name: values.name,
              lastName: values.lastName,
              mobile: values.mobile,
            },
          },
        });
      } catch (e) {
        console.error("Error updating profile:", e);
      }
    },
  });

  const isFormFieldValid = (field) =>
    !!(formik.touched[field] && formik.errors[field]);
  const getFormErrorMessage = (field) => {
    return (
      isFormFieldValid(field) && (
        <small className="p-error">{formik.errors[field]}</small>
      )
    );
  };

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
    <div className="profile-container">
      {/* Sección de Información Básica */}
      <div className="card p-fluid mb-4">
        <h4>Información Básica</h4>
        <Divider />
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="name">Nombres*</label>
              <InputText
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={classNames({ "p-invalid": isFormFieldValid("name") })}
                disabled={updating}
              />
              {getFormErrorMessage("name")}
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="lastName">Apellidos</label>
              <InputText
                id="lastName"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={updating}
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="email">Email*</label>
              <InputText
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={classNames({ "p-invalid": isFormFieldValid("email") })}
                disabled={updating}
              />
              {getFormErrorMessage("email")}
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="mobile">Teléfono</label>
              <InputText
                id="mobile"
                name="mobile"
                value={formik.values.mobile}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={updating}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Información del Sistema */}
      <div className="card p-fluid mb-4">
        <h4>Información del Sistema</h4>
        <Divider />
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label>ID de Usuario</label>
              <div className="p-inputtext">
                {data?.profile?.id || "N/A"}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label>Estado</label>
              <div className="p-inputtext">
                {data?.profile?.enabled ? (
                  <Tag severity="success" value="Activo" />
                ) : (
                  <Tag severity="danger" value="Inactivo" />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label>Fecha de Creación</label>
              <div className="p-inputtext">
                {formatDate(data?.profile?.createdAt)}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label>Última Actualización</label>
              <div className="p-inputtext">
                {formatDate(data?.profile?.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Roles y Permisos */}
      <div className="card p-fluid mb-4">
        <h4>Roles y Permisos</h4>
        <Divider />
        <div className="grid">
          <div className="col-12">
            <div className="field">
              <label>Roles Asignados</label>
              <div className="flex flex-wrap gap-2">
                {data?.profile?.role?.length > 0 ? (
                  data.profile.role.map((role, index) => (
                    <Tag key={index} value={role} severity="info" />
                  ))
                ) : (
                  <span className="text-color-secondary">No roles asignados</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Organización */}
      <div className="card p-fluid mb-4">
        <h4>Organización</h4>
        <Divider />
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label>Empresa</label>
              <div className="p-inputtext">
                {data?.profile?.business?.name || "N/A"}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label>Oficina</label>
              <div className="p-inputtext">
                {data?.profile?.office?.name || "N/A"}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label>Departamento</label>
              <div className="p-inputtext">
                {data?.profile?.department?.name || "N/A"}
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label>Equipo</label>
              <div className="p-inputtext">
                {data?.profile?.team?.id ? `Equipo #${data.profile.team.id}` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Seguridad
      <div className="card p-fluid">
        <h4>Seguridad</h4>
        <Divider />
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label>Autenticación de Dos Factores</label>
              <div className="flex align-items-center gap-2">
                {data?.profile?.isTwoFactorConfigured ? (
                  <>
                    <Badge 
                      value={data.profile.isTwoFactorEnabled ? "Activado" : "Desactivado"} 
                      severity={data.profile.isTwoFactorEnabled ? "success" : "warning"} 
                    />
                    <Button 
                      icon="pi pi-cog" 
                      className="p-button-text p-button-sm" 
                      tooltip="Configurar 2FA"
                      tooltipOptions={{ position: 'top' }}
                    />
                  </>
                ) : (
                  <Tag severity="danger" value="No configurado" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Botón de Guardar (solo para campos editables) */}
      <div className="flex justify-content-end mt-4">
        <Button
          type="button"
          onClick={formik.handleSubmit}
          label="Guardar Cambios"
          icon="pi pi-save"
          className="p-button-success"
          loading={updating}
          disabled={!formik.dirty || !formik.isValid || updating}
        />
      </div>
    </div>
  );
}