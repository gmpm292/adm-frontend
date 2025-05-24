import { gql } from "@apollo/client";

export const GET_WORK_SCHEDULES = gql`
  query WorkSchedules($options: ListOptions) {
    workSchedules(options: $options) {
      totalCount
      data {
        id
        office {
          id
          name
        }
        startDate
        endDate
        isRecurring
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_WORK_SCHEDULE_BY_ID = gql`
  query WorkSchedule($id: Int!) {
    workSchedule(id: $id) {
      id
      startDate
      endDate
      isRecurring
      notes
      workingDays {
        monday
        tuesday
        wednesday
        thursday
        friday
        saturday
        sunday
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

export const CREATE_WORK_SCHEDULE = gql`
  mutation CreateWorkSchedule($createWorkScheduleInput: CreateWorkScheduleInput!) {
    createWorkSchedule(createWorkScheduleInput: $createWorkScheduleInput) {
      id
    }
  }
`;

export const UPDATE_WORK_SCHEDULE = gql`
  mutation UpdateWorkSchedule($updateWorkScheduleInput: UpdateWorkScheduleInput!) {
    updateWorkSchedule(updateWorkScheduleInput: $updateWorkScheduleInput) {
      id
      startDate
      endDate
      isRecurring
    }
  }
`;

export const REMOVE_WORK_SCHEDULES = gql`
  mutation RemoveWorkSchedules($ids: [Int!]!) {
    removeWorkSchedules(ids: $ids) {
      id
    }
  }
`;