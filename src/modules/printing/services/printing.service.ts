import { ApolloClient } from "@apollo/client";
import { GET_QZ_PUBLIC_KEY, SIGN_QZ_REQUEST } from "../graphql/queries";

declare global {
  interface Window {
    qz: any;
  }
}

export interface PrintData {
  type: "TICKET" | "WARRANTY" | "RECEIPT" | "CUSTOM" | "MOVEMENT";
  content: string[];
  config?: {
    copies?: number;
    cutAfterPrint?: boolean;
    encoding?: string;
  };
}

export class PrintingService {
  private static instance: PrintingService;
  private isInitialized = false;
  private apolloClient: ApolloClient<any>;

  private constructor(apolloClient: ApolloClient<any>) {
    this.apolloClient = apolloClient;
  }

  static getInstance(apolloClient?: ApolloClient<any>): PrintingService {
    if (!PrintingService.instance && apolloClient) {
      PrintingService.instance = new PrintingService(apolloClient);
    }
    return PrintingService.instance;
  }

  /**
   * Inicializa QZ Tray con la configuración del backend
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized || !window.qz) {
        console.warn("QZ Tray no está disponible en el navegador");
        return false;
      }

      // Obtener certificado público del backend
      qz.security.setCertificatePromise(async () => {
        const { data } = await this.apolloClient.query({
          query: GET_QZ_PUBLIC_KEY,
          fetchPolicy: "network-only",
        });
        return data.getQZPublicKey.publicKey;
      });

      // Configurar firma de requests
      qz.security.setSignaturePromise((toSign: string) => {
        return async (
          resolve: (signature: string) => void,
          reject: (error: any) => void,
        ) => {
          try {
            const { data } = await this.apolloClient.mutate({
              mutation: SIGN_QZ_REQUEST,
              variables: { request: toSign },
            });
            resolve(data.signQZRequest);
          } catch (error) {
            reject(error);
          }
        };
      });

      this.isInitialized = true;
      console.log("✅ PrintingService inicializado correctamente");
      return true;
    } catch (error) {
      console.error("❌ Error inicializando PrintingService:", error);
      return false;
    }
  }

  /**
   * Obtiene la impresora por defecto
   */
  async getDefaultPrinter(): Promise<string | null> {
    try {
      await qz.websocket.connect();
      const printer = await qz.printers.getDefault();
      await qz.websocket.disconnect();
      return printer;
    } catch (error) {
      console.error("Error obteniendo impresora por defecto:", error);
      return null;
    }
  }

  /**
   * Obtiene lista de impresoras disponibles
   */
  async getAvailablePrinters(): Promise<string[]> {
    try {
      await qz.websocket.connect();
      const printers = await qz.printers.find();
      await qz.websocket.disconnect();
      return printers;
    } catch (error) {
      console.error("Error obteniendo impresoras:", error);
      return [];
    }
  }

