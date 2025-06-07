import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";
import { Password } from "primereact/password";
import {
  CHANGE_PASSWORD,
  CHECK_CONFIRMATION_TOKEN,
} from "../../auth/graphql/queries";
import * as Yup from "yup";
import { useFormik } from "formik";
import denied from "../../../assets/images/denied-icon.jpg";
import "../styles/ChangePassword.css";

export const ChangePasswordForm = () => {
  const { confirmationToken } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const [checkToken] = useMutation(CHECK_CONFIRMATION_TOKEN);

  const [loadingForm, setLoadingForm] = useState(false);
  const [showForm, setShowForm] = useState(null);

  const validationSchema = Yup.object({
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirm: Yup.string()
      .required("Password confirmation is required")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirm: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoadingForm(true);
        const { data } = await changePassword({
          variables: {
            input: {
              confirmationToken,
              newPassword: values.password,
            },
          },
        });

        if (data?.changePassword) {
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Your password has been successfully updated",
            life: 2000,
          });
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: error.message || "Failed to update password",
          life: 3000,
        });
      } finally {
        setLoadingForm(false);
      }
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      setLoadingForm(true);
      try {
        const { data } = await checkToken({
          variables: {
            input: { confirmationToken },
          },
        });

        setShowForm(Boolean(data?.checkConfirmationToken));
      } catch (error) {
        console.error("verifyToken error", error);
        setShowForm(false);

        setTimeout(() => {
          toast.current?.show({
            severity: "error",
            summary: "Invalid Token",
            detail: "The token is not valid or has expired",
            life: 3000,
          });
        }, 100);
      } finally {
        setLoadingForm(false);
      }
    };

    if (confirmationToken) {
      verifyToken();
    } else {
      setShowForm(false);
    }
  }, [confirmationToken, checkToken]);

  const cancel = () => {
    navigate("/login");
  };

  if (loadingForm) {
    return (
      <div className="spinner-container">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      {showForm === true && (
        <div className="change-password-page">
          <div className="change-password-container">
            <div className="change-password-header">
              <h1 className="change-password-title">Change Password</h1>
              <p className="change-password-subtitle">Set a new password for your account</p>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="field">
                <span className="p-float-label">
                  <Password
                    id="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    toggleMask
                    feedback={false}
                    className={`${formik.touched.password && formik.errors.password ? "p-invalid" : ""}`}
                    inputClassName="password-input"
                  />
                  <label htmlFor="password">New Password</label>
                </span>
                {formik.touched.password && formik.errors.password && (
                  <small className="error-message">{formik.errors.password}</small>
                )}
              </div>

              <div className="field">
                <span className="p-float-label">
                  <Password
                    id="confirm"
                    name="confirm"
                    value={formik.values.confirm}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    toggleMask
                    feedback={false}
                    className={`${formik.touched.confirm && formik.errors.confirm ? "p-invalid" : ""}`}
                    inputClassName="password-input"
                  />
                  <label htmlFor="confirm">Confirm Password</label>
                </span>
                {formik.touched.confirm && formik.errors.confirm && (
                  <small className="error-message">{formik.errors.confirm}</small>
                )}
              </div>

              <div className="buttons-container">
                <button
                  type="button"
                  onClick={cancel}
                  className="cancel-button"
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm === false && (
        <div className="invalid-token-page">
          <div className="invalid-token-container">
            <img src={denied} alt="Access Denied" className="denied-icon" />
            <h2>Invalid or Expired Token</h2>
            <p>Please request a new password reset link.</p>
            <button
              onClick={() => navigate("/login")}
              className="login-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordForm;