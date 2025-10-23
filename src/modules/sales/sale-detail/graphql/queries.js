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
        reservationId
        isConfirmed
        product {
          name
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
      productPaymentOptions
      reservationId
      isConfirmed
      product {
        id
        name
      }
      sale {
        id
      }
      publicists {
        id
        name
        email
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
      productSnapshot
      productPaymentOptions
      reservationId
      isConfirmed
      product {
        id
        name
      }
      sale {
        id
      }
      publicists {
        id
        user {
          id
          name
          email
          mobile
        }
      }
    }
  }
`;

export const CREATE_SALE_DETAIL = gql`
  mutation CreateSaleDetail($saleDetail: CreateSaleDetailInput!) {
    createSaleDetail(createSaleDetailInput: $saleDetail) {
      id
      quantity
      product {
        id
        name
      }
      publicists {
        id
        user {
          id
          name
          email
          mobile
        }
      }
    }
  }
`;

export const UPDATE_SALE_DETAIL = gql`
  mutation UpdateSaleDetail($saleDetail: UpdateSaleDetailInput!) {
    updateSaleDetail(updateSaleDetailInput: $saleDetail) {
      id
      quantity
      discountPercentage
      product {
        id
        name
      }
      publicists {
        id
        name
      }
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
