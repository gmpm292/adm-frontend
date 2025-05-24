import { gql } from "@apollo/client";

export const GET_PAYROLL_PERIODS = gql`
  query PayrollPeriods($options: ListOptions) {
    payrollPeriods(options: $options) {
      totalCount
      data {
        id
        name
        startDate
        endDate
        isClosed
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_PAYROLL_PERIOD_BY_ID = gql`
  query PayrollPeriod($id: Int!) {
    payrollPeriod(id: $id) {
      id
      name
      description
      startDate
      endDate
      isClosed
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
      payments {
        id
        amount
        currency
        paymentMethod
        paymentType
        createdAt
      }
    }
  }
`;

export const CREATE_PAYROLL_PERIOD = gql`
  mutation CreatePayrollPeriod($createPayrollPeriodInput: CreatePayrollPeriodInput!) {
    createPayrollPeriod(createPayrollPeriodInput: $createPayrollPeriodInput) {
      id
      name
    }
  }
`;

export const UPDATE_PAYROLL_PERIOD = gql`
  mutation UpdatePayrollPeriod($updatePayrollPeriodInput: UpdatePayrollPeriodInput!) {
    updatePayrollPeriod(updatePayrollPeriodInput: $updatePayrollPeriodInput) {
      id
      name
      startDate
      endDate
      isClosed
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