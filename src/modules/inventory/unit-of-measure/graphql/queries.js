import { gql } from "@apollo/client";

export const GET_UNITS_OF_MEASURE = gql`
  query UnitsOfMeasure($options: ListOptions) {
    unitOfMeasures(options: $options) {
      totalCount
      data {
        id
        name
        symbol
        category
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_UNIT_OF_MEASURE = gql`
  query UnitOfMeasure($id: Int!) {
    unitOfMeasure(id: $id) {
      id
      name
      symbol
      category
      description
      isActive
      createdAt
      updatedAt
      business {
        id
        name
      }
      office {
        id
        name
      }
      department {
        id
        name
      }
      team {
        id
        name
      }
      materialCosts {
        id
        name
      }
    }
  }
`;

export const GET_UNITS_BY_CATEGORY = gql`
  query UnitsOfMeasureByCategory($category: String!, $options: ListOptions) {
    unitsOfMeasureByCategory(category: $category, options: $options) {
      totalCount
      data {
        id
        name
        symbol
        category
        isActive
      }
    }
  }
`;

export const CREATE_UNIT_OF_MEASURE = gql`
  mutation CreateUnitOfMeasure(
    $createUnitOfMeasureInput: CreateUnitOfMeasureInput!
  ) {
    createUnitOfMeasure(createUnitOfMeasureInput: $createUnitOfMeasureInput) {
      id
      name
      symbol
    }
  }
`;

export const UPDATE_UNIT_OF_MEASURE = gql`
  mutation UpdateUnitOfMeasure(
    $updateUnitOfMeasureInput: UpdateUnitOfMeasureInput!
  ) {
    updateUnitOfMeasure(updateUnitOfMeasureInput: $updateUnitOfMeasureInput) {
      id
      name
      symbol
      category
      description
      isActive
    }
  }
`;

export const TOGGLE_UNIT_ACTIVE = gql`
  mutation ToggleUnitOfMeasureActive($id: Int!) {
    toggleUnitOfMeasureActive(id: $id) {
      id
      name
      isActive
    }
  }
`;

export const REMOVE_UNITS_OF_MEASURE = gql`
  mutation RemoveUnitsOfMeasure($ids: [Int!]!) {
    removeUnitsOfMeasure(ids: $ids) {
      id
      name
    }
  }
`;

export const RESTORE_UNITS_OF_MEASURE = gql`
  mutation RestoreUnitsOfMeasure($ids: [Int!]!) {
    restoreUnitsOfMeasure(ids: $ids)
  }
`;
