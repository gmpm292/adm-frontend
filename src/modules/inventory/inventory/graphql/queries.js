import { gql } from "@apollo/client";

export const GET_INVENTORIES = gql`
  query Inventories($options: ListOptions) {
    inventories(options: $options) {
      totalCount
      data {
        id
        currentStock
        minStock
        location
        deletedAt
        updatedAt
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
        business {
          id
          name
        }
        office {
          id
          name
        }
      }
    }
  }
`;

export const GET_INVENTORY_BY_ID = gql`
  query Inventory($id: Int!) {
    inventory(id: $id) {
      id
      currentStock
      minStock
      location
      createdAt
      updatedAt
      product {
        id
        name
        costPrice
        costCurrency
        basePrice
        baseCurrency
        unitOfMeasure {
          id
          name
          symbol
        }
        category {
          id
          name
        }
      }
      business {
        id
        name
      }
      office {
        id
        name
      }
      createdBy {
        id
        name
        lastName
      }
    }
  }
`;

export const CREATE_INVENTORY = gql`
  mutation CreateInventory($inventory: CreateInventoryInput!) {
    createInventory(createInventoryInput: $inventory) {
      id
      product {
        id
        name
      }
    }
  }
`;

export const UPDATE_INVENTORY = gql`
  mutation UpdateInventory($inventory: UpdateInventoryInput!) {
    updateInventory(updateInventoryInput: $inventory) {
      id
      minStock
      location
    }
  }
`;

export const DELETE_INVENTORIES = gql`
  mutation RemoveInventories($ids: [Int!]!) {
    removeInventories(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_INVENTORIES = gql`
  mutation RestoreInventories($ids: [Int!]!) {
    restoreInventories(ids: $ids)
  }
`;

/** Oficinas donde se puede abrir un inventario (las que el usuario ve) */
export const GET_OFFICE_OPTIONS = gql`
  query InventoryOffices {
    offices(options: { take: 200, sorts: [{ property: "name", direction: ASC }] }) {
      data {
        id
        name
        business {
          id
          name
        }
      }
    }
  }
`;

/** Productos para elegir al abrir un inventario */
export const GET_PRODUCT_OPTIONS = gql`
  query InventoryProductOptions {
    products(options: { take: 1000, sorts: [{ property: "name", direction: ASC }] }) {
      data {
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
        business {
          id
        }
        office {
          id
          name
        }
      }
    }
  }
`;
