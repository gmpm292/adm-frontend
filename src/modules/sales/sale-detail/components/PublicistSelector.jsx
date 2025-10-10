import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_WORKERS } from "../../../payroll/worker/graphql/queries";
import { Chip } from "primereact/chip";

export const PublicistSelector = ({
  selectedPublicistIds = [],
  onPublicistsChange,
  label = "Publicistas",
  disabled = false,
}) => {
  const [workers, setWorkers] = useState([]);
  const [getWorkers] = useLazyQuery(GET_WORKERS, {
    onCompleted: (data) => {
      const workerOptions =
        data?.workers?.data
          ?.filter((worker) => worker.user) // ✅ Filtrar workers que tengan usuario
          ?.map((worker) => ({
            label: `${worker.user.name} ${worker.user.lastName || ""} (${
              worker.user.email
            })`, // ✅ Usar user.name y user.lastName
            value: worker.id, // ✅ Usar el worker.id
            worker,
          })) || [];
      setWorkers(workerOptions);
    },
  });

  useEffect(() => {
    getWorkers({
      variables: {
        options: {
          take: 100,
        },
      },
    });
  }, [getWorkers]);

  const handleAddPublicist = (selectedWorker) => {
    if (selectedWorker && !selectedPublicistIds.includes(selectedWorker)) {
      const newPublicistIds = [...selectedPublicistIds, selectedWorker];
      onPublicistsChange(newPublicistIds);
    }
  };

  const handleRemovePublicist = (publicistId) => {
    const newPublicistIds = selectedPublicistIds.filter(
      (id) => id !== publicistId
    );
    onPublicistsChange(newPublicistIds);
  };

  const getSelectedPublicists = () => {
    console.log("selectedPublicistIds: ", selectedPublicistIds);
    const data = selectedPublicistIds
      .map((id) => {
        const worker = workers.find((w) => w.value === id);
        return worker ? { id: worker.value, name: worker.label } : null;
      })
      .filter(Boolean);
    return data;
  };

  return (
    <div className="p-field">
      <label htmlFor="publicists">{label}</label>

      <Dropdown
        id="publicists"
        options={workers.filter(
          (worker) => !selectedPublicistIds.includes(worker.value)
        )}
        onChange={(e) => handleAddPublicist(e.value)}
        optionLabel="label"
        placeholder="Seleccionar publicista..."
        disabled={disabled}
        filter
      />

      {selectedPublicistIds.length > 0 && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-2">
            Publicistas seleccionados:
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedPublicists().map((publicist) => (
              <Chip
                key={publicist.id}
                label={publicist.name}
                removable
                onRemove={() => handleRemovePublicist(publicist.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
