import { gql } from "@apollo/client";

const MOVEMENT_FIELDS = gql`
  fragment MovementFields on InventoryMovement {
    id
    type
    quantity
    reason
    referenceId
    createdAt
    inventory {
      id
      location
      deletedAt
      product {
        id
        name
        unitOfMeasure {
          id
          symbol
        }
        category {
          id
          name
        }
      }
    }
    office {
      id
      name
    }
    user {
      id
      name
      lastName
    }
  }
`;

export const GET_INVENTORY_MOVEMENTS = gql`
  ${MOVEMENT_FIELDS}
  query InventoryMovements($options: ListOptions) {
    inventoryMovements(options: $options) {
      totalCount
      data {
        ...MovementFields
      }
    }
  }
`;

export const GET_INVENTORY_MOVEMENT_BY_ID = gql`
  ${MOVEMENT_FIELDS}
  query InventoryMovement($id: Int!) {
    inventoryMovement(id: $id) {
      ...MovementFields
      business {
        id
        name
      }
    }
  }
`;

export const CREATE_INVENTORY_MOVEMENT = gql`
  mutation CreateInventoryMovement($movement: CreateInventoryMovementInput!) {
    createInventoryMovement(createInventoryMovementInput: $movement) {
      id
      createdAt
    }
  }
`;

/** Inventarios para elegir al registrar un movimiento */
export const GET_INVENTORY_OPTIONS = gql`
  query MovementInventoryOptions {
    inventories(options: { take: 1000 }) {
      data {
        id
        currentStock
        location
        product {
          id
          name
          unitOfMeasure {
            id
            symbol
          }
        }
        office {
          id
          name
        }
      }
    }
  }
`;
