import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { EmptyState, FormField } from "../../../../components/ui";
import { useHasRole } from "../../../../hooks/useHasRole";
import { getErrorMessage } from "../../../../utils/errors";
import { useAuthContext } from "../../../auth/components/AuthContext";
import { GET_OFFICE_OPTIONS } from "../../../company/shared/queries";
import { formatQuantity, reasonLabel } from "../../format";
import {
  GET_INVENTORY_SHEET,
  LOAD_INVENTORY,
  SEND_INVENTORY,
} from "../graphql/queries";

const MODES = [
  { label: "Cargar existencias", value: "load", icon: "pi pi-download" },
  { label: "Enviar a otra oficina", value: "send", icon: "pi pi-send" },
];

/** Opción de «Qué quieres hacer» con su icono */
const modeTemplate = (option) => (
  <span className="flex align-items-center gap-2">
    <i className={option.icon} />
    {option.label}
  </span>
);

const LOAD_REASONS = [
  "INITIAL_INVENTORY",
  "PURCHASE",
  "RETURN",
  "INVENTORY_ADJUSTMENT",
  "OTHER",
].map((value) => ({ label: reasonLabel(value), value }));

const EMPTY = <span className="text-color-secondary">—</span>;

/** Texto sin tildes ni mayúsculas, para buscar */
const plain = (text) =>
  (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Hoja de inventario: todos los productos de la empresa en una oficina, con
 * una casilla de cantidad en cada uno. Se escriben las cantidades de los que
 * se quieran y se guardan de una vez, como entrada en la oficina o como envío
 * a otra oficina de la empresa. Un producto que nunca estuvo en la oficina
 * (o en el destino) se abre solo al guardar.
 */
export function InventorySheet() {
  const toast = useRef(null);
  const { user } = useAuthContext();
  const hasRole = useHasRole();
  // SUPER y PRINCIPAL eligen la oficina; un ADMIN trabaja con la suya
  const choosesOffice = hasRole("SUPER", "PRINCIPAL");
  const showsBusiness = hasRole("SUPER");

  const [officeId, setOfficeId] = useState(user?.office?.id ?? null);
  const [mode, setMode] = useState("load");
  const [toOfficeId, setToOfficeId] = useState(null);
  const [reason, setReason] = useState("PURCHASE");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  // Cantidad escrita en cada línea, por su clave (`i<inventario>` o `p<producto>`)
  const [quantities, setQuantities] = useState({});

  const { data: officeData, loading: loadingOffices } = useQuery(
    GET_OFFICE_OPTIONS,
    { skip: !choosesOffice },
  );
  const offices = choosesOffice
    ? (officeData?.offices?.data ?? [])
    : user?.office
      ? [user.office]
      : [];
  const currentOfficeId = officeId ?? offices[0]?.id ?? null;
  const sending = mode === "send";

  const { data, loading, error, refetch } = useQuery(GET_INVENTORY_SHEET, {
    variables: {
      officeId: currentOfficeId,
      toOfficeId: sending ? toOfficeId : null,
    },
    skip: !currentOfficeId,
    fetchPolicy: "network-only",
  });
  const [loadInventory, loadState] = useMutation(LOAD_INVENTORY);
  const [sendInventory, sendState] = useMutation(SEND_INVENTORY);
  const saving = loadState.loading || sendState.loading;

  const sheet = data?.inventorySheet;
  const destination = sheet?.destinations?.find((o) => o.id === toOfficeId);

  // Una línea por inventario (ubicación) del producto en la oficina; si no
  // tiene ninguno, una línea del producto, que se abrirá al cargar
  const lines = useMemo(
    () =>
      (sheet?.rows ?? []).flatMap((row) =>
        row.inventories.length
          ? row.inventories.map((inventory) => ({
              key: `i${inventory.id}`,
              inventoryId: inventory.id,
              product: row.product,
              location: inventory.location,
              stock: inventory.currentStock,
              destinationStock: row.destinationStock,
            }))
          : [
              {
                key: `p${row.product.id}`,
                productId: row.product.id,
                product: row.product,
                location: null,
                stock: 0,
                destinationStock: row.destinationStock,
                isNew: true,
              },
            ],
      ),
    [sheet],
  );

  const quantityOf = (line) => quantities[line.key] ?? null;
  const term = plain(search.trim());
  const visible = lines.filter(
    (line) =>
      // Solo se envía lo que hay
      (!sending || line.stock > 0) &&
      (!term ||
        plain(
          `${line.product.name} ${line.product.category?.name} ${line.location}`,
        ).includes(term)),
  );
  const chosen = lines.filter(
    (line) => quantityOf(line) > 0 && (!sending || line.stock > 0),
  );
  const tooMany = sending
    ? chosen.filter((line) => quantityOf(line) > line.stock)
    : [];
  const units = chosen.reduce((sum, line) => sum + quantityOf(line), 0);

  const problem = !chosen.length
    ? "Escribe la cantidad de al menos un producto"
    : sending && !destination
      ? "Elige la oficina de destino"
      : tooMany.length
        ? `No hay tanto de ${tooMany.map((line) => line.product.name).join(", ")}`
        : null;

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  // Cambiar de oficina o de acción empieza la hoja de cero
  const changeOffice = (value) => {
    setOfficeId(value);
    setToOfficeId(null);
    setQuantities({});
  };
  const changeMode = (value) => {
    if (!value) return;
    setMode(value);
    setQuantities({});
  };

  const save = async () => {
    const input = chosen.map((line) => ({
      inventoryId: line.inventoryId,
      productId: line.inventoryId ? undefined : line.productId,
      quantity: quantityOf(line),
    }));
    try {
      const { data: response } = sending
        ? await sendInventory({
            variables: {
              input: {
                fromOfficeId: currentOfficeId,
                toOfficeId,
                note: note.trim() || undefined,
                lines: input,
              },
            },
          })
        : await loadInventory({
            variables: {
              input: {
                officeId: currentOfficeId,
                reason,
                note: note.trim() || undefined,
                lines: input,
              },
            },
          });
      const result = response.sendInventory ?? response.loadInventory;
      const opened = result.createdInventories
        ? ` Se abrieron ${result.createdInventories} inventarios nuevos.`
        : "";
      notify(
        "success",
        sending ? `Enviado a ${destination.name}` : "Existencias cargadas",
        `${result.units} unidades de ${result.lines} productos.${opened}`,
      );
      setQuantities({});
      setNote("");
      refetch();
    } catch (err) {
      notify(
        "error",
        sending ? "No se envió nada" : "No se cargó nada",
        getErrorMessage(err),
      );
    }
  };

  const handleSave = () => {
    if (problem) return;
    if (!sending) {
      save();
      return;
    }
    confirmDialog({
      header: "Enviar a otra oficina",
      message: `Saldrán ${units} unidades (${chosen.length} productos) de ${sheet.office.name} y entrarán en ${destination.name}.`,
      icon: "pi pi-send",
      acceptLabel: "Enviar",
      rejectLabel: "Cancelar",
      accept: save,
    });
  };

  const officeLabel = (office) =>
    showsBusiness && office.business?.name
      ? `${office.name} · ${office.business.name}`
      : office.name;

  if (!loadingOffices && !offices.length) {
    return (
      <EmptyState icon="pi pi-building" title="No hay oficinas">
        <p className="m-0 text-color-secondary">
          Crea antes una oficina en Empresa para cargar sus existencias.
        </p>
      </EmptyState>
    );
  }

  const tableHeader = (
    <div className="ui-table-toolbar">
      <span className="ui-table-toolbar__search">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto, categoría o ubicación"
          aria-label="Buscar producto"
        />
      </span>
      <span className="text-color-secondary text-sm">
        {sending
          ? "Solo aparecen los productos con existencias en esta oficina"
          : "Los productos que no están en esta oficina se abren al guardar"}
      </span>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="formgrid grid">
        <div className="col-12 md:col-6 lg:col-3">
          <FormField label="Oficina" htmlFor="sheet-office">
            <Dropdown
              inputId="sheet-office"
              value={currentOfficeId}
              options={offices.map((office) => ({
                label: officeLabel(office),
                value: office.id,
              }))}
              onChange={(e) => changeOffice(e.value)}
              loading={loadingOffices}
              disabled={!choosesOffice || saving}
              filter={offices.length > 8}
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6 lg:col-4">
          <FormField label="Qué quieres hacer" htmlFor="sheet-mode">
            <Dropdown
              inputId="sheet-mode"
              value={mode}
              options={MODES}
              onChange={(e) => changeMode(e.value)}
              itemTemplate={modeTemplate}
              valueTemplate={(option) => option && modeTemplate(option)}
              disabled={saving}
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6 lg:col-2">
          {sending ? (
            <FormField label="Hacia" htmlFor="sheet-destination" required>
              <Dropdown
                inputId="sheet-destination"
                value={toOfficeId}
                options={(sheet?.destinations ?? []).map((office) => ({
                  label: office.name,
                  value: office.id,
                }))}
                onChange={(e) => setToOfficeId(e.value)}
                placeholder="Elige la oficina"
                emptyMessage="La empresa no tiene otra oficina"
                disabled={saving}
              />
            </FormField>
          ) : (
            <FormField label="Motivo" htmlFor="sheet-reason">
              <Dropdown
                inputId="sheet-reason"
                value={reason}
                options={LOAD_REASONS}
                onChange={(e) => setReason(e.value)}
                disabled={saving}
              />
            </FormField>
          )}
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <FormField label="Nota" htmlFor="sheet-note">
            <InputText
              id="sheet-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                sending
                  ? "Opcional: por qué se envía"
                  : "Opcional: factura, proveedor..."
              }
              maxLength={150}
              disabled={saving}
            />
          </FormField>
        </div>
      </div>

      {error && (
        <Message
          severity="error"
          text={getErrorMessage(error)}
          className="w-full mb-3"
        />
      )}

      <DataTable
        value={visible}
        dataKey="key"
        loading={loading}
        header={tableHeader}
        emptyMessage={
          sending
            ? "No hay productos con existencias en esta oficina"
            : "No hay productos: créalos antes en Productos"
        }
      >
        <Column
          header="Producto"
          body={(line) => (
            <span className="flex flex-column">
              <span className="font-medium text-900">{line.product.name}</span>
              <small className="text-color-secondary">
                {line.product.category?.name}
              </small>
            </span>
          )}
        />
        <Column
          header="Ubicación"
          body={(line) =>
            line.isNew ? (
              <Tag severity="info" value="No está en esta oficina" />
            ) : (
              line.location || EMPTY
            )
          }
        />
        <Column
          header="Hay aquí"
          bodyClassName="white-space-nowrap"
          body={(line) => formatQuantity(line.stock, line.product.unitOfMeasure)}
        />
        {sending && destination && (
          <Column
            header={`En ${destination.name}`}
            bodyClassName="white-space-nowrap"
            body={(line) =>
              formatQuantity(line.destinationStock, line.product.unitOfMeasure)
            }
          />
        )}
        <Column
          header={sending ? "Enviar" : "Cargar"}
          className="w-10rem"
          body={(line) => (
            <InputNumber
              value={quantityOf(line)}
              onValueChange={(e) =>
                setQuantities((current) => ({
                  ...current,
                  [line.key]: e.value || null,
                }))
              }
              min={0}
              suffix={
                line.product.unitOfMeasure?.symbol
                  ? ` ${line.product.unitOfMeasure.symbol}`
                  : undefined
              }
              placeholder="0"
              invalid={sending && quantityOf(line) > line.stock}
              disabled={saving}
              aria-label={`Cantidad de ${line.product.name}`}
              inputClassName="w-full"
            />
          )}
        />
      </DataTable>

      <div className="ui-action-bar">
        <span className="ui-action-bar__summary">
          {chosen.length
            ? `${chosen.length} productos · ${units} unidades`
            : "Escribe las cantidades en la columna de la derecha"}
          {chosen.length > 0 && problem && (
            <small className="ui-field__error block">{problem}</small>
          )}
        </span>
        <div className="ui-action-bar__end">
          <Button
            label="Vaciar"
            severity="secondary"
            onClick={() => setQuantities({})}
            disabled={!chosen.length || saving}
          />
          <Button
            label={
              sending
                ? destination
                  ? `Enviar a ${destination.name}`
                  : "Enviar"
                : "Guardar entrada"
            }
            icon={sending ? "pi pi-send" : "pi pi-check"}
            onClick={handleSave}
            loading={saving}
            disabled={!!problem}
          />
        </div>
      </div>
    </>
  );
}
