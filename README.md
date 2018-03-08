# npm-user-switch

> Easily switch NPM user accounts

## About
Both my work and my personal development utilise NPM accounts. Sometimes I need to easily switch between them, and entering their different passwords is tiresome. Using `npm-user-switch`, I can easily use one master password to manage logging in to any number of accounts.

The account information is encrypted using [**Buttercup**](https://buttercup.pw) and stored locally. No account passwords are stored - only the auth token provided by NPM (stored by NPM in `.npmrc` in your home directory).

## Installation
`npm-user-switch` should be installed globally:

```shell
npm install npm-user-switch -g
```

_You may need `sudo` for the above command to work on some systems._

## Usage
Simply execute `npm-user-switch` to start the program.
