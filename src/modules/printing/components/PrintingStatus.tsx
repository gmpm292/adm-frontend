import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

interface PrintingStatusProps {
  isPrinting: boolean;
  error: string | null;
}

export const PrintingStatus: React.FC<PrintingStatusProps> = ({
  isPrinting,
  error,
}) => {
  if (isPrinting) {
    return (
      <div className="flex align-items-center gap-2">
        <ProgressSpinner strokeWidth="4" className="w-2rem h-2rem" />
        <span>Imprimiendo...</span>
      </div>
    );
  }

  if (error) {
    return <Message severity="error" text={error} className="w-full" />;
  }

  return null;
};
