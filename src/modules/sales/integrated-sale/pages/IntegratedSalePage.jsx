import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { TabView, TabPanel } from "primereact/tabview";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";

import { PageHeader, EmptyState } from "../../../../components/ui";

import { CustomerSection } from "../components/CustomerSection";
import { CustomerSearchSection } from "../components/CustomerSearchSection";
import { ProductSection } from "../components/ProductSection";
import { PaymentSection } from "../components/PaymentSection";
import { CREATE_SALE, UPDATE_SALE } from "../../sale/graphql/queries";
import { CREATE_CUSTOMER } from "../../customer/graphql/queries";

import { PendingSalesManager } from "../components/PendingSalesManager";
import { useAuthContext } from "../../../auth/components/AuthContext";
import { GET_WORKERS } from "../../../payroll/worker/graphql/queries";
import {
  CREATE_SALE_DETAIL,
  DELETE_SALE_DETAILS,
  UPDATE_SALE_DETAIL,
} from "../../sale-detail/graphql/queries";

// Clave única para localStorage
const PENDING_SALES_STORAGE_KEY = "integrated_sales_pending_sales";

const CUSTOMER_MODE_OPTIONS = [
  { label: "Buscar Cliente Existente", value: "search", icon: "pi pi-search" },
  { label: "Crear Nuevo Cliente", value: "create", icon: "pi pi-user-plus" },
];

const customerModeTemplate = (option) => (
  <span className="flex align-items-center gap-2">
    <i className={option.icon} />
    <span>{option.label}</span>
  </span>
);

const STEP_HEADER_CLASS =
  "flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom-1 surface-border";
const STEP_TITLE_CLASS = "m-0 text-lg font-semibold text-900";

