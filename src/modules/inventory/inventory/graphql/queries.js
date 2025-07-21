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
        createdAt
        updatedAt
        product {
          id
          name
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
        unitOfMeasure
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
      department {
        id
        name
      }
      team {
        id
        name
      }
      createdBy {
        id
        name
        lastName
      }
      updatedBy {
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
    }
  }
`;

export const UPDATE_INVENTORY = gql`
  mutation UpdateInventory($inventory: UpdateInventoryInput!) {
    updateInventory(updateInventoryInput: $inventory) {
      id
      currentStock
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
