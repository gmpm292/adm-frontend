import React, { useState, useRef, useEffect } from "react";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { TabView, TabPanel } from "primereact/tabview";

import "../styles/IntegratedSalePage.css";

import { CustomerSection } from "../components/CustomerSection";
import { CustomerSearchSection } from "../components/CustomerSearchSection";
import { ProductSection } from "../components/ProductSection";
import { SaleSummary } from "../components/SaleSummary";
import { PublicistSection } from "../components/PublicistSection";
import { PaymentSection } from "../components/PaymentSection";
import { CREATE_SALE, UPDATE_SALE } from "../../sale/graphql/queries";
import { CREATE_CUSTOMER } from "../../customer/graphql/queries";
import { PendingSalesManager } from "../components/PendingSalesManager";
import { useAuthContext } from "../../../auth/components/AuthContext";
import PermissionGuard from "../../../../components/PermissionGuard";
import { GET_WORKERS } from "../../../payroll/worker/graphql/queries";

// Clave única para localStorage
const PENDING_SALES_STORAGE_KEY = "integrated_sales_pending_sales";

export function IntegratedSalePage() {
  const { user } = useAuthContext();
  const [currentSale, setCurrentSale] = useState(null);
  const [pendingSales, setPendingSales] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [customerSearchMode, setCustomerSearchMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useRef(null);

  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [createSale] = useMutation(CREATE_SALE);
  const [updateSale] = useMutation(UPDATE_SALE);

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
        })) || [];
      setSellers(workerOptions);
    },
  });

  // Obtener datos del usuario actual
  const currentUserBusinessId = user?.businessId;
  const currentUserOfficeId = user?.officeId;
  const currentUserRoles = user?.role || [];
  const isAdministrativeUser = ["SUPER", "PRINCIPAL"].some((role) =>
    currentUserRoles.includes(role)
  );

  // Cargar ventas pendientes del localStorage SOLO al iniciar - UNA VEZ
  useEffect(() => {
    const loadPendingSales = () => {
      try {
        const savedSales = localStorage.getItem(PENDING_SALES_STORAGE_KEY);
        console.log(
          "Cargando ventas pendientes desde localStorage:",
          savedSales
        );

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

  // Cargar vendedores AL INICIAR - SIEMPRE se cargan
  useEffect(() => {
    getWorkers({
      variables: {
        options: {
          take: 100,
        },
      },
    });
  }, [getWorkers]);

  // Guardar ventas pendientes en localStorage SOLO cuando realmente cambien
  useEffect(() => {
    if (!isInitialized) return;

    console.log("Guardando ventas pendientes en localStorage:", pendingSales);

    try {
      localStorage.setItem(
        PENDING_SALES_STORAGE_KEY,
        JSON.stringify(pendingSales)
      );
    } catch (error) {
      console.error("Error saving pending sales:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron guardar las ventas pendientes",
        life: 3000,
      });
    }
  }, [pendingSales, isInitialized]);

  // Función para actualizar una venta existente
  const handleUpdateSale = async () => {
    try {
      if (!currentSale.customerData) {
        throw new Error("Debe seleccionar o crear un cliente primero");
      }

      if (currentSale.saleDetails.length === 0) {
        throw new Error("Debe agregar al menos un producto");
      }

      // Determinar businessId y officeId según el tipo de usuario
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

      if (!businessId || !officeId) {
        throw new Error(
          "No se pudo determinar la empresa y oficina para la venta"
        );
      }

      // Calcular el nuevo total
      const newTotalAmount = currentSale.saleDetails.reduce(
        (sum, detail) => sum + detail.quantity * (detail.unitPrice || 0),
        0
      );

      const updateInput = {
        id: parseInt(createdSaleId || currentSale.createdSaleId),
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
        totalAmount: newTotalAmount,
        paymentMethod: paymentMethod,
        paymentDetails: null,
        invoiceNumber: currentSale.invoiceNumber || `INV-${Date.now()}`,
      };

      console.log("Actualizando venta:", updateInput);

      const { data } = await updateSale({
        variables: {
          updateSaleInput: updateInput,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Venta actualizada",
        detail: `Venta #${data.updateSale.id} actualizada correctamente`,
        life: 5000,
      });

      // Avanzar al paso 4 (pago)
      setCurrentSale((prev) => ({
        ...prev,
        currentStep: 4,
      }));
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al actualizar la venta: " + error.message,
        life: 5000,
      });
    }
  };

  // Función para crear una nueva venta
  const handleCreateSale = async () => {
    try {
      if (!currentSale.customerData) {
        throw new Error("Debe seleccionar o crear un cliente primero");
      }

      if (currentSale.saleDetails.length === 0) {
        throw new Error("Debe agregar al menos un producto");
      }

      // Determinar businessId y officeId según el tipo de usuario
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

      if (!businessId || !officeId) {
        throw new Error(
          "No se pudo determinar la empresa y oficina para la venta"
        );
      }

      // Preparar los detalles de la venta con publicistIds en cada detalle
      const saleDetails = currentSale.saleDetails.map((detail) => ({
        productId: parseInt(detail.productId),
        quantity: parseFloat(detail.quantity),
        publicistIds: currentSale.selectedPublicists || [],
      }));

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
        details: saleDetails,
      };

      console.log("Enviando venta:", saleInput);

      const { data } = await createSale({
        variables: {
          sale: saleInput,
        },
      });

      // Guardar el ID de la venta creada para el paso de pago
      const newSaleId = data.createSale.id;
      setCreatedSaleId(newSaleId);

      // Avanzar al paso 4 (pago) y guardar el saleId en el currentSale
      setCurrentSale((prev) => ({
        ...prev,
        currentStep: 4,
        createdSaleId: newSaleId,
        invoiceNumber: saleInput.invoiceNumber,
      }));

      // Eliminar de pendientes si existe
      const updatedPendingSales = pendingSales.filter(
        (sale) => sale.id !== currentSale.id
      );
      setPendingSales(updatedPendingSales);

      toast.current.show({
        severity: "success",
        summary: "Venta creada",
        detail: `Venta #${newSaleId} creada. Proceda al pago.`,
        life: 5000,
      });
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al crear la venta: " + error.message,
        life: 5000,
      });
    }
  };

  // Función unificada para crear o actualizar venta
  const handleSaveSale = async () => {
    const saleId = createdSaleId || currentSale?.createdSaleId;

    if (saleId) {
      // Si ya existe una venta, actualizar
      await handleUpdateSale();
    } else {
      // Si no existe, crear nueva
      await handleCreateSale();
    }
  };

  // Nueva venta
  const handleNewSale = () => {
    const newSale = {
      id: Date.now().toString(),
      customerData: null,
      saleDetails: [],
      selectedPublicists: [],
      selectedSeller: null,
      currentStep: 1,
      createdAt: new Date().toISOString(),
    };
    setCurrentSale(newSale);
    setCreatedSaleId(null);
    setCustomerSearchMode(false);
    setActiveTab(0);
  };

  // Cargar venta pendiente
  const handleLoadPendingSale = (sale) => {
    setCurrentSale(sale);
    // Si la venta está en el paso 4, restaurar el createdSaleId
    if (sale.currentStep === 4 && sale.createdSaleId) {
      setCreatedSaleId(sale.createdSaleId);
    } else {
      setCreatedSaleId(null);
    }
    setCustomerSearchMode(false);
    setActiveTab(0);
  };

  // Eliminar venta pendiente
  const handleDeletePendingSale = (saleId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta venta pendiente?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        const updatedSales = pendingSales.filter((sale) => sale.id !== saleId);
        setPendingSales(updatedSales);

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

  // Guardar venta actual como pendiente
  const handleSaveAsPending = () => {
    if (!currentSale) return;

    const saleToSave = {
      ...currentSale,
      createdSaleId: createdSaleId || currentSale.createdSaleId,
    };

    const existingIndex = pendingSales.findIndex(
      (sale) => sale.id === currentSale.id
    );
    let updatedSales;

    if (existingIndex >= 0) {
      updatedSales = [...pendingSales];
      updatedSales[existingIndex] = saleToSave;
    } else {
      updatedSales = [...pendingSales, saleToSave];
    }

    setPendingSales(updatedSales);

    toast.current.show({
      severity: "success",
      summary: "Venta guardada",
      detail: "Venta guardada como pendiente correctamente",
      life: 3000,
    });
  };

  // Atender otro cliente - Guarda la venta actual y crea una nueva
  const handleAttendAnotherCustomer = () => {
    if (!currentSale) return;

    // Guardar venta actual como pendiente
    handleSaveAsPending();

    // Crear nueva venta
    handleNewSale();

    toast.current.show({
      severity: "info",
      summary: "Nueva venta iniciada",
      detail: "Venta anterior guardada como pendiente",
      life: 3000,
    });
  };

  // Manejar creación de cliente
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

      const customerData = {
        id: data.createCustomer.id,
        ...customerInfo,
        fullName: `${customerInfo.name} ${customerInfo.lastName || ""}`.trim(),
      };

      setCurrentSale((prev) => ({
        ...prev,
        customerData,
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

  // Manejar selección de cliente existente
  const handleSelectExistingCustomer = (customer) => {
    const customerData = {
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
    };

    setCurrentSale((prev) => ({
      ...prev,
      customerData,
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

  // Cambiar entre modos de cliente
  const handleCustomerModeChange = (mode) => {
    setCustomerSearchMode(mode === "search");
  };

  // Manejar agregar producto
  const handleAddProduct = (productDetail) => {
    setCurrentSale((prev) => ({
      ...prev,
      saleDetails: [...prev.saleDetails, productDetail],
    }));
  };

  // Manejar eliminar producto
  const handleRemoveProduct = (index) => {
    setCurrentSale((prev) => ({
      ...prev,
      saleDetails: prev.saleDetails.filter((_, i) => i !== index),
    }));
  };

  // Cambiar paso
  const handleStepChange = (step) => {
    setCurrentSale((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  // Volver a selección de cliente
  const handleBackToCustomerSelection = () => {
    setCurrentSale((prev) => ({
      ...prev,
      currentStep: 1,
    }));
    setCustomerSearchMode(true);
  };

  // Manejar cambio de publicistas
  const handlePublicistsChange = (publicists) => {
    setCurrentSale((prev) => ({
      ...prev,
      selectedPublicists: publicists,
    }));
  };

  // Manejar cambio de vendedor
  const handleSellerChange = (seller) => {
    setCurrentSale((prev) => ({
      ...prev,
      selectedSeller: seller,
    }));
  };

  // Obtener información del vendedor seleccionado
  const getSelectedSellerInfo = () => {
    if (!currentSale?.selectedSeller) return null;
    const seller = sellers.find(
      (seller) => seller.value === currentSale.selectedSeller
    );
    return seller;
  };

  // Manejar validación exitosa del pago
  const handlePaymentValidated = (result, payments, newSale = false) => {
    if (newSale) {
      // Iniciar nueva venta
      handleNewSale();
    } else if (result && result.valid) {
      toast.current.show({
        severity: "success",
        summary: "Pago Procesado",
        detail: `Venta #${createdSaleId} completada exitosamente. Total: ${result.totalInBaseCurrency.toFixed(
          2
        )}`,
        life: 5000,
      });
    }
  };

  // Volver al paso 3 desde el paso 4
  const handleBackToStep3 = () => {
    setCurrentSale((prev) => ({
      ...prev,
      currentStep: 3,
    }));
  };

  const totalAmount =
    currentSale?.saleDetails?.reduce(
      (sum, detail) => sum + detail.quantity * (detail.unitPrice || 0),
      0
    ) || 0;

  const selectedSellerInfo = getSelectedSellerInfo();

  // Determinar si estamos editando una venta existente
  const isEditingExistingSale = createdSaleId || currentSale?.createdSaleId;

  return (
    <div className="integrated-sale-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card title="Venta Integrada - Gestión Completa">
        <div className="sale-management-header">
          <div className="header-actions">
            <Button
              label="Nueva Venta"
              icon="pi pi-plus"
              className="p-button-primary"
              onClick={handleNewSale}
            />
            <Button
              label="Guardar como Pendiente"
              icon="pi pi-save"
              className="p-button-help"
              onClick={handleSaveAsPending}
              disabled={!currentSale}
            />
            <Button
              label="Atender Otro Cliente"
              icon="pi pi-users"
              className="p-button-warning"
              onClick={handleAttendAnotherCustomer}
              disabled={!currentSale}
              tooltip="Guarda la venta actual y comienza una nueva"
            />
          </div>
        </div>

        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          {/* Pestaña de Venta Actual */}
          <TabPanel header="Venta Actual">
            {currentSale ? (
              <div className="sale-process">
                {/* Paso 1: Gestión de Cliente */}
                {currentSale.currentStep === 1 && (
                  <div className="customer-step">
                    <div className="step-header">
                      <h3>Paso 1: Selección del Cliente</h3>
                      {isEditingExistingSale && (
                        <div className="edit-badge">
                          <i className="pi pi-pencil text-blue-500 mr-2"></i>
                          <span>Editando venta existente</span>
                        </div>
                      )}
                    </div>

                    {/* Selector de modo cliente */}
                    <div className="customer-mode-selector">
                      <div className="mode-buttons">
                        <Button
                          label="Buscar Cliente Existente"
                          icon="pi pi-search"
                          className={
                            customerSearchMode
                              ? "p-button-primary"
                              : "p-button-outlined"
                          }
                          onClick={() => handleCustomerModeChange("search")}
                        />
                        <Button
                          label="Crear Nuevo Cliente"
                          icon="pi pi-user-plus"
                          className={
                            !customerSearchMode
                              ? "p-button-primary"
                              : "p-button-outlined"
                          }
                          onClick={() => handleCustomerModeChange("create")}
                        />
                      </div>
                    </div>

                    {/* Contenido según el modo seleccionado */}
                    {customerSearchMode ? (
                      <CustomerSearchSection
                        onSelectCustomer={handleSelectExistingCustomer}
                        onBack={() => setCustomerSearchMode(false)}
                      />
                    ) : (
                      <CustomerSection
                        initialData={currentSale.customerData}
                        onSubmit={handleCustomerSubmit}
                        onStepChange={handleStepChange}
                      />
                    )}
                  </div>
                )}

                {/* Paso 2: Agregar Productos */}
                {currentSale.currentStep === 2 && (
                  <div className="step-content">
                    <div className="step-header">
                      <div className="step-navigation">
                        <Button
                          icon="pi pi-arrow-left"
                          className="p-button-text"
                          onClick={handleBackToCustomerSelection}
                          label="Cambiar cliente"
                        />
                        {currentSale.customerData?.existingCustomer && (
                          <div className="customer-badge">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Cliente existente</span>
                          </div>
                        )}
                        {isEditingExistingSale && (
                          <div className="edit-badge">
                            <i className="pi pi-pencil text-blue-500 mr-2"></i>
                            <span>
                              Editando venta #
                              {createdSaleId || currentSale.createdSaleId}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3>Paso 2: Agregar Productos</h3>
                    </div>

                    <div className="product-management">
                      <ProductSection
                        onAddProduct={handleAddProduct}
                        saleDetails={currentSale.saleDetails}
                        onRemoveProduct={handleRemoveProduct}
                      />

                      <SaleSummary
                        saleDetails={currentSale.saleDetails}
                        totalAmount={totalAmount}
                        customer={currentSale.customerData}
                      />
                    </div>

                    <div className="navigation-buttons">
                      <Button
                        label="Continuar a Publicistas"
                        icon="pi pi-arrow-right"
                        onClick={() => handleStepChange(3)}
                        disabled={currentSale.saleDetails.length === 0}
                        className="p-button-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Paso 3: Publicistas y Vendedor */}
                {currentSale.currentStep === 3 && (
                  <div className="step-content">
                    <div className="step-header">
                      <div className="step-navigation">
                        <Button
                          icon="pi pi-arrow-left"
                          className="p-button-text"
                          onClick={() => handleStepChange(2)}
                          label="Volver a productos"
                        />
                        {currentSale.customerData?.existingCustomer && (
                          <div className="customer-badge">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Cliente existente</span>
                          </div>
                        )}
                        {isEditingExistingSale && (
                          <div className="edit-badge">
                            <i className="pi pi-pencil text-blue-500 mr-2"></i>
                            <span>
                              Editando venta #
                              {createdSaleId || currentSale.createdSaleId}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3>Paso 3: Asignación de Publicistas y Vendedor</h3>
                    </div>

                    <PublicistSection
                      selectedPublicists={currentSale.selectedPublicists}
                      onPublicistsChange={handlePublicistsChange}
                      selectedSeller={currentSale.selectedSeller}
                      onSellerChange={handleSellerChange}
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={setPaymentMethod}
                      currentUserBusinessId={currentUserBusinessId}
                      currentUserOfficeId={currentUserOfficeId}
                      sellers={sellers}
                    />

                    <div className="final-summary">
                      <SaleSummary
                        saleDetails={currentSale.saleDetails}
                        totalAmount={totalAmount}
                        customer={currentSale.customerData}
                      />

                      <div>
                        <PermissionGuard
                          requiredRoles={["SUPER", "PRINCIPAL", "ADMIN"]}
                          showFallback
                          fallback={
                            <div className="sale-info-note mb-3">
                              <div className="p-message p-message-info">
                                <div className="p-message-wrapper">
                                  <span className="p-message-icon pi pi-info-circle"></span>
                                  <div className="p-message-content">
                                    <p>
                                      <strong>Información de la venta:</strong>
                                      <br />
                                      Vendedor: Usted
                                      <br />
                                      Empresa: {currentUserBusinessId}
                                      <br />
                                      Oficina: {currentUserOfficeId}
                                      {isEditingExistingSale && (
                                        <>
                                          <br />
                                          <strong>
                                            Venta existente: #
                                            {createdSaleId ||
                                              currentSale.createdSaleId}
                                          </strong>
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        >
                          <div className="sale-info-note mb-3">
                            <div className="p-message p-message-info">
                              <div className="p-message-wrapper">
                                <span className="p-message-icon pi pi-info-circle"></span>
                                <div className="p-message-content">
                                  <p>
                                    <strong>Información de la venta:</strong>
                                    <br />
                                    {currentSale.selectedSeller &&
                                    selectedSellerInfo
                                      ? `Vendedor: ${selectedSellerInfo.label}`
                                      : "Vendedor: Usted"}
                                    <br />
                                    Empresa:{" "}
                                    {currentSale.selectedSeller &&
                                    selectedSellerInfo
                                      ? selectedSellerInfo.businessId
                                      : currentUserBusinessId}
                                    <br />
                                    Oficina:{" "}
                                    {currentSale.selectedSeller &&
                                    selectedSellerInfo
                                      ? selectedSellerInfo.officeId
                                      : currentUserOfficeId}
                                    {isEditingExistingSale && (
                                      <>
                                        <br />
                                        <strong>
                                          Venta existente: #
                                          {createdSaleId ||
                                            currentSale.createdSaleId}
                                        </strong>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PermissionGuard>
                      </div>

                      <div className="action-buttons">
                        <div className="flex justify-content-end">
                          <Button
                            label={
                              isEditingExistingSale
                                ? "Actualizar Venta y Proceder al Pago"
                                : "Crear Venta y Proceder al Pago"
                            }
                            icon={
                              isEditingExistingSale
                                ? "pi pi-refresh"
                                : "pi pi-credit-card"
                            }
                            className={
                              isEditingExistingSale
                                ? "p-button-warning"
                                : "p-button-success"
                            }
                            onClick={handleSaveSale}
                            size="normal"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 4: Procesar Pago */}
                {currentSale.currentStep === 4 && (
                  <div className="step-content">
                    <div className="step-header">
                      <div className="step-navigation">
                        <Button
                          icon="pi pi-arrow-left"
                          className="p-button-text"
                          onClick={handleBackToStep3}
                          label="Modificar venta"
                        />
                        {isEditingExistingSale && (
                          <div className="edit-badge">
                            <i className="pi pi-pencil text-blue-500 mr-2"></i>
                            <span>
                              Editando venta #
                              {createdSaleId || currentSale.createdSaleId}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3>Paso 4: Procesar Pago</h3>
                    </div>

                    <PaymentSection
                      saleId={createdSaleId || currentSale.createdSaleId}
                      totalAmount={totalAmount}
                      baseCurrency="USD"
                      onPaymentValidated={handlePaymentValidated}
                      onBack={handleBackToStep3}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="no-sale-selected">
                <div className="empty-state">
                  <i className="pi pi-shopping-cart empty-icon"></i>
                  <h3>No hay venta activa</h3>
                  <p>
                    Selecciona una venta pendiente o crea una nueva para
                    comenzar
                  </p>
                  <Button
                    label="Crear Nueva Venta"
                    icon="pi pi-plus"
                    className="p-button-primary"
                    onClick={handleNewSale}
                  />
                </div>
              </div>
            )}
          </TabPanel>

          {/* Pestaña de Ventas Pendientes */}
          <TabPanel header={`Ventas Pendientes (${pendingSales.length})`}>
            <PendingSalesManager
              pendingSales={pendingSales}
              onLoadSale={handleLoadPendingSale}
              onDeleteSale={handleDeletePendingSale}
              currentSaleId={currentSale?.id}
            />
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
}
