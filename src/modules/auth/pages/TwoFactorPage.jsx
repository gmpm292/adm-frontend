import { useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import {
  FINISH_CONFIGURE_2FA,
  GENERATE_2FA_SECRET,
  VERIFY_2FA,
} from "../graphql/queries";
import { getTwoFactorStep, useAuthContext } from "../components/AuthContext";
import {
  AuthLayout,
  FormField,
  LoadingScreen,
  OtpInput,
  QrPanel,
} from "../../../components/ui";

const CODE_LENGTH = 6;

const getErrorMessage = (error) => {
  if (error.networkError) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  if (/Invalid 2FA code/i.test(error.message)) {
    return "El código no es correcto o ya caducó. Escribe el que muestra ahora la aplicación.";
  }
  return "No se pudo verificar el código. Inténtalo de nuevo.";
};

/**
 * Segundo paso del login para cuentas con 2FA.
 * - "verify": la cuenta ya tiene la aplicación emparejada y solo pide el código.
 * - "setup": la cuenta exige 2FA pero aún no está emparejada; muestra el QR.
 */
export function TwoFactorPage() {
  const step = getTwoFactorStep();
  const navigate = useNavigate();
  const { completeLogin, logout } = useAuthContext();
  const [code, setCode] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const secretRequested = useRef(false);

  const [generateSecret] = useMutation(GENERATE_2FA_SECRET);
  const [finishConfigure] = useMutation(FINISH_CONFIGURE_2FA);
  const [verifyCode] = useLazyQuery(VERIFY_2FA, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (step !== "setup" || secretRequested.current) return;
    secretRequested.current = true;

    generateSecret()
      .then(({ data }) => setOtpAuthUrl(data.generate2faSecret))
      .catch((err) => setError(err));
  }, [step, generateSecret]);

  if (!step) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (step === "setup") {
        await finishConfigure({ variables: { token2Fa: code } });
      }

      const { data, error: verifyError } = await verifyCode({
        variables: { token2Fa: code },
      });
      if (verifyError) throw verifyError;

      completeLogin(data.verify2FA.profile);
      navigate("/statistics/analytics", { replace: true });
    } catch (err) {
      setError(err);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "setup" && !otpAuthUrl && !error) {
    return <LoadingScreen message="Preparando la verificación..." />;
  }

  return (
    <AuthLayout
      title={
        step === "setup"
          ? "Configura la verificación en dos pasos"
          : "Verificación en dos pasos"
      }
      subtitle={
        step === "setup"
          ? "Tu cuenta requiere un segundo paso para entrar. Escanea el código con una aplicación de autenticación (Google Authenticator, Microsoft Authenticator, Authy) y escribe el código que te muestre."
          : "Escribe el código de 6 dígitos que muestra tu aplicación de autenticación."
      }
      footer={
        <Button
          label="Volver al inicio de sesión"
          link
          onClick={() => logout()}
        />
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {step === "setup" && otpAuthUrl && (
          <div className="mb-4">
            <QrPanel otpAuthUrl={otpAuthUrl} />
          </div>
        )}

        <FormField label="Código de verificación" htmlFor="otp">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={submitting}
            invalid={Boolean(error)}
          />
        </FormField>

        {error && (
          <Message
            severity="error"
            text={getErrorMessage(error)}
            className="w-full mb-4"
          />
        )}

        <Button
          type="submit"
          label="Verificar y entrar"
          loading={submitting}
          className="w-full"
          disabled={submitting || code.length !== CODE_LENGTH}
        />
      </form>
    </AuthLayout>
  );
}
