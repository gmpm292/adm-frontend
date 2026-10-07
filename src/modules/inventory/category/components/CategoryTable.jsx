import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import { useHasRole } from "../../../../hooks/useHasRole";
import {
  DELETE_CATEGORIES,
  GET_CATEGORIES,
  RESTORE_CATEGORIES,
} from "../graphql/queries";
import { CategoryForm } from "./CategoryForm";

const nameColumn = {
  field: "name",
  header: "Nombre",
  sortable: true,
  filter: true,
  body: (row) => (
    <span className="flex flex-column">
      <span className="font-medium text-900">{row.name}</span>
      {row.description && (
        <small className="text-color-secondary">{row.description}</small>
      )}
    </span>
  ),
};

const businessColumn = {
  field: "business.name",
  header: "Empresa",
  sortable: true,
  filter: true,
  body: (row) => row.business?.name,
};

const productsColumn = {
  field: "productCount",
  header: "Productos",
  sortable: false,
  bodyClassName: "text-right",
  headerClassName: "text-right",
  body: (row) => row.productCount ?? 0,
};

export function CategoryTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL");
  const isSuper = hasRole("SUPER");
  // { category } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [fetchCategories, { loading, data, error }] = useLazyQuery(
    GET_CATEGORIES,
    { fetchPolicy: "network-only" }
  );
  const [removeCategories] = useMutation(DELETE_CATEGORIES);
  const [restoreCategories] = useMutation(RESTORE_CATEGORIES);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchCategories({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.categories?.data,
          totalCount: response?.categories?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchCategories]
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Categoría creada" : "Categoría actualizada",
      saved?.name
    );
  };

  const handleDelete = (row) => {
    if (row.productCount > 0) {
      notify(
        "warn",
        "No se puede eliminar",
        `«${row.name}» tiene ${row.productCount} producto(s): pásalos a otra categoría antes`
      );
      return;
    }
    confirmDialog({
      header: "Eliminar categoría",
      message: `Se eliminará la categoría «${row.name}». Puedes restaurarla después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeCategories({ variables: { ids: [row.id] } });
          notify("success", "Categoría eliminada", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });
  };

  const handleRestore = async (row) => {
    try {
      await restoreCategories({ variables: { ids: [row.id] } });
      notify("success", "Categoría restaurada", row.name);
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) =>
    !canEdit ? null : row.deletedAt ? (
      <div className="actions-column">
        <Button
          icon="pi pi-history"
          text
          rounded
          severity="success"
          tooltip="Restaurar categoría"
          tooltipOptions={{ position: "top" }}
          aria-label="Restaurar categoría"
          onClick={() => handleRestore(row)}
        />
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Editar categoría"
          tooltipOptions={{ position: "top" }}
          aria-label="Editar categoría"
          onClick={() => setForm({ category: row })}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Eliminar categoría"
          tooltipOptions={{ position: "top" }}
          aria-label="Eliminar categoría"
          onClick={() => handleDelete(row)}
        />
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={
          isSuper
            ? [nameColumn, businessColumn, productsColumn]
            : [nameColumn, productsColumn]
        }
        data={data?.categories?.data}
        totalRecords={data?.categories?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "description"]}
        emptyMessage="No hay categorías"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "name", order: 1 }]}
        header={
          canEdit && (
            <Button
              label="Nueva categoría"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          )
        }
        showDeleted={canEdit}
      >
        {canEdit && (
          <Column
            body={actionBodyTemplate}
            header="Acciones"
            className="w-8rem"
          />
        )}
      </GenericDataTable>

      {form && (
        <CategoryForm
          category={form.category}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

export default CategoryTable;
