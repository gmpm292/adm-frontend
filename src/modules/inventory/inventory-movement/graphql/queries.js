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

/** Traslado entre dos inventarios: devuelve la salida y la entrada */
export const TRANSFER_INVENTORY = gql`
  mutation TransferInventory($transfer: TransferInventoryInput!) {
    transferInventory(transferInventoryInput: $transfer) {
      outgoing {
        id
      }
      incoming {
        id
      }
    }
  }
`;

/**
 * Hoja de inventario: todos los productos de la empresa con sus inventarios
 * en la oficina y, con `toOfficeId`, lo que hay de cada uno en la de destino.
 */
export const GET_INVENTORY_SHEET = gql`
  query InventorySheet($officeId: Int!, $toOfficeId: Int) {
    inventorySheet(officeId: $officeId, toOfficeId: $toOfficeId) {
      office {
        id
        name
      }
      destinations {
        id
        name
      }
      rows {
        destinationStock
        product {
          id
          name
          category {
            id
            name
          }
          unitOfMeasure {
            id
            symbol
          }
        }
        inventories {
          id
          location
          currentStock
        }
      }
    }
  }
`;

export const LOAD_INVENTORY = gql`
  mutation LoadInventory($input: LoadInventoryInput!) {
    loadInventory(loadInventoryInput: $input) {
      lines
      units
      createdInventories
    }
  }
`;

export const SEND_INVENTORY = gql`
  mutation SendInventory($input: SendInventoryInput!) {
    sendInventory(sendInventoryInput: $input) {
      lines
      units
      createdInventories
    }
  }
`;

/** Inventarios para elegir al registrar un movimiento o un traslado */
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
        business {
          id
        }
      }
    }
  }
`;
