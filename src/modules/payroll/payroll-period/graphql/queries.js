import { gql } from "@apollo/client";

const PERIOD_FIELDS = `
  id
  name
  description
  startDate
  endDate
  isClosed
  deletedAt
  business {
    id
    name
  }
`;

export const GET_PAYROLL_PERIODS = gql`
  query PayrollPeriods($options: ListOptions) {
    payrollPeriods(options: $options) {
      totalCount
      data {
        ${PERIOD_FIELDS}
        payments {
          id
          amount
          currency
          paymentConcept
          paidDate
        }
      }
    }
  }
`;

export const GET_PAYROLL_PERIOD_BY_ID = gql`
  query PayrollPeriod($id: Int!) {
    payrollPeriod(id: $id) {
      ${PERIOD_FIELDS}
      createdAt
      createdBy {
        id
        name
        lastName
      }
      payments {
        id
        amount
        currency
        paymentConcept
        paidDate
        worker {
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

export const CREATE_PAYROLL_PERIOD = gql`
  mutation CreatePayrollPeriod($period: CreatePayrollPeriodInput!) {
    createPayrollPeriod(createPayrollPeriodInput: $period) {
      id
      name
    }
  }
`;

export const UPDATE_PAYROLL_PERIOD = gql`
  mutation UpdatePayrollPeriod($period: UpdatePayrollPeriodInput!) {
    updatePayrollPeriod(updatePayrollPeriodInput: $period) {
      id
      name
    }
  }
`;

export const CLOSE_PAYROLL_PERIOD = gql`
  mutation ClosePayrollPeriod($id: Int!) {
    closePayrollPeriod(id: $id) {
      id
      isClosed
    }
  }
`;

export const REMOVE_PAYROLL_PERIODS = gql`
  mutation RemovePayrollPeriods($ids: [Int!]!) {
    removePayrollPeriods(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_PAYROLL_PERIODS = gql`
  mutation RestorePayrollPeriods($ids: [Int!]!) {
    restorePayrollPeriods(ids: $ids)
  }
`;

export const PROCESS_PERIOD_PAYMENTS = gql`
  mutation ProcessPeriodPayments($input: ProcessPeriodPaymentsInput!) {
    processPeriodPayments(processPeriodPaymentsInput: $input) {
      totalCount
      successCount
      errorCount
      data {
        workerName
        status
        errors
      }
    }
  }
`;

export const PROCESS_PERIOD_SALES = gql`
  mutation ProcessPeriodSales($payrollPeriodId: Int!) {
    processPeriodSales(payrollPeriodId: $payrollPeriodId) {
      totalSales
      successful
      failed
      totalPaymentsCreated
      results {
        saleId
        success
        error
      }
    }
  }
`;