  /**
   * Imprime contenido en la impresora térmica
   */
  async print(printData: PrintData): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error("PrintingService no pudo inicializarse");
        }
      }

      await qz.websocket.connect();

      // Obtener impresora por defecto
      const printer = await qz.printers.getDefault();
      if (!printer) {
        throw new Error("No se encontró impresora por defecto");
      }

      const config = qz.configs.create(printer, {
        copies: printData.config?.copies || 1,
      });

      // Preparar datos para impresión
      const data = [
        ...printData.content,
        ...(printData.config?.cutAfterPrint !== false ? ["\n\n\n\n"] : []), // Espacio para corte
      ];

      await qz.print(config, data);
      await qz.websocket.disconnect();

      console.log("✅ Contenido impreso correctamente");
      return true;
    } catch (error) {
      console.error("❌ Error al imprimir:", error);
      await qz.websocket.disconnect().catch(() => {});
      return false;
    }
  }

  /**
   * Imprime un ticket de venta
   */
  async printTicket(ventaData: {
    numeroVenta: string;
    fecha: string;
    productos: Array<{
      nombre: string;
      cantidad: number;
      precio: number;
    }>;
    total: number;
    cliente?: string;
    vendedor: string;
  }): Promise<boolean> {
    const content = this.formatTicketContent(ventaData);
    return this.print({
      type: "TICKET",
      content,
      config: { cutAfterPrint: true },
    });
  }

  /**
   * Imprime un ticket de movimiento de inventario
   */
  async printMovement(movementData: {
    numeroMovimiento: string;
    fecha: string;
    tipo: string;
    cantidad: number;
    motivo: string;
    producto?: string;
    ubicacion?: string;
    usuario?: string;
  }): Promise<boolean> {
    const content = this.formatMovementContent(movementData);
    return this.print({
      type: "MOVEMENT",
      content,
      config: { cutAfterPrint: true },
    });
  }

  /**
   * Imprime una garantía
   */
  async printWarranty(garantiaData: {
    numeroGarantia: string;
    fecha: string;
    producto: string;
    cliente: string;
    vendedor: string;
    duracion: string;
    condiciones: string[];
  }): Promise<boolean> {
    const content = this.formatWarrantyContent(garantiaData);
    return this.print({
      type: "WARRANTY",
      content,
      config: { cutAfterPrint: true },
    });
  }

  /**
   * Formatea contenido para ticket
   */
  private formatTicketContent(ventaData: any): string[] {
    const lines = [
      "********************************",
      "         TIENDA XYZ",
      "********************************",
      `Venta: ${ventaData.numeroVenta}`,
      `Fecha: ${ventaData.fecha}`,
      `Vendedor: ${ventaData.vendedor}`,
      ...(ventaData.cliente ? [`Cliente: ${ventaData.cliente}`] : []),
      "--------------------------------",
      "Producto      Cant.   Precio",
      "--------------------------------",
    ];

    // Productos
    ventaData.productos.forEach((producto: any) => {
      const nombre = producto.nombre.substring(0, 12).padEnd(12);
      const cantidad = producto.cantidad.toString().padEnd(4);
      const precio = `$${producto.precio.toFixed(2)}`;
      lines.push(`${nombre} ${cantidad} ${precio}`);
    });

    // Total
    lines.push(
      "--------------------------------",
      `TOTAL: $${ventaData.total.toFixed(2)}`,
      "********************************",
      "     ¡Gracias por su compra!",
      "********************************",
    );

    return lines.map((line) => line + "\n");
  }

  /**
   * Formatea contenido para ticket de movimiento
   */
  private formatMovementContent(movementData: any): string[] {
    const lines = [
      "********************************",
      "    MOVIMIENTO DE INVENTARIO",
      "********************************",
      `N°: ${movementData.numeroMovimiento}`,
      `Fecha: ${movementData.fecha}`,
      `Tipo: ${movementData.tipo}`,
      `Cantidad: ${movementData.cantidad}`,
      `Motivo: ${movementData.motivo}`,
    ];

    if (movementData.producto) {
      lines.push(`Producto: ${movementData.producto}`);
    }

    if (movementData.ubicacion) {
      lines.push(`Ubicación: ${movementData.ubicacion}`);
    }

    if (movementData.usuario) {
      lines.push(`Usuario: ${movementData.usuario}`);
    }

    lines.push(
      "********************************",
      "      ¡Operación exitosa!",
      "********************************",
    );

    return lines.map((line) => line + "\n");
  }

  /**
   * Formatea contenido para garantía
   */
  private formatWarrantyContent(garantiaData: any): string[] {
    const lines = [
      "********************************",
      "        GARANTÍA",
      "********************************",
      `Garantía: ${garantiaData.numeroGarantia}`,
      `Fecha: ${garantiaData.fecha}`,
      `Producto: ${garantiaData.producto}`,
      `Cliente: ${garantiaData.cliente}`,
      `Vendedor: ${garantiaData.vendedor}`,
      `Duración: ${garantiaData.duracion}`,
      "--------------------------------",
      "CONDICIONES:",
      ...garantiaData.condiciones.map((cond: string) => `• ${cond}`),
      "--------------------------------",
      "Firma del cliente:",
      "__________________",
      "********************************",
    ];

    return lines.map((line) => line + "\n");
  }
}
