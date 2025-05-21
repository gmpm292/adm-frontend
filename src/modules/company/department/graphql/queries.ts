import { gql } from "@apollo/client";

// Department Queries
export const GET_DEPARTMENTS = gql`
  query Departments($options: ListOptions) {
    departments(options: $options) {
      totalCount
      data {
        id
        departmentType
        name
        description
        address
        office {
          id
          name
        }
      }
    }
  }
`;

export const GET_DEPARTMENT_BY_ID = gql`
  query Department($id: Int!) {
    department(id: $id) {
      id
      departmentType
      name
      description
      address
      office {
        id
        name
      }
    }
  }
`;

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($department: CreateDepartmentInput!) {
    createDepartment(createDepartmentInput: $department) {
      id
    }
  }
`;

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($department: UpdateDepartmentInput!) {
    updateDepartment(updateDepartmentInput: $department) {
      id
      departmentType
      name
      description
      address
    }
  }
`;

export const DELETE_DEPARTMENTS = gql`
  mutation RemoveDepartments($ids: [Int!]!) {
    removeDepartments(ids: $ids) {
      id
    }
  }
`;
