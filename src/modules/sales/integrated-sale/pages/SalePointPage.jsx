import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import {
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../../../../components/ui";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { getErrorMessage } from "../../../../utils/errors";
import { ParkedSalesDialog } from "../components/ParkedSalesDialog";
import { PaymentDialog } from "../components/PaymentDialog";
import { ProductCatalog } from "../components/ProductCatalog";
import { SaleReceiptDialog } from "../components/SaleReceiptDialog";
import { SaleTicket } from "../components/SaleTicket";
import {
  CHECKOUT_SALE,
  GET_SALE_CATALOG,
  QUOTE_SALE,
} from "../graphql/queries";
import {
  EMPTY_CART,
  cartReducer,
  estimateTotals,
  linesKey,
} from "../saleCart";

const PARKED_SALES_KEY = "pos.parkedSales";

const readParkedSales = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(PARKED_SALES_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

/**
 * Venta integrada: catálogo de la tienda y ticket en una sola pantalla. Se
 * tocan los productos, se elige (si hace falta) cliente y mensajería, y se
 * cobra; la venta se guarda ya cobrada en una sola operación.
 */
export function SalePointPage() {
  const toast = useRef(null);
  const [officeId, setOfficeId] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(null);
  const [cart, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const [parkedSales, setParkedSales] = useState(readParkedSales);
  const [showParked, setShowParked] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const {
    data,
    previousData,
    loading: loadingCatalog,
    error: catalogError,
    refetch: refetchCatalog,
  } = useQuery(GET_SALE_CATALOG, {
    variables: { officeId },
    fetchPolicy: "cache-and-network",
  });
  const catalog = (data ?? previousData)?.saleCatalog;
  const office = catalog?.office;

  const [checkout, { loading: saving }] = useMutation(CHECKOUT_SALE);

  useEffect(() => {
    try {
      localStorage.setItem(PARKED_SALES_KEY, JSON.stringify(parkedSales));
    } catch {
      // Sin almacenamiento local las ventas en espera duran lo que la pestaña
    }
  }, [parkedSales]);

  // Quien tiene trabajador propio vende a su nombre salvo que elija otro
  const ownWorkerId = catalog?.currentWorkerId ?? null;
  useEffect(() => {
    if (ownWorkerId && !cart.sellerId) {
      dispatch({ type: "set", values: { sellerId: ownWorkerId } });
    }
  }, [ownWorkerId, cart.sellerId]);

  const productsById = useMemo(
    () => new Map((catalog?.products ?? []).map((p) => [p.id, p])),
    [catalog],
  );
  const quantities = useMemo(
    () => new Map(cart.lines.map((line) => [line.productId, line.quantity])),
    [cart.lines],
  );

  // Líneas con su producto; las de un producto que ya no se vende se descartan
  const cartLines = useMemo(
    () =>
      cart.lines
        .map((line) => ({ ...line, product: productsById.get(line.productId) }))
        .filter((line) => line.product),
    [cart.lines, productsById],
  );

  const currency = displayCurrency ?? catalog?.defaultCurrency ?? null;

  // Cotización del backend: precios con sus reglas y disponibilidad real
  const quoteLines = useDebouncedValue(cart.lines);
  const { data: quoteData } = useQuery(QUOTE_SALE, {
    variables: {
      input: {
        details: quoteLines.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      },
    },
    skip: quoteLines.length === 0,
    fetchPolicy: "network-only",
  });
  const quote =
    quoteData?.quoteSale && linesKey(quoteLines) === linesKey(cart.lines)
      ? quoteData.quoteSale
      : null;

  const totals = quote?.totals ?? estimateTotals(cartLines);
  // Si algún producto no se vende en la moneda elegida, se cobra en otra
  const saleCurrency = totals.some((t) => t.currency === currency)
    ? currency
    : (totals[0]?.currency ?? currency);

  const lines = cartLines.map((line) => {
    const quoted = quote?.lines.find((l) => l.productId === line.productId);
    const price =
      quoted?.prices.find((p) => p.currency === saleCurrency) ??
      line.product.prices.find((p) => p.currency === saleCurrency) ??
      line.product.prices.find(
        (p) => p.currency === line.product.baseCurrency,
      ) ??
      line.product.prices[0];
    const stockError =
      line.quantity > line.product.stock
        ? line.product.stock > 0
          ? `Solo quedan ${line.product.stock}`
          : "Agotado"
        : null;

    return {
      ...line,
      currency: price.currency,
      unitPrice: price.unitPrice,
      subtotal: price.total ?? price.unitPrice * line.quantity,
      error: quoted?.error ?? stockError,
    };
  });

  const blockReason = !catalog
    ? null
    : totals.length === 0 && lines.length > 0
      ? "Estos productos no comparten ninguna moneda de cobro"
      : lines.some((line) => line.error)
        ? "Revisa los productos marcados antes de cobrar"
        : catalog.canChooseSeller && !cart.sellerId
          ? "Selecciona el vendedor"
          : !catalog.canChooseSeller && !catalog.currentWorkerId
            ? "Tu usuario no está vinculado a un trabajador: pide a un administrador que lo asocie"
            : cart.hasDelivery && !cart.deliveryWorkerId
              ? "Selecciona el mensajero o guarda la venta como borrador"
              : null;

  const officeParked = parkedSales.filter((s) => s.officeId === office?.id);

  const showError = (error, summary = "No se pudo completar") =>
    toast.current?.show({
      severity: "error",
      summary,
      detail: getErrorMessage(error),
      life: 6000,
    });

  const resetCart = () => dispatch({ type: "reset", sellerId: ownWorkerId });

  const forgetParked = (parkedId) =>
    setParkedSales((current) => current.filter((s) => s.parkedId !== parkedId));

  const buildSaleInput = () => ({
    businessId: office.businessId,
    officeId: office.id,
    salesWorkerId: catalog.canChooseSeller ? cart.sellerId : undefined,
    customerId: cart.customer?.id,
    details: cart.lines.map(({ productId, quantity }) => ({
      productId,
      quantity,
      publicistIds: cart.publicistIds,
    })),
    hasDelivery: cart.hasDelivery,
    deliveryWorkerId: cart.deliveryWorkerId ?? undefined,
    deliveryNotes: cart.deliveryNotes.trim() || undefined,
  });

  const handleAdd = (product) =>
    dispatch({ type: "add", productId: product.id, stock: product.stock });

  const handleConfirmPayment = async (payments, change) => {
    setPaymentError(null);
    try {
      const { data: result } = await checkout({
        variables: {
          sale: { ...buildSaleInput(), payments, baseCurrency: saleCurrency },
        },
      });
      const sellerName = catalog.workers.find(
        (worker) => worker.id === (cart.sellerId ?? ownWorkerId),
      )?.name;

      if (cart.parkedId) forgetParked(cart.parkedId);
      setPaying(false);
      setReceipt({ sale: result.createSale, change, sellerName });
      resetCart();
      refetchCatalog();
    } catch (error) {
      setPaymentError(getErrorMessage(error));
      // Lo más probable es que otro vendedor se llevara el producto
      refetchCatalog();
    }
  };

  const handleSaveDraft = async () => {
    try {
      const { data: result } = await checkout({
        variables: { sale: buildSaleInput() },
      });
      if (cart.parkedId) forgetParked(cart.parkedId);
      resetCart();
      refetchCatalog();
      toast.current?.show({
        severity: "success",
        summary: `Borrador #${result.createSale.id} guardado`,
        detail: "Los productos quedan reservados. Cóbralo desde Ventas.",
        life: 5000,
      });
    } catch (error) {
      showError(error, "No se pudo guardar el borrador");
      refetchCatalog();
    }
  };

  const parkCurrent = () => {
    if (cart.lines.length === 0) return;
    const parked = {
      ...cart,
      parkedId: cart.parkedId ?? Date.now(),
      officeId: office.id,
      savedAt: new Date().toISOString(),
    };
    setParkedSales((current) => [
      ...current.filter((s) => s.parkedId !== parked.parkedId),
      parked,
    ]);
  };

  const handlePark = () => {
    parkCurrent();
    resetCart();
    toast.current?.show({
      severity: "info",
      summary: "Venta en espera",
      detail: "Retómala cuando quieras desde «En espera».",
      life: 3000,
    });
  };

  // Retomar una venta aparta la que hubiera en curso: no se pierde nada
  const handleResume = (parked) => {
    parkCurrent();
    const { officeId: _officeId, savedAt: _savedAt, ...parkedCart } = parked;
    dispatch({ type: "load", cart: parkedCart });
    setShowParked(false);
  };

  const handleClear = () =>
    confirmDialog({
      header: "Vaciar la venta",
      message: "Se quitarán los productos, el cliente y la mensajería.",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Vaciar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: () => {
        if (cart.parkedId) forgetParked(cart.parkedId);
        resetCart();
      },
    });

  const changeOffice = (nextOfficeId) => {
    parkCurrent();
    resetCart();
    setOfficeId(nextOfficeId);
  };

  if (!catalog) {
    if (loadingCatalog) return <LoadingScreen message="Cargando la tienda..." />;
    return (
      <EmptyState
        icon="pi pi-exclamation-circle"
        title="No se pudo cargar la tienda"
        actions={
          <Button
            label="Reintentar"
            icon="pi pi-refresh"
            outlined
            onClick={() => refetchCatalog()}
          />
        }
      >
        <p className="m-0">{getErrorMessage(catalogError)}</p>
      </EmptyState>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        title="Venta integrada"
        subtitle={
          office
            ? [office.name, office.businessName].filter(Boolean).join(" · ")
            : "Vende, cobra y entrega en una sola pantalla."
        }
      >
        {catalog.offices.length > 1 && (
          <Dropdown
            value={office?.id}
            options={catalog.offices.map((o) => ({
              label: [o.name, o.businessName].filter(Boolean).join(" · "),
              value: o.id,
            }))}
            onChange={(e) => changeOffice(e.value)}
            filter={catalog.offices.length > 8}
            aria-label="Tienda"
          />
        )}
        <Button
          label="En espera"
          icon="pi pi-pause"
          severity="secondary"
          outlined
          badge={officeParked.length ? String(officeParked.length) : undefined}
          onClick={() => setShowParked(true)}
        />
      </PageHeader>

      {!office ? (
        <EmptyState icon="pi pi-building" title="No hay tienda donde vender">
          <p className="m-0">
            Tu usuario no tiene una oficina asignada. Pide a un administrador
            que te asocie a una.
          </p>
        </EmptyState>
      ) : (
        <>
          {catalogError && (
            <Message
              severity="warn"
              text="No se pudo actualizar el catálogo; las existencias pueden no estar al día."
              className="w-full mb-3"
            />
          )}
          <div className="pos">
            <ProductCatalog
              products={catalog.products}
              categories={catalog.categories}
              currencies={catalog.currencies}
              currency={currency}
              onCurrencyChange={setDisplayCurrency}
              quantities={quantities}
              onAdd={handleAdd}
            />
            <SaleTicket
              catalog={catalog}
              cart={cart}
              dispatch={dispatch}
              lines={lines}
              totals={totals}
              saleCurrency={saleCurrency}
              blockReason={blockReason}
              busy={saving}
              onCharge={() => {
                setPaymentError(null);
                setPaying(true);
              }}
              onPark={handlePark}
              onSaveDraft={handleSaveDraft}
              onClear={handleClear}
            />
          </div>
        </>
      )}

      {paying && (
        <PaymentDialog
          totals={totals}
          currency={saleCurrency}
          loading={saving}
          error={paymentError}
          onHide={() => setPaying(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
      {receipt && (
        <SaleReceiptDialog
          sale={receipt.sale}
          change={receipt.change}
          sellerName={receipt.sellerName}
          storeName={office?.businessName ?? office?.name}
          onNewSale={() => setReceipt(null)}
        />
      )}
      {showParked && (
        <ParkedSalesDialog
          sales={officeParked}
          productsById={productsById}
          onResume={handleResume}
          onRemove={forgetParked}
          onHide={() => setShowParked(false)}
        />
      )}
    </>
  );
}
