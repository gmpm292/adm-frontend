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
    case 'is': return 'EQUAL';
    case 'isNot': return 'DISTINCT';
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
    const result = [];
    
    Object.entries(filters).forEach(([field, filterData]) => {
      if (!filterData?.constraints) return;
      
      const filtersForField = filterData.constraints
        .filter(constraint => constraint.value !== null && constraint.value !== '')
        .map(constraint => ({
          property: field,
          operator: mapPrimeReactOperatorToBackend(constraint.matchMode),
          value: String(constraint.value),
          logicalOperator: filterData.operator === 'and' ? 'AND' : 'OR'
        }));
      
      if (filtersForField.length > 0) {
        result.push(...filtersForField);
      }
    });

    return result;
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
    setLazyState(prev => ({ ...prev, first: 0 }));
  };

  const onFilter = (e) => {
    setColumnFilters(e.filters);
    setLazyState(prev => ({ ...prev, first: 0 }));
  };

  useEffect(() => {
    isMounted.current = true;
    loadData(); // Carga inicial
    return () => {
      isMounted.current = false;
    };
  }, []);

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
    onFilter,
    loadData
  };
};

export default useDataTable;