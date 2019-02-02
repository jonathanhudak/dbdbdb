# DBDBDB - Simple JSON File Database Using [Dropbox Javascript SDK](https://github.com/dropbox/dropbox-sdk-js)

## Prerequisites

1. Create an dropbox api App folder app: https://www.dropbox.com/developers
2. Save the app key

### Add as a dependency to your app.

1. `npm i dbdbdb --save`
2. See [example](https://github.com/jonathanhudak/dbdb/tree/master/src/demo) for usage with React

### Usage:

Install: `npm i dbdbdb --save`

```js
import dbdb from "dbdbdb";

const {
  authUrl,
  getClient,
  logOutDropbox,
  readDatabase,
  updateDatabase,
  uploadImage
} = dbdb({ clientId: "YOUR_APP_KEY" });
```

### `authUrl` String

A link to enable a user to authenticate with Dropbox and redirect to your app with an auth token.

Dropbox SDK Reference: http://dropbox.github.io/dropbox-sdk-js/Dropbox.html#getAuthenticationUrl

Authentication Flow Information: https://www.dropbox.com/developers/reference/oauth-guide

### `getClient` Function

Returns a [Dropbox SDK class](http://dropbox.github.io/dropbox-sdk-js/Dropbox.html) instance. If a client instance is not yet available, it creates a new one by using a token found in sessionStorage or in the current url.

### `logOutDropbox` Function

Removes authentication token from localStorage. You are responsible for destroying your application's SDK client instance.

### `readDatabase` Function

Returns a Promise. Fetches the configured JSON database file from dropbox, parses the data and returns it.

**Usage**:

```js
readDatabase().then(({ articles }) => {
  // do something with articles
});
```

### `updateDatabase` Async Function

Returns a Promise. Reads the current database, then peforms a shallow merge of that with the new data provided in argument.

**Usage**:

```js
updateDatabase({ data: { articles: [{ title: "My Article" }] } });
```

### `uploadImage` Async Function

Returns a file object containing a public image url.

**Usage**:

```js
const image = await uploadImage({ file: { ... } });
console.log(image.url); // https://public-url-to-image
```

See [React example](https://github.com/jonathanhudak/dbdb/tree/master/src/demo)
