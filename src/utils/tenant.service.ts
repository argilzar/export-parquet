import {QueryGraphQL} from "./graphql.util.js";

export class TenantService {
  protected graphqlClient: QueryGraphQL;
  protected organizationId: string;

  constructor(client: QueryGraphQL, organizationId: string) {
    this.graphqlClient = client;
    this.organizationId = organizationId;
  }

  getOrganizationId() {
    return this.organizationId;
  }
}