# DBDBDB - Simple JSON File Database Using [Dropbox Javascript SDK](https://github.com/dropbox/dropbox-sdk-js)

### Prerequisites

1. Create an dropbox api App folder app: https://www.dropbox.com/developers
2. Save the app key

### Add as a dependency to your app.

1. `npm i dbdbdb --save`
2. See [example](https://github.com/jonathanhudak/dbdb/tree/master/src/demo) for usage with React

### Basic Example:

```js
import dbdb from "dbdbdb";

const { getClient, createClient } = dbdb({ clientId: "xhb23gwddzfsp8k" });

const loginLink = document.createElement("a");
loginLink.href = db.authUrl;
loginLink.innerText = "login";

const client = getClient() || createClient();

if (!client) {
  document.body.appendChild(loginLink);
} else {
  client.usersGetCurrentAccount().then(d => {
    const userInfo = document.createElement("pre");
    userInfo.style.backgroundColor = "lavender";
    userInfo.style.padding = "8px";
    userInfo.innerText = JSON.stringify(d, null, 2);
    document.body.appendChild(userInfo);
  });
}
```

authUrl
createClient,
getClient,
logOutDropbox,
readDatabase,
saveDatabase,
updateDatabase,
uploadImage
