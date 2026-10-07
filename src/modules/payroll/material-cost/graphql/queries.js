import { gql } from "@apollo/client";

const MATERIAL_COST_FIELDS = `
  id
  name
  description
  costPrice
  isActive
  productCount
  deletedAt
  business {
    id
    name
  }
  unitOfMeasure {
    id
    name
    symbol
  }
  currency {
    id
    code
    symbol
  }
`;

export const GET_MATERIAL_COSTS = gql`
  query MaterialCosts($options: ListOptions) {
    materialCosts(options: $options) {
      totalCount
      data {
        ${MATERIAL_COST_FIELDS}
      }
    }
  }
`;

export const CREATE_MATERIAL_COST = gql`
  mutation CreateMaterialCost(
    $createMaterialCostInput: CreateMaterialCostInput!
  ) {
    createMaterialCost(createMaterialCostInput: $createMaterialCostInput) {
      ${MATERIAL_COST_FIELDS}
    }
  }
`;

export const UPDATE_MATERIAL_COST = gql`
  mutation UpdateMaterialCost(
    $updateMaterialCostInput: UpdateMaterialCostInput!
  ) {
    updateMaterialCost(updateMaterialCostInput: $updateMaterialCostInput) {
      ${MATERIAL_COST_FIELDS}
    }
  }
`;

export const REMOVE_MATERIAL_COSTS = gql`
  mutation RemoveMaterialCosts($ids: [Int!]!) {
    removeMaterialCosts(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_MATERIAL_COSTS = gql`
  mutation RestoreMaterialCosts($ids: [Int!]!) {
    restoreMaterialCosts(ids: $ids)
  }
`;
