# BEIS SME Alpha

## Zero to Hero

### 1. Installs

#### Tools

* [Git](https://git-scm.com/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Node](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/)

#### Recommended VS Code extensions

* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [RainbowCSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv)
* [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv)

### 2. Register for access to the EPC API

Sign up for an Open Data Communities account here: https://epc.opendatacommunities.org/login

You should receive an email with your API key, which you will need later.

### 3. Set up

* Check out the code from GitHub.
```
git clone git@github.com:UKGovernmentBEIS/beis-business-energy-efficiency-sme-alpha.git
```
* Install dependencies via Yarn.
```
cd beis-business-energy-efficiency-sme-alpha/
yarn
```
* Create a file named `.env` at the root of the project to store your API credentials (your username and API key from step 2) and other configuration. The contents of the file should look like:
```
ODC_USERNAME = your.name@softwire.com
ODC_PASSWORD = yourapikey
USE_DUMMY_RECOMMENDATIONS = yes
```
* Run the `start` task to launch the site in development mode.
```
yarn start
```
* You should now be able to view the site at http://localhost:5000/.

### 4. Developing and debugging

Visual Studio Code is recommended for development and debugging.

#### Development

When running the site via `yarn start` (as above), the server will update and refresh automatically as you make changes, so you can immediately see changes when you refresh the browser window.

You can also install the [LiveReload browser extension](http://livereload.com/extensions/) for your browser of choice so that the site will reload automatically following changes, without the need to manually refresh.

#### Debugging

With the site running via `yarn start`, you can debug the Node process by using the **Attach** configuration, either:

* Press F5 with VS Code open; or
* Open the debug tab and click the green play button

This will allow you to set breakpoints, etc.
