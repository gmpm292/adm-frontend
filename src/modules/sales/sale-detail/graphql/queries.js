import { gql } from "@apollo/client";

export const GET_SALE_DETAILS = gql`
  query SaleDetails($options: ListOptions) {
    saleDetails(options: $options) {
      totalCount
      data {
        id
        createdAt
        quantity
        unitPrice
        subtotal
        currency
        saleDetailStatus
        product {
          id
          name
        }
        sale {
          id
          invoiceNumber
          saleStatus
          effectiveDate
        }
        publicists {
          id
          tempFirstName
          tempLastName
          user {
            id
            name
            lastName
          }
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
        tempFirstName
        tempLastName
        user {
          id
          name
          lastName
        }
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
      currency
      saleDetailStatus
      product {
        id
        name
      }
      sale {
        id
        invoiceNumber
        saleStatus
      }
      publicists {
        id
        tempFirstName
        tempLastName
        user {
          id
          name
          lastName
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
          lastName
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
        user {
          id
          name
        }
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
