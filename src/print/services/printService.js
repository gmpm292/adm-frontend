const PRINT_SERVICE_URL = 'http://localhost:3001/api/print';

class PrintService {
  constructor() {
    this.isServiceAvailable = false;
    this.checkServiceStatus();
  }

  async checkServiceStatus() {
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/health`);
      this.isServiceAvailable = response.ok;
      return this.isServiceAvailable;
    } catch (error) {
      this.isServiceAvailable = false;
      return false;
    }
  }

  async getPrinterStatus() {
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/status`);
      return await response.json();
    } catch (error) {
      return {
        connected: false,
        error: 'Servicio de impresión no disponible',
        online: false
      };
    }
  }

  async printTicket(ticketData) {
    const {
      type = 'VENTA',
      data,
      template = 'default',
      printerConfig = null
    } = ticketData;

    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          template,
          printerConfig
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error desconocido en impresión');
      }

      return result;
    } catch (error) {
      console.error('❌ Error en printService:', error);
      throw error;
    }
  }

  async printBatch(tickets) {
    try {
      const response = await fetch(`${PRINT_SERVICE_URL}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error imprimiendo lote:', error);
      throw error;
    }
  }

  // Métodos específicos para diferentes tipos de ticket
  async printSaleTicket(ventaData, template = 'default') {
    return await this.printTicket({
      type: 'VENTA',
      data: ventaData,
      template
    });
  }

  async printCashCut(corteData, template = 'default') {
    return await this.printTicket({
      type: 'CORTE_CAJA',
      data: corteData,
      template
    });
  }

  async printReturnTicket(devolucionData, template = 'default') {
    return await this.printTicket({
      type: 'DEVOLUCION',
      data: devolucionData,
      template
    });
  }

  async printPreSaleTicket(preVentaData, template = 'default') {
    return await this.printTicket({
      type: 'PREVENTA',
      data: preVentaData,
      template
    });
  }
}

// Instancia singleton
export const printService = new PrintService();
export default printService;