import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { useQuery } from "@apollo/client";
import { GET_QZ_PUBLIC_KEY } from "../graphql/queries";

export function QzTrayConfig() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_QZ_PUBLIC_KEY, {
    fetchPolicy: "network-only",
    onError: (err) => {
      console.error("Error obteniendo certificado público:", err);
      setError("Error al obtener el certificado de seguridad");
    },
  });

  const downloadCertificate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Refrescar datos para obtener el certificado más reciente
      const { data: freshData } = await refetch();

      if (!freshData?.getQZPublicKey?.publicKey) {
        throw new Error("No se pudo obtener el certificado público");
      }

      const publicKey = freshData.getQZPublicKey.publicKey;

      // Crear y descargar el archivo
      const blob = new Blob([publicKey], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Certificado descargado correctamente");
    } catch (err: any) {
      console.error("Error descargando certificado:", err);
      setError(err.message || "Error al descargar el certificado");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!data?.getQZPublicKey?.publicKey) return;

    try {
      await navigator.clipboard.writeText(data.getQZPublicKey.publicKey);
      setSuccess("Certificado copiado al portapapeles");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error copiando al portapapeles:", err);
      setError("No se pudo copiar al portapapeles");
    }
  };

  const publicKey = data?.getQZPublicKey?.publicKey;

  return (
    <div className="qz-tray-config-container">
      <Card title="Configuración de Impresión QZ Tray" className="shadow-2">
        {error && (
          <Message
            severity="error"
            text={error}
            className="w-full mb-4"
            onClose={() => setError(null)}
          />
        )}

        {success && (
          <Message
            severity="success"
            text={success}
            className="w-full mb-4"
            onClose={() => setSuccess(null)}
          />
        )}

        <div className="flex flex-column align-items-center gap-3">
          <i className="pi pi-print text-6xl text-primary-500"></i>

          <Divider className="w-full" />

          <p className="text-center">
            Para configurar la impresión térmica, descarga el certificado de
            seguridad e instálalo en QZ Tray.
          </p>

          {queryLoading ? (
            <div className="flex align-items-center gap-2">
              <ProgressSpinner style={{ width: "24px", height: "24px" }} />
              <span>Cargando certificado...</span>
            </div>
          ) : publicKey ? (
            <div className="w-full">
              <div className="flex flex-column gap-3 w-full">
                <div className="p-field">
                  <label htmlFor="publicKey" className="font-bold block mb-2">
                    Certificado Público:
                  </label>
                  <div className="p-inputgroup">
                    <textarea
                      id="publicKey"
                      value={publicKey}
                      readOnly
                      rows={6}
                      className="w-full p-2 border-1 surface-border border-round"
                      style={{
                        resize: "none",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-content-center">
                  <Button
                    label="Descargar Certificate.txt"
                    icon="pi pi-download"
                    onClick={downloadCertificate}
                    loading={loading}
                    className="p-button-primary"
                  />
                  <Button
                    label="Copiar al Portapapeles"
                    icon="pi pi-copy"
                    onClick={copyToClipboard}
                    className="p-button-outlined p-button-secondary"
                  />
                </div>
              </div>
            </div>
          ) : (
            <Message
              severity="warn"
              text="No se pudo cargar el certificado público"
              className="w-full"
            />
          )}

          <Divider className="w-full" />

          <div className="w-full">
            <h4>Instrucciones de Instalación:</h4>
            <ol className="text-sm text-color-secondary pl-3 mt-2">
              <li>
                Descarga el archivo <strong>certificate.txt</strong>
              </li>
              <li>Abre QZ Tray en tu computadora</li>
              <li>
                Ve a <strong>File → Settings → X.509 Certificates</strong>
              </li>
              <li>
                Haz clic en <strong>"Import Certificate File"</strong>
              </li>
              <li>
                Selecciona el archivo <strong>certificate.txt</strong>
              </li>
              <li>Reinicia QZ Tray</li>
            </ol>
          </div>

          <small className="text-color-secondary">
            Este certificado es necesario para la comunicación segura entre la
            aplicación y QZ Tray
          </small>
        </div>
      </Card>
    </div>
  );
}
