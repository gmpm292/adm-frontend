import { gql } from "@apollo/client";

const ATTENDANCE_FIELDS = `
  id
  attendanceDate
  checkInTime
  checkOutTime
  status
  hoursWorked
  isPaid
  isHoliday
  notes
  deletedAt
  worker {
    id
    workerType
    otherType
    tempFirstName
    tempLastName
    user {
      id
      name
      lastName
    }
  }
  office {
    id
    name
  }
`;

export const GET_ATTENDANCES = gql`
  query Attendances($options: ListOptions) {
    attendances(options: $options) {
      totalCount
      data {
        ${ATTENDANCE_FIELDS}
      }
    }
  }
`;

export const CREATE_ATTENDANCE = gql`
  mutation CreateAttendance($attendance: CreateAttendanceInput!) {
    createAttendance(createAttendanceInput: $attendance) {
      id
    }
  }
`;

export const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($attendance: UpdateAttendanceInput!) {
    updateAttendance(updateAttendanceInput: $attendance) {
      ${ATTENDANCE_FIELDS}
    }
  }
`;

export const MARK_ATTENDANCES_AS_PAID = gql`
  mutation MarkAsPaid($ids: [Int!]!) {
    markAsPaid(ids: $ids) {
      id
      isPaid
    }
  }
`;

export const REMOVE_ATTENDANCES = gql`
  mutation RemoveAttendances($ids: [Int!]!) {
    removeAttendances(ids: $ids) {
      id
    }
  }
`;

export const RESTORE_ATTENDANCES = gql`
  mutation RestoreAttendances($ids: [Int!]!) {
    restoreAttendances(ids: $ids)
  }
`;
