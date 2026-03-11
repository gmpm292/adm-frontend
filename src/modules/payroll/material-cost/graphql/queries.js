import { gql } from "@apollo/client";

export const GET_MATERIAL_COSTS = gql`
  query MaterialCosts($options: ListOptions) {
    materialCosts(options: $options) {
      totalCount
      data {
        id
        name
        description
        costPrice
        isActive
        createdAt
        updatedAt
        unitOfMeasure {
          id
          name
          symbol
          category
        }
        currency {
          id
          code
          name
          symbol
        }
      }
    }
  }
`;

export const GET_MATERIAL_COST = gql`
  query MaterialCost($id: Int!) {
    materialCost(id: $id) {
      id
      name
      description
      costPrice
      isActive
      createdAt
      updatedAt
      unitOfMeasure {
        id
        name
        symbol
        category
      }
      currency {
        id
        code
        name
        symbol
        exchangeRateToCUP
      }
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
    }
  }
`;

export const GET_MATERIAL_COSTS_BY_UNIT = gql`
  query MaterialCostsByUnitOfMeasure(
    $unitOfMeasureId: Int!
    $options: ListOptions
  ) {
    materialCostsByUnitOfMeasure(
      unitOfMeasureId: $unitOfMeasureId
      options: $options
    ) {
      totalCount
      data {
        id
        name
        costPrice
        currency {
          code
          symbol
        }
      }
    }
  }
`;

export const CREATE_MATERIAL_COST = gql`
  mutation CreateMaterialCost(
    $createMaterialCostInput: CreateMaterialCostInput!
  ) {
    createMaterialCost(createMaterialCostInput: $createMaterialCostInput) {
      id
      name
    }
  }
`;

export const UPDATE_MATERIAL_COST = gql`
  mutation UpdateMaterialCost(
    $updateMaterialCostInput: UpdateMaterialCostInput!
  ) {
    updateMaterialCost(updateMaterialCostInput: $updateMaterialCostInput) {
      id
      name
      description
      costPrice
      isActive
      unitOfMeasure {
        id
        name
      }
      currency {
        id
        code
      }
    }
  }
`;

export const TOGGLE_MATERIAL_COST_ACTIVE = gql`
  mutation ToggleMaterialCostActive($id: Int!) {
    toggleMaterialCostActive(id: $id) {
      id
      name
      isActive
    }
  }
`;

export const REMOVE_MATERIAL_COSTS = gql`
  mutation RemoveMaterialCosts($ids: [Int!]!) {
    removeMaterialCosts(ids: $ids) {
      id
      name
    }
  }
`;

export const RESTORE_MATERIAL_COSTS = gql`
  mutation RestoreMaterialCosts($ids: [Int!]!) {
    restoreMaterialCosts(ids: $ids)
  }
`;
