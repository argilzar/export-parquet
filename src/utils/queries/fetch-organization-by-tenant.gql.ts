import {gql} from "graphql-request";

export type FetchOrganizationByTenantQueryResponse = {
  me: {
    id: string;
    organizations: {
      organization: {
        id: string;
      };
    }[];
  };
}

export type FetchOrganizationByTenantQueryInput = {
  org: string;
}

export const FETCH_ORGANIZATION_BY_TENANT_GQL_QUERY = gql`
  query FLOWCORE_CLI_FETCH_ORGANIZATION_BY_TENANT($org: String!) {
    me {
      id
      organizations(search: {org: $org}) {
        organization {
          id
        }
      }
    }
  }
`;