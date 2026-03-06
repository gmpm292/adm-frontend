import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_UNITS_OF_MEASURE } from "../graphql/queries";

export const useUnitsOfMeasure = (options = {}) => {
  const { onlyActive = true, category = null, take = 200 } = options;
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [getUnits] = useLazyQuery(GET_UNITS_OF_MEASURE, {
    onCompleted: (data) => {
      let unitsData = data?.unitOfMeasures?.data || [];

      if (onlyActive) {
        unitsData = unitsData.filter((unit) => unit.isActive);
      }

      if (category) {
        unitsData = unitsData.filter((unit) => unit.category === category);
      }

      setUnits(unitsData);
      setLoading(false);
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    getUnits({
      variables: {
        options: {
          take,
          sorts: [
            { property: "category", direction: "ASC" },
            { property: "name", direction: "ASC" },
          ],
        },
      },
    });
  }, [getUnits, take, category]);

  const getUnitById = (id) => {
    return units.find((unit) => unit.id === id);
  };

  const getUnitsByCategory = (categoryName) => {
    return units.filter((unit) => unit.category === categoryName);
  };

  const getActiveUnits = () => {
    return units.filter((unit) => unit.isActive);
  };

  const refreshUnits = () => {
    setLoading(true);
    getUnits({
      variables: {
        options: {
          take,
          sorts: [
            { property: "category", direction: "ASC" },
            { property: "name", direction: "ASC" },
          ],
        },
      },
    });
  };

  return {
    units,
    loading,
    error,
    getUnitById,
    getUnitsByCategory,
    getActiveUnits,
    refreshUnits,
  };
};
