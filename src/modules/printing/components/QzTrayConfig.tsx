import { useRef } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { EmptyState, FormField, FormSection } from "../../../components/ui";
import { getErrorMessage } from "../../../utils/errors";
import { GET_QZ_PUBLIC_KEY } from "../graphql/queries";
import { usePrinting } from "../hooks/usePrinting";

/** Certificado que QZ Tray necesita en cada equipo que imprime */
export function QzTrayConfig() {
  const toast = useRef<Toast>(null);
  const { data, loading, error } = useQuery(GET_QZ_PUBLIC_KEY, {
    fetchPolicy: "network-only",
  });
  const publicKey = data?.getQZPublicKey?.publicKey;
  const { printTest, isPrinting } = usePrinting();

  const testPrint = async () => {
    const printed = await printTest();
    toast.current?.show(
      printed
        ? {
            severity: "success",
            summary: "Prueba enviada a la impresora",
            life: 4000,
          }
        : {
            severity: "error",
            summary: "No se pudo imprimir",
            detail:
              "Comprueba que QZ Tray está abierto, confía en el certificado y hay una impresora por defecto",
            life: 8000,
          },
    );
  };

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([publicKey], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "certificate.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      toast.current?.show({
        severity: "success",
        summary: "Certificado copiado",
        life: 4000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "No se pudo copiar",
        detail: "Usa el botón Descargar",
        life: 6000,
      });
    }
  };

  if (loading) {
    return (
      <EmptyState
        icon="pi pi-spin pi-spinner"
        title="Cargando el certificado..."
      />
    );
  }

  return (
    <Card>
      <Toast ref={toast} />
      {error ? (
        <Message
          severity="error"
          text={getErrorMessage(error)}
          className="w-full"
        />
      ) : !publicKey ? (
        <Message
          severity="warn"
          text="Falta el certificado. Pega el certificado y la clave privada de QZ Tray en Configuración, grupo «Impresión térmica (QZ Tray)»."
          className="w-full justify-content-start mb-3"
        />
      ) : (
        <>
          <FormField label="Certificado público" htmlFor="qz-public-key">
            <InputTextarea
              id="qz-public-key"
              value={publicKey}
              readOnly
              rows={6}
              className="ui-code-input"
            />
          </FormField>
          <div className="flex flex-wrap gap-2 mt-3 mb-3">
            <Button
              label="Descargar"
              icon="pi pi-download"
              onClick={download}
            />
            <Button
              label="Copiar"
              icon="pi pi-copy"
              severity="secondary"
              outlined
              onClick={copy}
            />
            <Button
              label="Imprimir prueba"
              icon="pi pi-print"
              severity="secondary"
              outlined
              onClick={testPrint}
              loading={isPrinting}
            />
          </div>
        </>
      )}

      <FormSection title="Cómo instalarlo en cada equipo que imprime">
        <ol className="text-color-secondary pl-3 m-0 line-height-3">
          <li>Descarga el certificado (certificate.txt).</li>
          <li>
            Abre QZ Tray y entra en <strong>Advanced → Site Manager</strong>.
          </li>
          <li>
            Pulsa <strong>+</strong> y elige el archivo descargado.
          </li>
          <li>Deja una impresora por defecto en el equipo.</li>
        </ol>
      </FormSection>
    </Card>
  );
}
