import React from 'react';
import { Button } from 'primereact/button';
import { usePrint } from '../../hooks/usePrint';
import { formatSaleData } from '../../utils/ticketFormatters';
import { Toast } from 'primereact/toast';

const VentaButton = ({ venta, template = 'default', onSuccess, onError }) => {
  const { printSale, printing, printerStatus } = usePrint();
  const toast = React.useRef();

  const handleVenta = async () => {
    try {
      // 1. Primero guardar la venta en la base de datos
      const ventaGuardada = await guardarVentaEnBackend(venta);
      
      // 2. Formatear datos para el ticket
      const ticketData = formatSaleData(ventaGuardada);
      
      // 3. Imprimir automáticamente
      await printSale(ticketData, template);
      
      // 4. Ejecutar callback de éxito
      if (onSuccess) onSuccess(ventaGuardada);
      
    } catch (error) {
      console.error('Error en proceso de venta:', error);
      if (onError) onError(error);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label={printing ? "Imprimiendo..." : "Finalizar Venta"}
        icon={printing ? "pi pi-spin pi-spinner" : "pi pi-check"}
        severity="success"
        size="large"
        onClick={handleVenta}
        disabled={printing || !printerStatus?.connected}
        tooltip={
          !printerStatus?.connected ? 
          "Impresora no disponible. Verifique la conexión." : 
          "Completar venta e imprimir ticket"
        }
        className="w-full"
      />
    </>
  );
};

export default VentaButton;