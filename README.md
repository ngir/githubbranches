## githubbranches
Tool to retrieve branches with a given name inside a GitHub organization

## How to use
Fill application.properties :
- git.organization : GitHub organization's name
- git.user : GitHub user's nickname
- git.token : GitHub personal access token, to grand access to your GitHub account https://github.com/settings/tokens
- git.branch : The GitHub branch we're looking for
- proxy.isEnabled : Set to true if a proxy is needed to access the internet
- proxy.url : Proxy's url, only needed if proxy.isEnabled is set to true

```
npm install
```
```
node bin/index.js
```
