Flowcore CLI Plugin - Export Parquet
=================

Plugin to export data from the flowcore platform as parquet files

[![Version](https://img.shields.io/npm/v/@flowcore/flowcore-cli-plugin-scenario)](https://npmjs.org/package/@flowcore/flowcore-cli-plugin-scenario)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Build and Release](https://github.com/@flowcore/flowcore-cli-plugin-scenario/actions/workflows/build.yml/badge.svg)](https://github.com/@flowcore/flowcore-cli-plugin-scenario/actions/workflows/build.yml)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @flowcore/cli-plugin-scenario
$ scenario COMMAND
running command...
$ scenario (--version)
@flowcore/cli-plugin-scenario/2.11.0 darwin-arm64 node-v20.15.0
$ scenario --help [COMMAND]
USAGE
  $ scenario COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`scenario get adapter [ADAPTER]`](#scenario-get-adapter-adapter)
* [`scenario get scenario [SCENARIO]`](#scenario-get-scenario-scenario)
* [`scenario get scenario copy [SCENARIO]`](#scenario-get-scenario-copy-scenario)
* [`scenario logs adapter ADAPTER`](#scenario-logs-adapter-adapter)
* [`scenario reset adapter ADAPTER`](#scenario-reset-adapter-adapter)
* [`scenario scenario apply`](#scenario-scenario-apply)
* [`scenario scenario generate manifest`](#scenario-scenario-generate-manifest)
* [`scenario scenario generate transformer`](#scenario-scenario-generate-transformer)
* [`scenario scenario local`](#scenario-scenario-local)

## `scenario get adapter [ADAPTER]`

Get adapter

```
USAGE
  $ scenario get adapter [ADAPTER] -t <value> -s <value> [--profile <value>]

ARGUMENTS
  ADAPTER  adapter name or id

FLAGS
  -s, --scenario=<value>  (required) scenario
  -t, --tenant=<value>    (required) tenant
      --profile=<value>   Specify the configuration profile to use

DESCRIPTION
  Get adapter

EXAMPLES
  $ scenario get adapter -t tenant-name -s scenario-name

  $ scenario get adapter adapter-name -t tenant-name -s scenario-name
```

_See code: [src/commands/get/adapter.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/get/adapter.ts)_

## `scenario get scenario [SCENARIO]`

Get scenario

```
USAGE
  $ scenario get scenario [SCENARIO] -t <value> [--profile <value>]

ARGUMENTS
  SCENARIO  scenario name

FLAGS
  -t, --tenant=<value>   (required) tenant
      --profile=<value>  Specify the configuration profile to use

DESCRIPTION
  Get scenario

EXAMPLES
  $ scenario get scenario -t tenant-name

  $ scenario get scenario scenario-name -t tenant-name
```

_See code: [src/commands/get/scenario.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/get/scenario.ts)_

## `scenario get scenario copy [SCENARIO]`

Get scenario

```
USAGE
  $ scenario get scenario copy [SCENARIO] -t <value> [--profile <value>]

ARGUMENTS
  SCENARIO  scenario name or id

FLAGS
  -t, --tenant=<value>   (required) tenant
      --profile=<value>  Specify the configuration profile to use

DESCRIPTION
  Get scenario

EXAMPLES
  $ scenario get scenario copy -t tenant-name

  $ scenario get scenario copy scenario-name -t tenant-name
```

_See code: [src/commands/get/scenario copy.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/get/scenario copy.ts)_

## `scenario logs adapter ADAPTER`

Get adapter logs

```
USAGE
  $ scenario logs adapter ADAPTER -t <value> -s <value> [--profile <value>] [-f] [-l <value>] [-j] [-a]

ARGUMENTS
  ADAPTER  adapter name or id

FLAGS
  -a, --allComponents     display logs for all components of the adapter, including Flowcore components
  -f, --follow            follow
  -j, --json              json
  -l, --limit=<value>     [default: 1000] limit
  -s, --scenario=<value>  (required) scenario
  -t, --tenant=<value>    (required) tenant
      --profile=<value>   Specify the configuration profile to use

DESCRIPTION
  Get adapter logs

EXAMPLES
  $ scenario logs adapter adapter-name -t tenant-name -s scenario-name

  $ scenario logs adapter adapter-name -t tenant-name -s scenario-name -f

  $ scenario logs adapter adapter-name -t tenant-name -s scenario-name -l 100

  $ scenario logs adapter adapter-name -t tenant-name -s scenario-name --json
```

_See code: [src/commands/logs/adapter.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/logs/adapter.ts)_

## `scenario reset adapter ADAPTER`

Reset a adapter

```
USAGE
  $ scenario reset adapter ADAPTER -s <value> -t <value> [--profile <value>] [-b <value>] [-e <value>]

ARGUMENTS
  ADAPTER  adapter name or id

FLAGS
  -b, --bucket=<value>    time bucket
  -e, --eventId=<value>   time uuid
  -s, --scenario=<value>  (required) scenario
  -t, --tenant=<value>    (required) tenant
      --profile=<value>   Specify the configuration profile to use

DESCRIPTION
  Reset a adapter

EXAMPLES
  $ scenario reset adapter adapter-name -t tenant-name -s scenario-name -b 20240718110000

  $ scenario reset adapter adapter-name -t tenant-name -s scenario-name -e 9cb35da2-ba64-4bb5-86d6-ef20ebc62ab7
```

_See code: [src/commands/reset/adapter.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/reset/adapter.ts)_

## `scenario scenario apply`

Apply a manifest configuration for a Scenario to the Flowcore Platform

```
USAGE
  $ scenario scenario apply -f <value> [--profile <value>] [-d] [-n <value>] [-t <value>] [-y]

FLAGS
  -d, --[no-]deploy      deploy the scenario after applying
  -f, --file=<value>...  (required) file to apply
  -n, --name=<value>     name of the scenario to apply
  -t, --tenant=<value>   tenant to apply the scenario to, this is the org for your organization, it can be seen in the
                         url when accessing your organization
  -y, --yes              skip confirmation
      --profile=<value>  Specify the configuration profile to use

DESCRIPTION
  Apply a manifest configuration for a Scenario to the Flowcore Platform

EXAMPLES
  $ scenario scenario apply -t flowcore -f example.yaml

  $ scenario scenario apply -t flowcore -n scenario-name -f example.yaml

  $ cat <<EOF | scenario scenario apply -f -
```

_See code: [src/commands/scenario/apply.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/scenario/apply.ts)_

## `scenario scenario generate manifest`

Generate a scenario manifest

```
USAGE
  $ scenario scenario generate manifest -t <value> [--profile <value>] [-f <value>] [-n <value>] [-o] [--placeholder]

FLAGS
  -f, --file=<value>     file to apply
  -n, --name=<value>     name of the scenario to generate
  -o, --overwrite        overwrite the existing scenario
  -t, --tenant=<value>   (required) tenant to apply the scenario to, this is the org for your organization, it can be
                         seen in the url when accessing your organization
      --placeholder      generate a placeholder manifest
      --profile=<value>  Specify the configuration profile to use

DESCRIPTION
  Generate a scenario manifest

EXAMPLES
  $ scenario scenario generate manifest -t flowcore

  $ scenario scenario generate manifest -t flowcore --placeholder

  $ scenario scenario generate manifest -t flowcore -f example.yaml

  $ scenario scenario generate manifest -t flowcore -n scenario-name -f example.yaml
```

_See code: [src/commands/scenario/generate/manifest.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/scenario/generate/manifest.ts)_

## `scenario scenario generate transformer`

add a transformer to a scenario manifest

```
USAGE
  $ scenario scenario generate transformer [--profile <value>] [-d <value>] [-f <value>] [-n <value>]

FLAGS
  -d, --description=<value>  description of the transformer
  -f, --file=<value>         file to modify
  -n, --name=<value>         name of the transformer to generate
      --profile=<value>      Specify the configuration profile to use

DESCRIPTION
  add a transformer to a scenario manifest

EXAMPLES
  $ scenario scenario generate transformer -n flow-type-name

  $ scenario scenario generate transformer -n flow-type-name -d "description of the transformer"

  $ scenario scenario generate transformer -n flow-type-name -d "description of the transformer" -f example.yaml
```

_See code: [src/commands/scenario/generate/transformer.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/scenario/generate/transformer.ts)_

## `scenario scenario local`

Spin up local stream threads based on a scenario manifest

```
USAGE
  $ scenario scenario local -e <value> -f <value> [--profile <value>] [-H <value>] [-m http] [-c] [-s <value>] [-t
    <value>] [-y]

FLAGS
  -H, --header=<value>...  [default: ] header to send with the request, example: (-H 'Authorization: Bearer TOKEN')
  -c, --scan               Scan the full time range
  -e, --endpoint=<value>   (required) stream endpoint
  -f, --file=<value>...    (required) file to apply
  -m, --mode=<option>      [default: http] stream mode
                           <options: http>
  -s, --start=<value>      Start time bucket to stream from, example: (1y, 1m, 1w, 1d, 1h, now)
  -t, --timeout=<value>    [default: 5000] Timeout in milliseconds to wait for a response from the destination
  -y, --yes                skip confirmation
      --profile=<value>    Specify the configuration profile to use

DESCRIPTION
  Spin up local stream threads based on a scenario manifest

EXAMPLES
  $ scenario scenario local -f example.yaml

  $ cat <<EOF | scenario scenario local -f -
```

_See code: [src/commands/scenario/local.ts](https://github.com/flowcore/flowcore-cli-plugin-scenario/blob/v2.11.0/src/commands/scenario/local.ts)_
<!-- commandsstop -->
