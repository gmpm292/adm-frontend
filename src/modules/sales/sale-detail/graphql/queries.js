import { gql } from "@apollo/client";

export const GET_SALE_DETAILS = gql`
  query SaleDetails($options: ListOptions) {
    saleDetails(options: $options) {
      totalCount
      data {
        id
        quantity
        unitPrice
        subtotal
        discountPercentage
        product {
          name
          code
        }
        sale {
          id
          invoiceNumber
        }
      }
    }
  }
`;

export const GET_SALE_DETAIL_BY_ID = gql`
  query SaleDetail($id: Int!) {
    saleDetail(id: $id) {
      id
      quantity
      unitPrice
      subtotal
      discountPercentage
      productSnapshot
      product {
        id
        name
        code
      }
      sale {
        id
        invoiceNumber
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

export const GET_SALE_DETAILS_BY_SALE = gql`
  query SaleDetailsBySale($saleId: Int!) {
    saleDetailsBySale(saleId: $saleId) {
      id
      quantity
      unitPrice
      subtotal
      discountPercentage
      product {
        id
        name
        code
      }
    }
  }
`;

export const CREATE_SALE_DETAIL = gql`
  mutation CreateSaleDetail($saleDetail: CreateSaleDetailInput!) {
    createSaleDetail(createSaleDetailInput: $saleDetail) {
      id
    }
  }
`;

export const UPDATE_SALE_DETAIL = gql`
  mutation UpdateSaleDetail($saleDetail: UpdateSaleDetailInput!) {
    updateSaleDetail(updateSaleDetailInput: $saleDetail) {
      id
      quantity
      unitPrice
      subtotal
    }
  }
`;

export const DELETE_SALE_DETAILS = gql`
  mutation RemoveSaleDetails($ids: [Int!]!) {
    removeSaleDetails(ids: $ids) {
      id
    }
  }
`;