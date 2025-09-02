import { BaseCommand } from "@flowcore/cli-plugin-config"
import { Args, Flags } from "@oclif/core"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat.js"

import { ExampleService } from "../../services/example.service.js"
import { OrganizationService } from "../../services/organization.service.js"
import { ClientFactory } from "../../utils/graphql.util.js"

dayjs.extend(customParseFormat)

export const GET_EXAMPLE_ARGS = {
  NAME: Args.string({ description: "name", required: false }),
}

export default class Example extends BaseCommand<typeof Example> {
  static args = GET_EXAMPLE_ARGS
  static description = "Example"
  static examples = []

  static flags = {
    tenant: Flags.string({
      char: "t",
      description: "tenant",
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Example)

    const graphqlClient = await ClientFactory.create(this.cliConfiguration)

    const organizationService = new OrganizationService(graphqlClient)
    const organization = await organizationService.fetchOrganization(flags.tenant)

    const exampleService = new ExampleService(graphqlClient, organization.id)

    console.log(
      `Hello ${args.NAME} ${exampleService.getOrganizationId()}, you are logged, here is your selected organization: ${JSON.stringify(organization)}`,
    )
  }
}
