import { gql } from "@apollo/client";

export const GET_DELIVERIES = gql`
  query Sales($options: ListOptions) {
    sales(options: $options) {
      totalCount
      data {
        id
        effectiveDate
        isConfirmed
        totalAmount
        paymentMethod
        invoiceNumber
        paymentDetails
        saleStatus
        # Campos de mensajería
        hasDelivery
        deliveryNotes
        salesUser {
          id
          name
        }
        customer {
          id
          name
        }
        deliveryWorker {
          id
        }
      }
    }
  }
`;

// Reutilizamos las mismas mutations del módulo de ventas
export { MAKE_SALE, VALIDATE_SALE_PAYMENTS, DELETE_SALES, UPDATE_SALE } from "../../sale/graphql/queries";