import {CliConfiguration, LOGIN_CODES, ValidateLogin} from "@flowcore/cli-plugin-config";
import {ux} from "@oclif/core";
import {GraphQLClient} from "graphql-request";

export class QueryGraphQL {
  public client: GraphQLClient;
  private readonly revalidate: () => Promise<false | string>;
  private readonly url: string;

  constructor(url: string, token: string, revalidateClient: () => Promise<false | string>) {
    this.client = new GraphQLClient(
      url,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    this.revalidate = revalidateClient;
    this.url = url;
  }

  public async validateToken() {
    const newToken = await this.revalidate();
    if (newToken !== false) {
      this.client = new GraphQLClient(
        this.url,
        {
          headers: {
            authorization: `Bearer ${newToken}`,
          },
        }
      );
    }
  }
}

export const ClientFactory = {
  async create(configuration: CliConfiguration, json: boolean = false): Promise<QueryGraphQL> {
    const config = configuration.getConfig();

    const loginValidator = new ValidateLogin(config.login.url);
    const validateLogin = await loginValidator.validate(config, configuration, !json);

    const { api, auth } = config;
    if (validateLogin.status !== LOGIN_CODES.LOGIN_SUCCESS || !auth) {
      ux.error(`Not logged in, please run ${ux.colorize("yellow", "flowcore login")} first`);
    }

    if (!api.url) {
      ux.error("No api url configured");
    }

    return new QueryGraphQL(api.url, auth.accessToken, async () => {
      if(!await loginValidator.isExpired(config, configuration, !json)) {
        return false;
      }

      return config!.auth!.accessToken;
    });
  },
};