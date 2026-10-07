import { gql } from "@apollo/client";

const SCHEDULE_FIELDS = `
  id
  name
  startDate
  endDate
  notes
  deletedAt
  workingDays {
    monday
    tuesday
    wednesday
    thursday
    friday
    saturday
    sunday
  }
  office {
    id
    name
  }
  business {
    id
    name
  }
`;

export const GET_WORK_SCHEDULES = gql`
  query WorkSchedules($options: ListOptions) {
    workSchedules(options: $options) {
      totalCount
      data {
        ${SCHEDULE_FIELDS}
      }
    }
  }
`;

export const CREATE_WORK_SCHEDULE = gql`
  mutation CreateWorkSchedule($schedule: CreateWorkScheduleInput!) {
    createWorkSchedule(createWorkScheduleInput: $schedule) {
      id
      name
    }
  }
`;

export const UPDATE_WORK_SCHEDULE = gql`
  mutation UpdateWorkSchedule($schedule: UpdateWorkScheduleInput!) {
    updateWorkSchedule(updateWorkScheduleInput: $schedule) {
      id
      name
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

export const RESTORE_WORK_SCHEDULES = gql`
  mutation RestoreWorkSchedules($ids: [Int!]!) {
    restoreWorkSchedules(ids: $ids)
  }
`;
