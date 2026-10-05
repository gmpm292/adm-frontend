import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FormField } from "../ui";
import {
  GET_BUSINESSES,
  GET_OFFICES,
  GET_DEPARTMENTS,
  GET_TEAMS,
  GET_PROFILE,
} from "./queries";
import { EntityTypes, EntityHierarchy } from "./entityTypes";

const SecurityEntitySelector = ({
  onSelectionChange,
  entitiesToInclude = EntityHierarchy,
}) => {
  // Validar las entidades a incluir
  const validEntities = entitiesToInclude.filter((entity) =>
    EntityHierarchy.includes(entity)
  );

  // Si no se especifican entidades, usamos todas por defecto
  const activeEntities =
    validEntities.length > 0 ? validEntities : EntityHierarchy;

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availableOffices, setAvailableOffices] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Determinar qué entidades están activas
  const includeBusiness = activeEntities.includes(EntityTypes.BUSINESS);
  const includeOffice = activeEntities.includes(EntityTypes.OFFICE);
  const includeDepartment = activeEntities.includes(EntityTypes.DEPARTMENT);
  const includeTeam = activeEntities.includes(EntityTypes.TEAM);

  // Obtener perfil del usuario
  const { data: profileData } = useQuery(GET_PROFILE);

  // Obtener todas las businesses (para SUPER)
  const { data: businessesData } = useQuery(GET_BUSINESSES, {
    variables: { options: { skip: 0, take: null } },
    skip: !includeBusiness || userProfile?.business,
  });

  // Obtener offices cuando se selecciona business o si el usuario tiene business
  const { data: officesData } = useQuery(GET_OFFICES, {
    variables: {
      options: {
        skip: 0,
        take: null,
        filters: selectedBusiness
          ? [
              {
                property: "businessId",
                operator: "EQUAL",
                value: String(selectedBusiness?.id),
              },
            ]
          : [],
      },
    },
    skip: !includeOffice || (!selectedBusiness && !userProfile?.business),
  });

  // Obtener departments cuando se selecciona office o si el usuario tiene office
  const { data: departmentsData } = useQuery(GET_DEPARTMENTS, {
    variables: {
      options: {
        skip: 0,
        take: null,
        filters: selectedOffice
          ? [
              {
                property: "officeId",
                operator: "EQUAL",
                value: String(selectedOffice?.id),
              },
            ]
          : [],
      },
    },
    skip: !includeDepartment || (!selectedOffice && !userProfile?.office),
  });

  // Obtener teams cuando se selecciona department o si el usuario tiene department
  const { data: teamsData } = useQuery(GET_TEAMS, {
    variables: {
      options: {
        skip: 0,
        take: null,
        filters: selectedDepartment
          ? [
              {
                property: "departmentId",
                operator: "EQUAL",
                value: String(selectedDepartment?.id),
              },
            ]
          : [],
      },
    },
    skip: !includeTeam || (!selectedDepartment && !userProfile?.department),
  });

  // Funciones de manejo de cambios con opción para vaciar
  const handleBusinessChange = (e) => {
    const newValue = e.value;
    setSelectedBusiness(newValue);

    // Si se vacía el business, vaciar todos los campos inferiores
    if (!newValue) {
      if (includeOffice) setSelectedOffice(null);
      if (includeDepartment) setSelectedDepartment(null);
      if (includeTeam) setSelectedTeam(null);
    }
  };

  const handleOfficeChange = (e) => {
    const newValue = e.value;
    setSelectedOffice(newValue);

    // Si se vacía el office, vaciar los campos inferiores
    if (!newValue) {
      if (includeDepartment) setSelectedDepartment(null);
      if (includeTeam) setSelectedTeam(null);
    }
  };

  const handleDepartmentChange = (e) => {
    const newValue = e.value;
    setSelectedDepartment(newValue);

    // Si se vacía el department, vaciar el team
    if (!newValue && includeTeam) {
      setSelectedTeam(null);
    }
  };

  const handleTeamChange = (e) => {
    setSelectedTeam(e.value);
  };

  // Función para limpiar un campo específico y sus dependientes
  const clearField = (field) => {
    switch (field) {
      case EntityTypes.BUSINESS:
        setSelectedBusiness(null);
        if (includeOffice) setSelectedOffice(null);
        if (includeDepartment) setSelectedDepartment(null);
        if (includeTeam) setSelectedTeam(null);
        break;
      case EntityTypes.OFFICE:
        setSelectedOffice(null);
        if (includeDepartment) setSelectedDepartment(null);
        if (includeTeam) setSelectedTeam(null);
        break;
      case EntityTypes.DEPARTMENT:
        setSelectedDepartment(null);
        if (includeTeam) setSelectedTeam(null);
        break;
      case EntityTypes.TEAM:
        setSelectedTeam(null);
        break;
      default:
        break;
    }
  };

  // Función para determinar si mostrar el botón de limpiar
  const showClearButton = (field, value, profileValue) => {
    // No mostrar si el campo está deshabilitado (por perfil de usuario)
    if (profileValue) return false;

    // Mostrar solo si hay un valor seleccionado
    return !!value;
  };

  useEffect(() => {
    if (profileData?.profile) {
      setUserProfile(profileData.profile);

      // Pre-seleccionar entidades del perfil del usuario solo si están incluidas
      if (includeBusiness && profileData.profile.business) {
        setSelectedBusiness(profileData.profile.business);
      }
      if (includeOffice && profileData.profile.office) {
        setSelectedOffice(profileData.profile.office);
      }
      if (includeDepartment && profileData.profile.department) {
        setSelectedDepartment(profileData.profile.department);
      }
      if (includeTeam && profileData.profile.team) {
        setSelectedTeam(profileData.profile.team);
      }
    }
  }, [
    profileData,
    includeBusiness,
    includeOffice,
    includeDepartment,
    includeTeam,
  ]);

  useEffect(() => {
    if (officesData?.offices?.data) {
      setAvailableOffices(officesData.offices.data);
    }
  }, [officesData]);

  useEffect(() => {
    if (departmentsData?.departments?.data) {
      setAvailableDepartments(departmentsData.departments.data);
    }
  }, [departmentsData]);

  useEffect(() => {
    if (teamsData?.teams?.data) {
      setAvailableTeams(teamsData.teams.data);
    }
  }, [teamsData]);

  // Los formularios pasan una función nueva en cada render; se guarda la última
  // para que notificar la selección no dependa de su identidad (evita un bucle
  // de renderizado)
  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    // Notificar cambios en la selección, solo para las entidades incluidas
    const onSelectionChange = onSelectionChangeRef.current;
    if (onSelectionChange) {
      const selection = {};

      if (includeBusiness) {
        selection.businessId = selectedBusiness?.id || null;
      }
      if (includeOffice) {
        selection.officeId = selectedOffice?.id || null;
      }
      if (includeDepartment) {
        selection.departmentId = selectedDepartment?.id || null;
      }
      if (includeTeam) {
        selection.teamId = selectedTeam?.id || null;
      }

      onSelectionChange(selection);
    }
  }, [
    selectedBusiness,
    selectedOffice,
    selectedDepartment,
    selectedTeam,
    includeBusiness,
    includeOffice,
    includeDepartment,
    includeTeam,
  ]);

  // Determinar qué campos mostrar según el perfil del usuario y las entidades incluidas
  const showBusinessField = includeBusiness && !userProfile?.business;
  const showOfficeField =
    includeOffice &&
    (includeBusiness ? !!selectedBusiness : true) &&
    !userProfile?.office;
  const showDepartmentField =
    includeDepartment &&
    (includeOffice ? !!selectedOffice : true) &&
    !userProfile?.department;
  const showTeamField =
    includeTeam &&
    (includeDepartment ? !!selectedDepartment : true) &&
    !userProfile?.team;

  return (
    <div>
      {showBusinessField && (
        <FormField label="Business">
          <div className="flex align-items-center gap-2">
            <Dropdown
              value={selectedBusiness}
              options={businessesData?.businesses?.data || []}
              onChange={handleBusinessChange}
              optionLabel="name"
              placeholder={
                userProfile?.business
                  ? userProfile.business.name
                  : "Select a business"
              }
              disabled={!!userProfile?.business}
              className="flex-1"
            />
            {showClearButton(
              EntityTypes.BUSINESS,
              selectedBusiness,
              userProfile?.business
            ) && (
              <Button
                label="Clear"
                text
                size="small"
                severity="secondary"
                onClick={() => clearField(EntityTypes.BUSINESS)}
              />
            )}
          </div>
        </FormField>
      )}

      {showOfficeField && (
        <FormField label="Office">
          <div className="flex align-items-center gap-2">
            <Dropdown
              value={selectedOffice}
              options={availableOffices}
              onChange={handleOfficeChange}
              optionLabel="name"
              placeholder={
                userProfile?.office
                  ? userProfile.office.name
                  : "Select an office"
              }
              disabled={!!userProfile?.office}
              className="flex-1"
            />
            {showClearButton(
              EntityTypes.OFFICE,
              selectedOffice,
              userProfile?.office
            ) && (
              <Button
                label="Clear"
                text
                size="small"
                severity="secondary"
                onClick={() => clearField(EntityTypes.OFFICE)}
              />
            )}
          </div>
        </FormField>
      )}

      {showDepartmentField && (
        <FormField label="Department">
          <div className="flex align-items-center gap-2">
            <Dropdown
              value={selectedDepartment}
              options={availableDepartments}
              onChange={handleDepartmentChange}
              optionLabel="name"
              placeholder={
                userProfile?.department
                  ? userProfile.department.name
                  : "Select a department"
              }
              disabled={!!userProfile?.department}
              className="flex-1"
            />
            {showClearButton(
              EntityTypes.DEPARTMENT,
              selectedDepartment,
              userProfile?.department
            ) && (
              <Button
                label="Clear"
                text
                size="small"
                severity="secondary"
                onClick={() => clearField(EntityTypes.DEPARTMENT)}
              />
            )}
          </div>
        </FormField>
      )}

      {showTeamField && (
        <FormField label="Team">
          <div className="flex align-items-center gap-2">
            <Dropdown
              value={selectedTeam}
              options={availableTeams}
              onChange={handleTeamChange}
              optionLabel="name"
              placeholder={
                userProfile?.team ? userProfile.team.name : "Select a team"
              }
              disabled={!!userProfile?.team}
              className="flex-1"
            />
            {showClearButton(
              EntityTypes.TEAM,
              selectedTeam,
              userProfile?.team
            ) && (
              <Button
                label="Clear"
                text
                size="small"
                severity="secondary"
                onClick={() => clearField(EntityTypes.TEAM)}
              />
            )}
          </div>
        </FormField>
      )}
    </div>
  );
};

export default SecurityEntitySelector;
