import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_MATERIAL_COSTS } from "../graphql/queries";

export const useMaterialCosts = (options = {}) => {
  const { onlyActive = true, take = 200 } = options;
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [getMaterials] = useLazyQuery(GET_MATERIAL_COSTS, {
    onCompleted: (data) => {
      let materialsData = data?.materialCosts?.data || [];

      if (onlyActive) {
        materialsData = materialsData.filter((material) => material.isActive);
      }

      setMaterials(materialsData);
      setLoading(false);
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    getMaterials({
      variables: {
        options: {
          take,
          sorts: [{ property: "name", direction: "ASC" }],
        },
      },
    });
  }, [getMaterials, take]);

  const getMaterialById = (id) => {
    return materials.find((material) => material.id === id);
  };

  const getMaterialsByUnit = (unitId) => {
    return materials.filter(
      (material) => material.unitOfMeasure?.id === unitId,
    );
  };

  const getMaterialsByCurrency = (currencyId) => {
    return materials.filter((material) => material.currency?.id === currencyId);
  };

  const getActiveMaterials = () => {
    return materials.filter((material) => material.isActive);
  };

  const refreshMaterials = () => {
    setLoading(true);
    getMaterials({
      variables: {
        options: {
          take,
          sorts: [{ property: "name", direction: "ASC" }],
        },
      },
    });
  };

  return {
    materials,
    loading,
    error,
    getMaterialById,
    getMaterialsByUnit,
    getMaterialsByCurrency,
    getActiveMaterials,
    refreshMaterials,
  };
};
