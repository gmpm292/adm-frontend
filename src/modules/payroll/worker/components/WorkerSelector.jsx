import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { AutoComplete } from "primereact/autocomplete";
import { GET_WORKERS } from "../graphql/queries";
import { workerName, workerTypeLabel } from "../../format";

const workerText = (worker) =>
  [
    workerName(worker),
    worker.user?.email ?? worker.tempEmail,
    workerTypeLabel(worker.workerType),
    worker.office?.name,
    worker.department?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** Buscador de trabajadores (Asistencia y otros formularios de nómina) */
export const WorkerSelector = ({
  onWorkerSelected,
  selectedWorkerId = null,
  disabled = false,
  placeholder = "Buscar trabajador...",
  filters = [],
}) => {
  const { data, loading } = useQuery(GET_WORKERS, {
    variables: {
      options: {
        skip: 0,
        take: 500,
        filters,
        sorts: [{ property: "tempFirstName", direction: "ASC" }],
      },
    },
    skip: disabled,
    fetchPolicy: "network-only",
  });
  const workers = data?.workers?.data ?? [];
  const [selected, setSelected] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setSelected(workers.find((w) => w.id === selectedWorkerId) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkerId, data]);

  const search = (event) => {
    const query = event.query.trim().toLowerCase();
    setSuggestions(
      (query
        ? workers.filter((worker) => workerText(worker).includes(query))
        : workers
      ).slice(0, 20),
    );
  };

  return (
    <AutoComplete
      value={selected}
      suggestions={suggestions}
      completeMethod={search}
      field={workerName}
      itemTemplate={(worker) => (
        <span className="flex flex-column">
          <span className="font-medium">{workerName(worker)}</span>
          <small className="text-color-secondary">
            {[workerTypeLabel(worker.workerType), worker.office?.name]
              .filter(Boolean)
              .join(" · ")}
          </small>
        </span>
      )}
      onChange={(e) => {
        // Mientras se escribe llega texto; solo un trabajador es selección
        if (typeof e.value === "string") {
          setSelected(e.value);
          return;
        }
        setSelected(e.value);
        onWorkerSelected?.(e.value);
      }}
      dropdown
      dropdownMode="blank"
      placeholder={loading ? "Cargando trabajadores..." : placeholder}
      disabled={disabled}
      emptyMessage="Ningún trabajador coincide"
      showEmptyMessage
      forceSelection
      className="w-full"
      inputClassName="w-full"
    />
  );
};
