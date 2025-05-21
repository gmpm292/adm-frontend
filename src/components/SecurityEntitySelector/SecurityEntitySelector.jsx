import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Dropdown } from "primereact/dropdown";
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

  // Funciones de manejo de cambios
  const handleBusinessChange = (e) => {
    setSelectedBusiness(e.value);
    if (includeOffice) setSelectedOffice(null);
    if (includeDepartment) setSelectedDepartment(null);
    if (includeTeam) setSelectedTeam(null);
  };

  const handleOfficeChange = (e) => {
    setSelectedOffice(e.value);
    if (includeDepartment) setSelectedDepartment(null);
    if (includeTeam) setSelectedTeam(null);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.value);
    if (includeTeam) setSelectedTeam(null);
  };

  const handleTeamChange = (e) => {
    setSelectedTeam(e.value);
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

  useEffect(() => {
    // Notificar cambios en la selección, solo para las entidades incluidas
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
    onSelectionChange,
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
    <div className="security-entity-selector">
      {showBusinessField && (
        <div className="p-field">
          <label>Business</label>
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
            className="w-full"
          />
        </div>
      )}

      {showOfficeField && (
        <div className="p-field">
          <label>Office</label>
          <Dropdown
            value={selectedOffice}
            options={availableOffices}
            onChange={handleOfficeChange}
            optionLabel="name"
            placeholder={
              userProfile?.office ? userProfile.office.name : "Select an office"
            }
            disabled={!!userProfile?.office}
            className="w-full"
          />
        </div>
      )}

      {showDepartmentField && (
        <div className="p-field">
          <label>Department</label>
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
            className="w-full"
          />
        </div>
      )}

      {showTeamField && (
        <div className="p-field">
          <label>Team</label>
          <Dropdown
            value={selectedTeam}
            options={availableTeams}
            onChange={handleTeamChange}
            optionLabel="name"
            placeholder={
              userProfile?.team ? userProfile.team.name : "Select a team"
            }
            disabled={!!userProfile?.team}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default SecurityEntitySelector;
