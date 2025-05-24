import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useLazyQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries';
import { useEffect, useState } from 'react';

export const ProductSelector = ({ selectedProductId, onProductSelect }) => {
  const [getProducts, { data, loading }] = useLazyQuery(GET_PRODUCTS, {
    variables: { options: { take: 1000 } },
    fetchPolicy: 'network-only'
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  useEffect(() => {
    if (data?.products?.data && selectedProductId) {
      const product = data.products.data.find(p => p.id === selectedProductId);
      setSelectedProduct(product);
    }
  }, [data, selectedProductId]);

  const handleChange = (e) => {
    setSelectedProduct(e.value);
    onProductSelect(e.value?.id || null);
  };

  return (
    <Dropdown
      value={selectedProduct}
      options={data?.products?.data || []}
      onChange={handleChange}
      optionLabel="name"
      placeholder="Seleccione un producto"
      loading={loading}
      filter
      filterBy="name"
      showClear
    />
  );
};