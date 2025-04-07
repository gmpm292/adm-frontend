import { useCallback, useEffect, useRef, useState } from 'react';

const useDataTable = () => {
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [multiSortMeta, setMultiSortMeta] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });
  const isMounted = useRef(false);

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

  const loadData = useCallback(() => {
    if (!isMounted.current) return;
    // Esta función ahora debe ser implementada por el componente padre
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
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