export function IntegratedSalePage() {
  const { user } = useAuthContext();
  const [currentSale, setCurrentSale] = useState(null);
  const [pendingSales, setPendingSales] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [customerSearchMode, setCustomerSearchMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [deliveryWorkers, setDeliveryWorkers] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useRef(null);

  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [createSale] = useMutation(CREATE_SALE);
  const [updateSale] = useMutation(UPDATE_SALE);
  const [createSaleDetail] = useMutation(CREATE_SALE_DETAIL);
  const [updateSaleDetail] = useMutation(UPDATE_SALE_DETAIL);
  const [deleteSaleDetails] = useMutation(DELETE_SALE_DETAILS);

  const [getWorkers] = useLazyQuery(GET_WORKERS, {
    onCompleted: (data) => {
      const workerOptions =
        data?.workers?.data?.map((worker) => ({
          label: `${worker.user?.name || worker.name} (${
            worker.user?.email || worker.email
          })`,
          value: worker.id,
          businessId: worker.business?.id,
          officeId: worker.office?.id,
          workerType: worker.workerType,
        })) || [];
      setSellers(workerOptions);
      setDeliveryWorkers(workerOptions);
    },
  });

  const currentUserBusinessId = user?.business?.id ?? user?.businessId;
  const currentUserOfficeId = user?.office?.id ?? user?.officeId;
  const currentUserRoles = user?.role || [];
  const isAdministrativeUser = ["SUPER", "PRINCIPAL"].some((role) =>
    currentUserRoles.includes(role),
  );

  // Obtener el saleId actual (de createdSaleId o de currentSale)
  const getSaleId = () => createdSaleId || currentSale?.createdSaleId;

  useEffect(() => {
    const loadPendingSales = () => {
      try {
        const savedSales = localStorage.getItem(PENDING_SALES_STORAGE_KEY);
        if (savedSales) {
          const parsedSales = JSON.parse(savedSales);
          setPendingSales(Array.isArray(parsedSales) ? parsedSales : []);
        } else {
          setPendingSales([]);
        }
      } catch (error) {
        console.error("Error loading pending sales:", error);
        setPendingSales([]);
      } finally {
        setIsInitialized(true);
      }
    };
    loadPendingSales();
  }, []);

  useEffect(() => {
    getWorkers({
      variables: { options: { take: 100 } },
    });
  }, [getWorkers]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        PENDING_SALES_STORAGE_KEY,
        JSON.stringify(pendingSales),
      );
    } catch (error) {
      console.error("Error saving pending sales:", error);
    }
  }, [pendingSales, isInitialized]);

  // AGREGAR PRODUCTO
  const handleAddProduct = async (productDetail) => {
    const saleId = getSaleId();

    if (saleId) {
      // La venta ya existe en backend: crear detalle inmediatamente
      try {
        const { data } = await createSaleDetail({
          variables: {
            saleDetail: {
              saleId: parseInt(saleId),
              productId: parseInt(productDetail.productId),
              quantity: parseFloat(productDetail.quantity),
              publicistIds: currentSale.selectedPublicists || [],
            },
          },
        });

        // Guardar el id devuelto por el backend
        const detailWithId = {
          ...productDetail,
          id: data?.createSaleDetail?.id,
        };

        setCurrentSale((prev) => ({
          ...prev,
          saleDetails: [...prev.saleDetails, detailWithId],
        }));

        toast.current.show({
          severity: "success",
          summary: "Producto agregado",
          detail: `${productDetail.productName} agregado correctamente`,
          life: 2000,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error al agregar producto: " + error.message,
          life: 3000,
        });
      }
    } else {
      // Venta nueva: solo actualizar estado local
      setCurrentSale((prev) => ({
        ...prev,
        saleDetails: [...prev.saleDetails, productDetail],
      }));
    }
  };

  // ELIMINAR PRODUCTO
  const handleRemoveProduct = async (index) => {
    const detailToRemove = currentSale.saleDetails[index];
    const saleId = getSaleId();

    // Si el detalle tiene id, eliminarlo en backend
    if (saleId && detailToRemove.id) {
      try {
        await deleteSaleDetails({
          variables: { ids: [parseInt(detailToRemove.id)] },
        });

        toast.current.show({
          severity: "info",
          summary: "Producto eliminado",
          detail: "Producto eliminado correctamente",
          life: 2000,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error al eliminar producto: " + error.message,
          life: 3000,
        });
        return; // No actualizar estado local si falló el backend
      }
    }

    // Actualizar estado local
    setCurrentSale((prev) => ({
      ...prev,
      saleDetails: prev.saleDetails.filter((_, i) => i !== index),
    }));
  };

  // ACTUALIZAR CANTIDAD
  const handleUpdateQuantity = async (index, newQuantity) => {
    if (!newQuantity || newQuantity < 1) return;

    const detail = currentSale.saleDetails[index];
    const saleId = getSaleId();

    // Si el detalle tiene id, actualizar en backend
    if (saleId && detail.id) {
      try {
        await updateSaleDetail({
          variables: {
            saleDetail: {
              id: parseInt(detail.id),
              quantity: parseFloat(newQuantity),
            },
          },
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error al actualizar cantidad: " + error.message,
          life: 3000,
        });
        return; // No actualizar estado local si falló el backend
      }
    }

    // Actualizar estado local
    setCurrentSale((prev) => {
      const updatedDetails = [...prev.saleDetails];
      updatedDetails[index] = {
        ...updatedDetails[index],
        quantity: newQuantity,
        subtotal: newQuantity * (updatedDetails[index].unitPrice || 0),
      };
      return { ...prev, saleDetails: updatedDetails };
    });
  };

  // Crear nueva venta en backend
  const handleCreateSale = async () => {
    if (!currentSale.customerData) {
      throw new Error("Debe seleccionar o crear un cliente primero");
    }
    if (currentSale.saleDetails.length === 0) {
      throw new Error("Debe agregar al menos un producto");
    }

    let businessId, officeId, salesWorkerId;

    if (isAdministrativeUser && currentSale.selectedSeller) {
      const selectedSeller = getSelectedSellerInfo();
      businessId = selectedSeller?.businessId || currentUserBusinessId;
      officeId = selectedSeller?.officeId || currentUserOfficeId;
      salesWorkerId = parseInt(currentSale.selectedSeller);
    } else {
      businessId = currentUserBusinessId;
      officeId = currentUserOfficeId;
      salesWorkerId = null;
    }

    const saleInput = {
      businessId: parseInt(businessId),
      officeId: parseInt(officeId),
      departmentId: currentSale.customerData.departmentId
        ? parseInt(currentSale.customerData.departmentId)
        : null,
      teamId: currentSale.customerData.teamId
        ? parseInt(currentSale.customerData.teamId)
        : null,
      salesWorkerId: salesWorkerId,
      customerId: parseInt(currentSale.customerData.id),
      paymentMethod: paymentMethod,
      paymentDetails: null,
      invoiceNumber: `INV-${Date.now()}`,
      details: currentSale.saleDetails.map((detail) => ({
        productId: parseInt(detail.productId),
        quantity: parseFloat(detail.quantity),
        publicistIds: currentSale.selectedPublicists || [],
      })),
      hasDelivery: currentSale.hasDelivery || false,
      deliveryWorkerId: currentSale.deliveryWorkerId || null,
      deliveryNotes: currentSale.deliveryNotes || null,
    };

    const { data } = await createSale({
      variables: { sale: saleInput },
    });

    const newSaleId = data.createSale.id;
    setCreatedSaleId(newSaleId);

    // Asignar id del backend a los detalles para futuras ediciones
    const backendDetails = data.createSale.details || [];
    const updatedDetails = currentSale.saleDetails.map((detail) => {
      const backendDetail = backendDetails.find(
        (bd) => bd.product?.id === parseInt(detail.productId),
      );
      return {
        ...detail,
        id: backendDetail ? backendDetail.id : detail.id,
      };
    });

    setCurrentSale((prev) => ({
      ...prev,
      currentStep: 3,
      createdSaleId: newSaleId,
      invoiceNumber: saleInput.invoiceNumber,
      saleDetails: updatedDetails,
    }));

    const updatedPendingSales = pendingSales.filter(
      (sale) => sale.id !== currentSale.id,
    );
    setPendingSales(updatedPendingSales);

    toast.current.show({
      severity: "success",
      summary: "Venta creada",
      detail: `Venta #${newSaleId} creada. Proceda al pago.`,
      life: 5000,
    });

    return newSaleId;
  };

  // Actualizar datos generales de la venta
  const updateSaleGeneralData = async () => {
    const saleId = parseInt(getSaleId());

    let businessId, officeId, salesWorkerId;
    if (isAdministrativeUser && currentSale.selectedSeller) {
      const selectedSeller = getSelectedSellerInfo();
      businessId = selectedSeller?.businessId || currentUserBusinessId;
      officeId = selectedSeller?.officeId || currentUserOfficeId;
      salesWorkerId = parseInt(currentSale.selectedSeller);
    } else {
      businessId = currentUserBusinessId;
      officeId = currentUserOfficeId;
      salesWorkerId = null;
    }

    // Preparar variables solo con los campos necesarios
    const variables = {
      id: saleId,
      businessId: parseInt(businessId),
      officeId: parseInt(officeId),
      customerId: parseInt(currentSale.customerData?.id),
      paymentMethod: paymentMethod,
      invoiceNumber: currentSale.invoiceNumber || `INV-${Date.now()}`,
      hasDelivery: currentSale.hasDelivery || false,
      deliveryWorkerId: currentSale.deliveryWorkerId || null,
      deliveryNotes: currentSale.deliveryNotes || null,
    };

    // Solo agregar campos opcionales si tienen valor
    if (salesWorkerId) {
      variables.salesWorkerId = salesWorkerId;
    }
    if (currentSale.customerData?.departmentId) {
      variables.departmentId = parseInt(currentSale.customerData.departmentId);
    }
    if (currentSale.customerData?.teamId) {
      variables.teamId = parseInt(currentSale.customerData.teamId);
    }

    console.log("=== ACTUALIZANDO VENTA ===");
    console.log("Variables:", variables);

    await updateSale({
      variables: {
        sale: variables,
      },
    });
  };

  // Continuar al pago
  const handleContinueToPayment = async () => {
    try {
      const saleId = getSaleId();

      if (saleId) {
        // La venta ya existe: actualizar datos generales y navegar al paso 3
        await updateSaleGeneralData();

        toast.current.show({
          severity: "success",
          summary: "Venta actualizada",
          detail: "Datos generales actualizados correctamente",
          life: 2000,
        });

        setCurrentSale((prev) => ({ ...prev, currentStep: 3 }));
      } else {
        // La venta no existe: crearla en backend
        await handleCreateSale();
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 5000,
      });
    }
  };

  const handleNewSale = () => {
    setCurrentSale({
      id: Date.now().toString(),
      customerData: null,
      saleDetails: [],
      selectedPublicists: [],
      selectedSeller: null,
      currentStep: 1,
      createdAt: new Date().toISOString(),
      hasDelivery: false,
      deliveryWorkerId: null,
      deliveryNotes: "",
    });
    setCreatedSaleId(null);
    setCustomerSearchMode(false);
    setActiveTab(0);
  };

  const handleLoadPendingSale = (sale) => {
    const saleWithDelivery = {
      ...sale,
      hasDelivery: sale.hasDelivery || false,
      deliveryWorkerId: sale.deliveryWorkerId || null,
      deliveryNotes: sale.deliveryNotes || "",
    };
    setCurrentSale(saleWithDelivery);

    if (sale.currentStep === 3 && sale.createdSaleId) {
      setCreatedSaleId(sale.createdSaleId);
    } else {
      setCreatedSaleId(null);
    }
    setCustomerSearchMode(false);
    setActiveTab(0);
  };

  const handleDeletePendingSale = (saleId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta venta pendiente?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        setPendingSales(pendingSales.filter((sale) => sale.id !== saleId));
        if (currentSale && currentSale.id === saleId) {
          setCurrentSale(null);
          setCreatedSaleId(null);
        }
        toast.current.show({
          severity: "success",
          summary: "Venta eliminada",
          detail: "Venta pendiente eliminada correctamente",
          life: 3000,
        });
      },
    });
  };

  const handleSaveAsPending = () => {
    if (!currentSale) return;

    const saleToSave = {
      ...currentSale,
      createdSaleId: createdSaleId || currentSale.createdSaleId,
    };

    const existingIndex = pendingSales.findIndex(
      (sale) => sale.id === currentSale.id,
    );
    if (existingIndex >= 0) {
      const updatedSales = [...pendingSales];
      updatedSales[existingIndex] = saleToSave;
      setPendingSales(updatedSales);
    } else {
      setPendingSales([...pendingSales, saleToSave]);
    }

    toast.current.show({
      severity: "success",
      summary: "Venta guardada",
      detail: "Venta guardada como pendiente correctamente",
      life: 3000,
    });
  };

  const handleAttendAnotherCustomer = () => {
    if (!currentSale) return;
    handleSaveAsPending();
    handleNewSale();
    toast.current.show({
      severity: "info",
      summary: "Nueva venta iniciada",
      detail: "Venta anterior guardada como pendiente",
      life: 3000,
    });
  };

  const handleCustomerSubmit = async (customerInfo) => {
    try {
      const { data } = await createCustomer({
        variables: {
          customer: {
            name: customerInfo.name,
            lastName: customerInfo.lastName,
            ci: customerInfo.ci,
            email: customerInfo.email,
            phone: customerInfo.phone,
            businessId: customerInfo.businessId,
            officeId: customerInfo.officeId,
            departmentId: customerInfo.departmentId,
            teamId: customerInfo.teamId,
            additionalInfo: {},
          },
        },
      });

      setCurrentSale((prev) => ({
        ...prev,
        customerData: {
          id: data.createCustomer.id,
          ...customerInfo,
          fullName:
            `${customerInfo.name} ${customerInfo.lastName || ""}`.trim(),
        },
        currentStep: 2,
      }));
      setCustomerSearchMode(false);

      toast.current.show({
        severity: "success",
        summary: "Cliente creado",
        detail: "Cliente registrado exitosamente",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al crear el cliente: " + error.message,
        life: 5000,
      });
    }
  };

  const handleSelectExistingCustomer = (customer) => {
    setCurrentSale((prev) => ({
      ...prev,
      customerData: {
        id: customer.id,
        name: customer.name,
        lastName: customer.additionalInfo?.lastName || "",
        ci: customer.additionalInfo?.ci || "",
        email: customer.email,
        phone: customer.phone,
        businessId: customer.businessId,
        officeId: customer.officeId,
        departmentId: customer.departmentId,
        teamId: customer.teamId,
        fullName: customer.name,
        existingCustomer: true,
      },
      currentStep: 2,
    }));
    setCustomerSearchMode(false);

    toast.current.show({
      severity: "success",
      summary: "Cliente seleccionado",
      detail: `Cliente ${customer.name} seleccionado correctamente`,
      life: 3000,
    });
  };

  const handleCustomerModeChange = (mode) => {
    setCustomerSearchMode(mode === "search");
  };

  const handleBackToCustomerSelection = () => {
    setCurrentSale((prev) => ({ ...prev, currentStep: 1 }));
    setCustomerSearchMode(true);
  };

  const handlePublicistsChange = (publicists) => {
    setCurrentSale((prev) => ({ ...prev, selectedPublicists: publicists }));
  };

  const handleSellerChange = (seller) => {
    setCurrentSale((prev) => ({ ...prev, selectedSeller: seller }));
  };

  const handleHasDeliveryChange = (checked) => {
    setCurrentSale((prev) => ({
      ...prev,
      hasDelivery: checked,
      ...(checked === false && { deliveryWorkerId: null, deliveryNotes: "" }),
    }));
  };

  const handleDeliveryWorkerChange = (workerId) => {
    setCurrentSale((prev) => ({ ...prev, deliveryWorkerId: workerId }));
  };

  const handleDeliveryNotesChange = (notes) => {
    setCurrentSale((prev) => ({ ...prev, deliveryNotes: notes }));
  };

  const getSelectedSellerInfo = () => {
    if (!currentSale?.selectedSeller) return null;
    return sellers.find(
      (seller) => seller.value === currentSale.selectedSeller,
    );
  };

  const handlePaymentValidated = (result, payments, newSale = false) => {
    if (newSale) {
      handleNewSale();
    }
  };

  const handleBackToStep2 = () => {
    setCurrentSale((prev) => ({ ...prev, currentStep: 2 }));
  };

  const totalAmount =
    currentSale?.saleDetails?.reduce(
      (sum, detail) => sum + detail.quantity * (detail.unitPrice || 0),
      0,
    ) || 0;

  const isEditingExistingSale = createdSaleId || currentSale?.createdSaleId;

  const editingSaleNumber = createdSaleId || currentSale?.createdSaleId;

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        title="Venta integrada"
        subtitle="Atiende al cliente de principio a fin: cliente, productos y pago."
      >
        <Button
          label="Guardar como Pendiente"
          icon="pi pi-save"
          severity="secondary"
          onClick={handleSaveAsPending}
          disabled={!currentSale}
        />
        <Button
          label="Atender Otro Cliente"
          icon="pi pi-users"
          severity="secondary"
          onClick={handleAttendAnotherCustomer}
          disabled={!currentSale}
          tooltip="Guarda la venta actual y comienza una nueva"
        />
        <Button label="Nueva Venta" icon="pi pi-plus" onClick={handleNewSale} />
      </PageHeader>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        <TabPanel header="Venta Actual">
          {currentSale ? (
            <>
              {currentSale.currentStep === 1 && (
                <>
                  <div className={STEP_HEADER_CLASS}>
                    <h3 className={STEP_TITLE_CLASS}>
                      Paso 1: Selección del Cliente
                    </h3>
                    {isEditingExistingSale && (
                      <Tag
                        severity="info"
                        icon="pi pi-pencil"
                        value="Editando venta existente"
                      />
                    )}
                  </div>
                  <div className="flex justify-content-center mb-5">
                    <SelectButton
                      value={customerSearchMode ? "search" : "create"}
                      options={CUSTOMER_MODE_OPTIONS}
                      itemTemplate={customerModeTemplate}
                      allowEmpty={false}
                      onChange={(e) => handleCustomerModeChange(e.value)}
                    />
                  </div>
                  {customerSearchMode ? (
                    <CustomerSearchSection
                      onSelectCustomer={handleSelectExistingCustomer}
                      onBack={() => setCustomerSearchMode(false)}
                    />
                  ) : (
                    <CustomerSection
                      initialData={currentSale.customerData}
                      onSubmit={handleCustomerSubmit}
                      onStepChange={() => {}}
                    />
                  )}
                </>
              )}

              {currentSale.currentStep === 2 && (
                <>
                  <div className={STEP_HEADER_CLASS}>
                    <h3 className={STEP_TITLE_CLASS}>
                      Paso 2: Configurar Venta
                    </h3>
                    {isEditingExistingSale && (
                      <Tag
                        severity="info"
                        icon="pi pi-pencil"
                        value={`Editando venta #${editingSaleNumber}`}
                      />
                    )}
                  </div>
                  <ProductSection
                    onAddProduct={handleAddProduct}
                    saleDetails={currentSale.saleDetails}
                    onRemoveProduct={handleRemoveProduct}
                    onUpdateQuantity={handleUpdateQuantity}
                    customer={currentSale.customerData}
                    selectedPublicists={currentSale.selectedPublicists}
                    onPublicistsChange={handlePublicistsChange}
                    selectedSeller={currentSale.selectedSeller}
                    onSellerChange={handleSellerChange}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    sellers={sellers}
                    currentUserBusinessId={currentUserBusinessId}
                    currentUserOfficeId={currentUserOfficeId}
                    isAdministrativeUser={isAdministrativeUser}
                    hasDelivery={currentSale.hasDelivery}
                    onHasDeliveryChange={handleHasDeliveryChange}
                    deliveryWorkerId={currentSale.deliveryWorkerId}
                    onDeliveryWorkerChange={handleDeliveryWorkerChange}
                    deliveryNotes={currentSale.deliveryNotes}
                    onDeliveryNotesChange={handleDeliveryNotesChange}
                    deliveryWorkers={deliveryWorkers}
                    onBackToCustomer={handleBackToCustomerSelection}
                    onContinueToPayment={handleContinueToPayment}
                    isEditingExistingSale={isEditingExistingSale}
                    createdSaleId={createdSaleId || currentSale.createdSaleId}
                  />
                </>
              )}

              {currentSale.currentStep === 3 && (
                <>
                  <div className={STEP_HEADER_CLASS}>
                    <div className="flex flex-wrap align-items-center gap-3">
                      <Button
                        icon="pi pi-arrow-left"
                        text
                        severity="secondary"
                        onClick={handleBackToStep2}
                        label="Modificar venta"
                      />
                      {isEditingExistingSale && (
                        <Tag
                          severity="info"
                          icon="pi pi-pencil"
                          value={`Editando venta #${editingSaleNumber}`}
                        />
                      )}
                    </div>
                    <h3 className={STEP_TITLE_CLASS}>Paso 3: Procesar Pago</h3>
                  </div>
                  <PaymentSection
                    saleId={createdSaleId || currentSale.createdSaleId}
                    totalAmount={totalAmount}
                    baseCurrency="USD"
                    onPaymentValidated={handlePaymentValidated}
                    onBack={handleBackToStep2}
                  />
                </>
              )}
            </>
          ) : (
            <EmptyState
              icon="pi pi-shopping-cart"
              title="No hay venta activa"
              actions={
                <Button
                  label="Crear Nueva Venta"
                  icon="pi pi-plus"
                  outlined
                  onClick={handleNewSale}
                />
              }
            >
              <p className="m-0">
                Selecciona una venta pendiente o crea una nueva para comenzar
              </p>
            </EmptyState>
          )}
        </TabPanel>

        <TabPanel header={`Ventas Pendientes (${pendingSales.length})`}>
          <PendingSalesManager
            pendingSales={pendingSales}
            onLoadSale={handleLoadPendingSale}
            onDeleteSale={handleDeletePendingSale}
            currentSaleId={currentSale?.id}
          />
        </TabPanel>
      </TabView>
    </>
  );
}
