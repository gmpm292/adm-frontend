import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  DISABLE_OWN_2FA,
  FINISH_CONFIGURE_2FA,
  GENERATE_2FA_SECRET,
  VERIFY_2FA,
} from "../../auth/graphql/queries";
import { FormField, OtpInput, QrPanel } from "../../../components/ui";

const CODE_LENGTH = 6;

const getErrorMessage = (error) => {
  if (error.networkError) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  if (/Invalid 2FA code/i.test(error.message)) {
    return "El código no es correcto o ya caducó. Escribe el que muestra ahora la aplicación.";
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
};

/**
 * Diálogo para activar ("enable") o desactivar ("disable") la verificación
 * en dos pasos de la cuenta propia.
 */
export function TwoFactorDialog({ mode, visible, onHide, onDone }) {
  const [code, setCode] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [generateSecret] = useMutation(GENERATE_2FA_SECRET);
  const [finishConfigure] = useMutation(FINISH_CONFIGURE_2FA);
  const [disableOwn] = useMutation(DISABLE_OWN_2FA);
  const [verifyCode] = useLazyQuery(VERIFY_2FA, {
    fetchPolicy: "network-only",
  });

  const enabling = mode === "enable";

  useEffect(() => {
    if (!visible) return;

    setCode("");
    setError(null);
    setOtpAuthUrl(null);

    if (enabling) {
      generateSecret()
        .then(({ data }) => setOtpAuthUrl(data.generate2faSecret))
        .catch((err) => setError(err));
    }
  }, [visible, enabling, generateSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (enabling) {
        await finishConfigure({ variables: { token2Fa: code } });
        // La sesión actual pasa a estar verificada, para no pedir el código
        // otra vez en cuanto se renueve el token
        const { error: verifyError } = await verifyCode({
          variables: { token2Fa: code },
        });
        if (verifyError) throw verifyError;
      } else {
        await disableOwn({ variables: { token2Fa: code } });
      }
      onDone(enabling);
    } catch (err) {
      setError(err);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const waitingForQr = enabling && !otpAuthUrl && !error;

  return (
    <Dialog
      header={
        enabling
          ? "Activar verificación en dos pasos"
          : "Desactivar verificación en dos pasos"
      }
      visible={visible}
      onHide={onHide}
      modal
      draggable={false}
      className="w-full md:w-30rem"
    >
      {waitingForQr ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p className="mt-0 text-color-secondary">
            {enabling
              ? "Escanea el código con una aplicación de autenticación (Google Authenticator, Microsoft Authenticator, Authy) y escribe el código que te muestre."
              : "Para confirmar, escribe el código que muestra ahora tu aplicación de autenticación."}
          </p>

          {enabling && otpAuthUrl && (
            <div className="mb-4">
              <QrPanel otpAuthUrl={otpAuthUrl} />
            </div>
          )}

          <FormField label="Código de verificación" htmlFor="profile-otp">
            <OtpInput
              id="profile-otp"
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

          <div className="flex justify-content-end gap-2">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              onClick={onHide}
              disabled={submitting}
            />
            <Button
              type="submit"
              label={enabling ? "Activar" : "Desactivar"}
              severity={enabling ? undefined : "danger"}
              loading={submitting}
              disabled={submitting || code.length !== CODE_LENGTH}
            />
          </div>
        </form>
      )}
    </Dialog>
  );
}
