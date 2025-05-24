import { gql } from "@apollo/client";

// Team Queries
export const GET_TEAMS = gql`
  query Teams($options: ListOptions) {
    teams(options: $options) {
      totalCount
      data {
        id
        teamType
        name
        description
        department {
          id
          name
        }
      }
    }
  }
`;

export const GET_TEAM_BY_ID = gql`
  query Team($id: Int!) {
    team(id: $id) {
      id
      teamType
      name
      description
      department {
        id
        name
      }
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($team: CreateTeamInput!) {
    createTeam(createTeamInput: $team) {
      id
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($team: UpdateTeamInput!) {
    updateTeam(updateTeamInput: $team) {
      id
      teamType
    }
  }
`;

export const DELETE_TEAMS = gql`
  mutation RemoveTeams($ids: [Int!]!) {
    removeTeams(ids: $ids) {
      id
    }
  }
`;
