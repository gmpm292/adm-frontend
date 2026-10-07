import { gql } from "@apollo/client";

const CATEGORY_FIELDS = `
  id
  name
  description
  productCount
  deletedAt
  business {
    id
    name
  }
`;

export const GET_CATEGORIES = gql`
  query Categories($options: ListOptions) {
    categories(options: $options) {
      totalCount
      data {
        ${CATEGORY_FIELDS}
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($category: CreateCategoryInput!) {
    createCategory(createCategoryInput: $category) {
      ${CATEGORY_FIELDS}
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($category: UpdateCategoryInput!) {
    updateCategory(updateCategoryInput: $category) {
      ${CATEGORY_FIELDS}
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
