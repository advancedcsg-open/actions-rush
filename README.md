# Rush Install Action
<p align="center">
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

---

Used to better manage rush inside a workflow. Manages caching of packages to ensure speedy execution.

## Usage

### Pre-requisites
---
This action requires rush version 5.47.0 or newer.

### Example
---
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
```

### License

actions-rush is licensed under the MIT License. See the LICENSE file for more info.