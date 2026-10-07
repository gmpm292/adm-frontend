import { ApolloClient } from "@apollo/client";
import { GET_QZ_PUBLIC_KEY, SIGN_QZ_REQUEST } from "../graphql/queries";

declare global {
  interface Window {
    qz: any;
  }
}

export interface PrintData {
  type: "TICKET" | "MOVEMENT" | "TEST";
  content: string[];
  config?: {
    copies?: number;
    cutAfterPrint?: boolean;
    encoding?: string;
  };
}

/** Centra un texto en el ancho del papel (32 caracteres) */
const center = (text: string) =>
  text.length >= 32
    ? text.substring(0, 32)
    : " ".repeat(Math.floor((32 - text.length) / 2)) + text;

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
    tienda?: string;
    numeroVenta: string;
    fecha: string;
    productos: Array<{
      nombre: string;
      cantidad: number;
      precio: number;
      moneda: string;
    }>;
    total: number;
    moneda: string;
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
   * Formatea contenido para ticket
   */
  private formatTicketContent(ventaData: any): string[] {
    const amount = (value: number, currency: string) =>
      `${Number(value).toFixed(2)} ${currency}`;
    const lines = [
      "********************************",
      center(ventaData.tienda || "COMPROBANTE DE VENTA"),
      "********************************",
      `Venta: ${ventaData.numeroVenta}`,
      `Fecha: ${ventaData.fecha}`,
      `Vendedor: ${ventaData.vendedor}`,
      ...(ventaData.cliente ? [`Cliente: ${ventaData.cliente}`] : []),
      "--------------------------------",
    ];

    // Una línea por producto: cantidad y nombre, y debajo el precio
    ventaData.productos.forEach((producto: any) => {
      lines.push(
        `${producto.cantidad} x ${producto.nombre}`.substring(0, 32),
        `${amount(producto.precio, producto.moneda)}`.padStart(32),
      );
    });

    lines.push(
      "--------------------------------",
      `TOTAL: ${amount(ventaData.total, ventaData.moneda)}`,
      "********************************",
      center("¡Gracias por su compra!"),
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
}
