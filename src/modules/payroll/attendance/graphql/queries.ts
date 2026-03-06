// attendance/graphql/queries.ts
import { gql } from "@apollo/client";

export const GET_ATTENDANCES = gql`
  query Attendances($options: ListOptions) {
    attendances(options: $options) {
      totalCount
      data {
        id
        attendanceDate
        checkInTime
        checkOutTime
        status
        hoursWorked
        isPaid
        isHoliday
        notes
        recordedAt
        createdAt
        updatedAt
        deletedAt
        worker {
          id
          workerType
          baseSalary
          tempFirstName
          tempLastName
          tempEmail
          tempPhone
          user {
            id
            name
            lastName
            email
            mobile
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
        workSchedule {
          id
          startDate
          endDate
          workingDays {
            monday
            tuesday
            wednesday
            thursday
            friday
            saturday
            sunday
          }
          isRecurring
          notes
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

export const GET_ATTENDANCE_BY_ID = gql`
  query Attendance($id: Int!) {
    attendance(id: $id) {
      id
      attendanceDate
      checkInTime
      checkOutTime
      status
      hoursWorked
      isPaid
      isHoliday
      notes
      recordedAt
      createdAt
      updatedAt
      deletedAt
      worker {
        id
        workerType
        baseSalary
        tempFirstName
        tempLastName
        tempEmail
        tempPhone
        user {
          id
          name
          lastName
          email
          mobile
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
        paymentRule {
          id
          name
        }
      }
      workSchedule {
        id
        startDate
        endDate
        workingDays {
          monday
          tuesday
          wednesday
          thursday
          friday
          saturday
          sunday
        }
        isRecurring
        notes
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
        email
      }
      updatedBy {
        id
        name
        lastName
        email
      }
    }
  }
`;

export const CREATE_ATTENDANCE = gql`
  mutation CreateAttendance($createAttendanceInput: CreateAttendanceInput!) {
    createAttendance(createAttendanceInput: $createAttendanceInput) {
      id
      attendanceDate
      status
      worker {
        id
        user {
          name
          lastName
        }
      }
    }
  }
`;

export const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($updateAttendanceInput: UpdateAttendanceInput!) {
    updateAttendance(updateAttendanceInput: $updateAttendanceInput) {
      id
      attendanceDate
      checkInTime
      checkOutTime
      status
      hoursWorked
      isPaid
      isHoliday
      notes
    }
  }
`;

export const REMOVE_ATTENDANCES = gql`
  mutation RemoveAttendances($ids: [Int!]!) {
    removeAttendances(ids: $ids) {
      id
      deletedAt
    }
  }
`;

export const RESTORE_ATTENDANCES = gql`
  mutation RestoreAttendances($ids: [Int!]!) {
    restoreAttendances(ids: $ids)
  }
`;

export const CHECK_IN = gql`
  mutation CheckIn($checkInInput: CheckInInput!) {
    checkIn(checkInInput: $checkInInput) {
      id
      checkInTime
      status
      recordedAt
    }
  }
`;

export const CHECK_OUT = gql`
  mutation CheckOut($checkOutInput: CheckOutInput!) {
    checkOut(checkOutInput: $checkOutInput) {
      id
      checkOutTime
      hoursWorked
      status
    }
  }
`;

export const GET_DAILY_ATTENDANCE = gql`
  query DailyAttendance($date: Date!) {
    dailyAttendance(date: $date) {
      id
      attendanceDate
      checkInTime
      checkOutTime
      status
      hoursWorked
      isPaid
      worker {
        id
        user {
          name
          lastName
          email
        }
        workerType
        department {
          name
        }
      }
    }
  }
`;

export const GET_WORKER_ATTENDANCE = gql`
  query WorkerAttendance($workerId: Int!, $startDate: Date!, $endDate: Date!) {
    workerAttendance(
      workerId: $workerId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      attendanceDate
      checkInTime
      checkOutTime
      status
      hoursWorked
      isPaid
      isHoliday
    }
  }
`;

// Query adicional para obtener workers con sus usuarios
export const GET_WORKERS = gql`
  query WorkersWithUsers($options: ListOptions) {
    workers(options: $options) {
      totalCount
      data {
        id
        workerType
        baseSalary
        user {
          id
          name
          lastName
          email
          mobile
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
