import { useCallback, useEffect, useRef, useState } from 'react';

const mapPrimeReactOperatorToBackend = (primeOperator) => {
  switch (primeOperator) {
    case 'startsWith': return 'START_WITH';
    case 'contains': return 'CONTAINS';
    case 'endsWith': return 'END_WITH';
    case 'equals': return 'EQUAL';
    case 'notEquals': return 'DISTINCT';
    case 'lt': return 'LESS_THAN';
    case 'lte': return 'LESS_EQUAL_THAN';
    case 'gt': return 'GREATER_THAN';
    case 'gte': return 'GREATER_EQUAL_THAN';
    default: return 'CONTAINS';
  }
};

const useDataTable = (onFetchData) => {
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [multiSortMeta, setMultiSortMeta] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });
  const isMounted = useRef(false);
  const prevParams = useRef(null);

  const buildFilters = useCallback((filters) => {
    return Object.entries(filters).map(([field, value]) => ({
      property: field,
      operator: 'CONTAINS',
      value: value,
      logicalOperator: 'OR'
    }));
  }, []);

  const buildSorts = useCallback((sortMeta) => {
    return sortMeta.map(sort => ({
      property: sort.field,
      direction: sort.order === 1 ? 'ASC' : 'DESC'
    }));
  }, []);

  const loadData = useCallback(() => {
    if (!isMounted.current || !onFetchData) return;

    const filters = buildFilters(columnFilters);
    const sorts = buildSorts(multiSortMeta);
    const params = {
      skip: lazyState.first,
      take: lazyState.rows,
      filters: filters,
      sorts: sorts
    };

    // Evitar llamadas duplicadas con los mismos parámetros
    if (JSON.stringify(params) !== JSON.stringify(prevParams.current)) {
      prevParams.current = params;
      onFetchData(params);
    }
  }, [lazyState, columnFilters, multiSortMeta, onFetchData, buildFilters, buildSorts]);

  const onPage = (event) => {
    setLazyState(prev => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: event.page,
    }));
  };

  const onSort = (event) => {
    setMultiSortMeta(
      event.multiSortMeta || 
      (event.sortField ? [{ field: event.sortField, order: event.sortOrder }] : [])
    );
  };

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
    setColumnFilters({});
    setLazyState(prev => ({ ...prev, first: 0 }));
  };

  const handleColumnFilterChange = (field, value) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      if (value && value.trim() !== '') {
        newFilters[field] = value;
      } else {
        delete newFilters[field];
      }
      return newFilters;
    });
    setLazyState(prev => ({ ...prev, first: 0 }));
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Usamos un efecto separado para manejar las llamadas a la API
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadData]);

  return {
    lazyState,
    globalFilterValue,
    columnFilters,
    multiSortMeta,
    onPage,
    onSort,
    onGlobalFilterChange,
    handleColumnFilterChange,
    loadData
  };
};

export default useDataTable;