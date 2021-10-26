# Rush Install Action
<p align="center">
  <a href="https://standardjs.com"><img alt="JavaScript Style Guide" src="https://img.shields.io/badge/code_style-standard-brightgreen.svg"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg"></a>
<a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fadvancedcsg-open%2Factions-rush?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fadvancedcsg-open%2Factions-rush.svg?type=shield"/></a>
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
  <a href="https://sonarcloud.io/dashboard?id=advancedcsg-open_actions-rush"><img alt="Quality Gate Status" src="https://sonarcloud.io/api/project_badges/measure?project=advancedcsg-open_actions-rush&metric=alert_status"></a>
</p>

---

Used to better manage rush inside a workflow. Manages caching of packages to ensure speedy execution.

## Usage

### Pre-requisites
---
This action requires rush version 5.47.0 or newer.

### Inputs
---
#### `package-manager`
Specifies the package manager used by your rush repository. Valid values are:
- `pnpm` (default)
- `npm`
- `yarn`

#### `build`
If set to `true` will run `rush build` if `rush install` completes successfully. The deafult value is `false`

### Example
---
Below example will work with `pnpm` as the default package manager and will additionally run `rush build`.
```yaml
# .github/workflows/rush.yml
name: Rush Install

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Rush Install
        uses: advancedcsg-open/actions-rush
        with:
          build: true
```

### License

actions-rush is licensed under the MIT License. See the LICENSE file for more info.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fadvancedcsg-open%2Factions-rush.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fadvancedcsg-open%2Factions-rush?ref=badge_large)