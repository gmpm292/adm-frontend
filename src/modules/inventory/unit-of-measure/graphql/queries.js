import { gql } from "@apollo/client";

const UNIT_FIELDS = `
  id
  name
  symbol
  category
  description
  isActive
  deletedAt
`;

export const GET_UNITS_OF_MEASURE = gql`
  query UnitOfMeasures($options: ListOptions) {
    unitOfMeasures(options: $options) {
      totalCount
      data {
        ${UNIT_FIELDS}
      }
    }
  }
`;

export const CREATE_UNIT_OF_MEASURE = gql`
  mutation CreateUnitOfMeasure(
    $createUnitOfMeasureInput: CreateUnitOfMeasureInput!
  ) {
    createUnitOfMeasure(createUnitOfMeasureInput: $createUnitOfMeasureInput) {
      ${UNIT_FIELDS}
    }
  }
`;

export const UPDATE_UNIT_OF_MEASURE = gql`
  mutation UpdateUnitOfMeasure(
    $updateUnitOfMeasureInput: UpdateUnitOfMeasureInput!
  ) {
    updateUnitOfMeasure(updateUnitOfMeasureInput: $updateUnitOfMeasureInput) {
      ${UNIT_FIELDS}
    }
  }
`;

export const REMOVE_UNITS_OF_MEASURE = gql`
  mutation RemoveUnitsOfMeasure($ids: [Int!]!) {
    removeUnitsOfMeasure(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_UNITS_OF_MEASURE = gql`
  mutation RestoreUnitsOfMeasure($ids: [Int!]!) {
    restoreUnitsOfMeasure(ids: $ids)
  }
`;
