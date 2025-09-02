import { TenantService } from "../utils/tenant.service.js"

export class ExampleService extends TenantService {
  getOrganizationId() {
    return this.organizationId
  }
}
