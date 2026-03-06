import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { AutoComplete } from "primereact/autocomplete";
import { GET_WORKERS } from "../graphql/queries";

/**
 * Función para obtener el nombre completo del trabajador
 * @param {Object} worker - Objeto trabajador
 * @returns {string} - Nombre completo del trabajador
 */
const getWorkerFullName = (worker) => {
  if (!worker) return "";

  if (worker.user && worker.user.name) {
    const fullName =
      `${worker.user.name || ""} ${worker.user.lastName || ""}`.trim();
    if (fullName) return fullName;
  }

  if (worker.tempFirstName || worker.tempLastName) {
    const tempFullName =
      `${worker.tempFirstName || ""} ${worker.tempLastName || ""}`.trim();
    if (tempFullName) return tempFullName;
  }

  if (worker.user && worker.user.email) {
    return worker.user.email;
  }

  if (worker.tempEmail) {
    return worker.tempEmail;
  }

  if (worker.id) {
    return `Trabajador #${worker.id}`;
  }

  return "Sin nombre";
};

/**
 * Componente para seleccionar trabajadores con búsqueda
 */
export const WorkerSelector = ({
  onWorkerSelected,
  selectedWorkerId = null,
  disabled = false,
  placeholder = "Buscar trabajador...",
  filters = {},
}) => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [getWorkers] = useLazyQuery(GET_WORKERS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const workersData = data?.workers?.data || [];
      setWorkers(workersData);
      setFilteredWorkers(workersData.slice(0, 10));
      setLoading(false);
      setInitialLoadDone(true);
    },
    onError: (error) => {
      console.error("Error al cargar trabajadores:", error);
      setLoading(false);
    },
  });

  // Cargar trabajadores iniciales solo una vez
  useEffect(() => {
    if (!disabled && !initialLoadDone) {
      setLoading(true);
      getWorkers({
        variables: {
          options: {
            take: 50,
            filters,
            sorts: [{ property: "user.lastName", direction: "ASC" }],
          },
        },
      });
    }
  }, [disabled, filters, getWorkers, initialLoadDone]);

  // Sincronizar trabajador seleccionado cuando cambia selectedWorkerId
  useEffect(() => {
    if (selectedWorkerId && workers.length > 0) {
      const worker = workers.find((w) => w.id === selectedWorkerId);
      if (worker) {
        setSelectedWorker(worker);
      }
    } else if (!selectedWorkerId) {
      setSelectedWorker(null);
    }
  }, [selectedWorkerId, workers]);

  const searchWorkers = (event) => {
    const query = event.query.toLowerCase();

    if (query.trim() === "") {
      setFilteredWorkers(workers.slice(0, 10));
      return;
    }

    const filtered = workers.filter((worker) => {
      const fullName = getWorkerFullName(worker).toLowerCase();
      const email = (
        worker.user?.email ||
        worker.tempEmail ||
        ""
      ).toLowerCase();
      const workerType = (worker.workerType || "").toLowerCase();
      const department = (worker.department?.name || "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        workerType.includes(query) ||
        department.includes(query)
      );
    });

    setFilteredWorkers(filtered.slice(0, 20));
  };

  const handleWorkerSelect = (event) => {
    const worker = event.value;
    setSelectedWorker(worker);

    if (onWorkerSelected) {
      onWorkerSelected(worker);
    }
  };

  const itemTemplate = (worker) => {
    if (!worker) return null;

    const fullName = getWorkerFullName(worker);
    const workerType = worker.workerType;
    const departmentName = worker.department?.name || "Sin departamento";

    return (
      <div className="flex align-items-center justify-content-between w-full">
        <div className="flex flex-column">
          <span className="font-medium">{fullName}</span>
          <div className="flex align-items-center gap-2 mt-1">
            {workerType && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {workerType}
              </span>
            )}
            {departmentName !== "Sin departamento" && (
              <span className="text-xs text-color-secondary">
                <i className="pi pi-building mr-1"></i>
                {departmentName}
              </span>
            )}
          </div>
          {worker.user?.email && (
            <div className="text-xs text-color-secondary mt-1">
              <i className="pi pi-envelope mr-1"></i>
              {worker.user.email}
            </div>
          )}
        </div>
        {worker.user?.enabled === false && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">
            Inactivo
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="worker-selector">
      <AutoComplete
        value={selectedWorker}
        suggestions={filteredWorkers}
        completeMethod={searchWorkers}
        field={getWorkerFullName}
        dropdown
        dropdownMode="blank"
        placeholder={placeholder}
        itemTemplate={itemTemplate}
        onChange={handleWorkerSelect}
        disabled={disabled}
        className="w-full"
        inputClassName="w-full"
        emptyMessage="No se encontraron trabajadores"
        loading={loading}
        forceSelection
      />
    </div>
  );
};
