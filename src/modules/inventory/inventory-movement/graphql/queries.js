import { gql } from "@apollo/client";

export const GET_INVENTORY_MOVEMENTS = gql`
  query InventoryMovements($options: ListOptions) {
    inventoryMovements(options: $options) {
      totalCount
      data {
        id
        type
        quantity
        reason
        createdAt
        updatedAt
        inventory {
          id
          product {
            name
          }
        }
        user {
          name
        }
      }
    }
  }
`;

export const GET_INVENTORY_MOVEMENT_BY_ID = gql`
  query InventoryMovement($id: Int!) {
    inventoryMovement(id: $id) {
      id
      type
      quantity
      reason
      createdAt
      updatedAt
      inventory {
        id
        product {
          name
        }
      }
      user {
        name
      }
    }
  }
`;

export const CREATE_INVENTORY_MOVEMENT = gql`
  mutation CreateInventoryMovement($movement: CreateInventoryMovementInput!) {
    createInventoryMovement(createInventoryMovementInput: $movement) {
      id
    }
  }
`;

export const UPDATE_INVENTORY_MOVEMENT = gql`
  mutation UpdateInventoryMovement($movement: UpdateInventoryMovementInput!) {
    updateInventoryMovement(updateInventoryMovementInput: $movement) {
      id
      type
      quantity
      reason
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_INVENTORY_MOVEMENTS = gql`
  mutation RemoveInventoryMovements($ids: [Int!]!) {
    removeInventoryMovements(ids: $ids) {
      id
    }
  }
`;
