import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query Categories($options: ListOptions) {
    categories(options: $options) {
      totalCount
      data {
        id
        name
        description
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
      }
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query Category($id: Int!) {
    category(id: $id) {
      id
      name
      description
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
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($category: CreateCategoryInput!) {
    createCategory(createCategoryInput: $category) {
      id
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($category: UpdateCategoryInput!) {
    updateCategory(updateCategoryInput: $category) {
      id
      name
      description
    }
  }
`;

export const DELETE_CATEGORIES = gql`
  mutation RemoveCategories($ids: [Int!]!) {
    removeCategories(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_CATEGORIES = gql`
  mutation RestoreCategories($ids: [Int!]!) {
    restoreCategories(ids: $ids)
  }
`;
