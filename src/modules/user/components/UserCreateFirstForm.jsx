import React, { useState, useRef } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_FIRST_USER } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { classNames } from "primereact/utils";
import { useNavigate } from "react-router-dom";

const UserCreateFirstForm = () => {
  const [textPass, setTextPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const [createFirstUser] = useMutation(CREATE_FIRST_USER);

  const validationSchema = Yup.object({
    name: Yup.string().required("Nombres es requerido"),
    email: Yup.string().email("Email inválido").required("Email es requerido"),
    mobile: Yup.string().required("Teléfono es requerido"),
    newPassword: Yup.string().required("Contraseña es requerida"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      lastName: "",
      email: "",
      mobile: "",
      newPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await createFirstUser({
          variables: {
            input: values,
          },
        });

        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Usuario creado correctamente",
          life: 3000,
        });

        navigate("/login");
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message,
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const isFormFieldInvalid = (name) =>
    !!(formik.touched[name] && formik.errors[name]);

  const getFormErrorMessage = (name) => {
    return isFormFieldInvalid(name) ? (
      <small className="p-error">{formik.errors[name]}</small>
    ) : (
      <small className="p-error">&nbsp;</small>
    );
  };

  const cancel = () => {
    navigate("/login");
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="container">
        <div className="text-900 font-medium mb-3 text-xl">
          Crear primer usuario
        </div>
        <div className="surface-card p-4 shadow-2 border-round p-fluid">
          <form onSubmit={formik.handleSubmit}>
            <div className="grid formgrid p-fluid">
              <div className="field mb-4 col-12 md:col-4">
                <div className="field">
                  <label htmlFor="name" className="font-medium text-900">
                    Nombres <small className="p-error">*</small>
                  </label>
                  <InputText
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={classNames({
                      "p-invalid": isFormFieldInvalid("name"),
                    })}
                  />
                  {getFormErrorMessage("name")}
                </div>
              </div>
              <div className="field mb-4 col-12 md:col-4">
                <div className="field">
                  <label htmlFor="lastName" className="font-medium text-900">
                    Apellido
                  </label>
                  <InputText
                    id="lastName"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
              <div className="field mb-4 col-12 md:col-4">
                <div className="field">
                  <label htmlFor="email" className="font-medium text-900">
                    Email <small className="p-error">*</small>
                  </label>
                  <InputText
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={classNames({
                      "p-invalid": isFormFieldInvalid("email"),
                    })}
                  />
                  {getFormErrorMessage("email")}
                </div>
              </div>
            </div>
            <div className="grid formgrid p-fluid">
              <div className="field mb-4 col-12 md:col-12">
                <div className="field">
                  <label htmlFor="mobile" className="font-medium text-900">
                    Teléfono <small className="p-error">*</small>
                  </label>
                  <InputText
                    id="mobile"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={classNames({
                      "p-invalid": isFormFieldInvalid("mobile"),
                    })}
                  />
                  {getFormErrorMessage("mobile")}
                </div>
              </div>
            </div>
            <div className="grid formgrid p-fluid">
              <div className="field mb-4 col-12 md:col-12">
                <div className="field">
                  <label className="font-medium text-900">
                    Contraseña <small className="p-error">*</small>
                  </label>
                  <span className="p-input-icon-right w-full">
                    <i
                      onClick={() => setTextPass(!textPass)}
                      className={
                        textPass
                          ? "pi pi-eye-slash iconpass"
                          : "pi pi-eye iconpass"
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <InputText
                      id="newPassword"
                      name="newPassword"
                      value={formik.values.newPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type={textPass ? "text" : "password"}
                      className={classNames("w-full mb-3", {
                        "p-invalid": isFormFieldInvalid("newPassword"),
                      })}
                    />
                  </span>
                  {getFormErrorMessage("newPassword")}
                </div>
              </div>
            </div>
            <div className="surface-border border-top-1 opacity-50 mb-3 col-12"></div>
            <div className="grid">
              <div className="col-12">
                <div className="actions">
                  <Button
                    label="Aceptar"
                    icon="pi pi-save"
                    loading={loading}
                    type="submit"
                    className="w-auto"
                    severity="info"
                  />
                  <Button
                    severity="danger"
                    label="Cancelar"
                    onClick={cancel}
                    className="w-auto"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserCreateFirstForm;
