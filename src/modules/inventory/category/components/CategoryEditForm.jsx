import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CATEGORY_BY_ID, UPDATE_CATEGORY } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { useRef } from "react";

export const CategoryEditForm = ({
  categoryId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const toast = useRef(null);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  const { loading, error } = useQuery(GET_CATEGORY_BY_ID, {
    variables: { id: categoryId },
    skip: !categoryId,
    onCompleted: (data) => {
      if (data?.category) {
        setFormData({
          name: data.category.name || "",
          description: data.category.description || "",
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await updateCategory({
        variables: {
          category: {
            id: categoryId,
            ...formData,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Categoría actualizada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Categoría"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar categoría</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="name">Nombre</label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="p-field">
              <label htmlFor="description">Descripción</label>
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
