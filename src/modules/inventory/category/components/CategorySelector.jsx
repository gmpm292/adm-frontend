import React from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_CATEGORIES } from "../graphql/queries";
import { useEffect, useState } from "react";

export const CategorySelector = ({ selectedCategoryId, onCategorySelect }) => {
  const [getCategories, { data, loading }] = useLazyQuery(GET_CATEGORIES, {
    variables: { options: { take: 1000 } },
    fetchPolicy: "network-only",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (data?.categories?.data && selectedCategoryId) {
      const category = data.categories.data.find(
        (c) => c.id === selectedCategoryId
      );
      setSelectedCategory(category);
    }
  }, [data, selectedCategoryId]);

  const handleChange = (e) => {
    setSelectedCategory(e.value);
    onCategorySelect(e.value || null);
  };

  return (
    <Dropdown
      value={selectedCategory}
      options={data?.categories?.data || []}
      onChange={handleChange}
      optionLabel="name"
      placeholder="Seleccione una categoría"
      loading={loading}
      filter
      filterBy="name,description"
      showClear
    />
  );
};
