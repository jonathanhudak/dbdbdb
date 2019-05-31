'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch = _interopDefault(require('isomorphic-fetch'));

function parseQueryString(str) {
  var ret = Object.create(null);

  if (typeof str !== "string") {
    return ret;
  }

  str = str.trim().replace(/^(\?|#|&)/, "");

  if (!str) {
    return ret;
  }

  str.split("&").forEach(function(param) {
    var parts = param.replace(/\+/g, " ").split("=");
    // Firefox (pre 40) decodes `%3D` to `=`
    // https://github.com/sindresorhus/query-string/pull/37
    var key = parts.shift();
    var val = parts.length > 0 ? parts.join("=") : undefined;

    key = decodeURIComponent(key);

    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    val = val === undefined ? null : decodeURIComponent(val);

    if (ret[key] === undefined) {
      ret[key] = val;
    } else if (Array.isArray(ret[key])) {
      ret[key].push(val);
    } else {
      ret[key] = [ret[key], val];
    }
  });

  return ret;
}

const Dropbox = require("dropbox").Dropbox;

const TOKEN_KEY = "dbdbtoken";

function createJsonFile(content, fileName = "dbdb.json") {
  return new File([JSON.stringify(content, null, 2)], fileName, {
    type: "text/json",
    lastModified: new Date().getTime()
  });
}

function uploadFile({ client, path, file }) {
  return client.filesUpload({
    path,
    contents: file,
    mode: "overwrite"
  });
}

function index({
  databaseFileName = "dbdb",
  databaseDirectoryPath = "/",
  authRedirect = window.location.origin,
  clientId,
  fetchMethod = fetch,
  defaultAccessToken,
  tokenKey = TOKEN_KEY
}) {
  let client;
  const databaseFileNameWithExtension = `${databaseFileName}.json`;
  const databaseFilePath = `${databaseDirectoryPath}${databaseFileNameWithExtension}`;

  function getAccessTokenFromUrl() {
    return parseQueryString(window.location.hash).access_token;
  }

  function createClient() {
    const sessionToken = sessionStorage.getItem(tokenKey);
    const accessToken =
      defaultAccessToken || sessionToken || getAccessTokenFromUrl();

    if (!sessionToken && accessToken) {
      sessionStorage.setItem(tokenKey, accessToken);
    }

    if (accessToken) {
      client = new Dropbox({ accessToken, fetch: fetchMethod });
      return getClient();
    }
  }

  if (defaultAccessToken) createClient();

  function getClient() {
    return client || createClient();
  }

  function getAuthUrl() {
    const dbx = new Dropbox({ clientId, fetch });
    return dbx.getAuthenticationUrl(authRedirect);
  }

  function logOutDropbox() {
    client = undefined;
    window.sessionStorage.removeItem(tokenKey);
  }

  function saveDatabase({ data, databaseName }) {
    uploadFile({
      client,
      file: createJsonFile(data, databaseName),
      path: databaseFilePath
    });
  }

  function readDatabase() {
    return new Promise((resolve, error) => {
      client
        .filesSearch({
          path: "",
          query: databaseFileNameWithExtension
        })
        .then(({ matches }) => {
          if (matches && matches.length) {
            const [databaseFile] = matches;
            client
              .filesDownload({ path: databaseFile.metadata.path_display })
              .then(r => {
                var fileReader = new FileReader();
                fileReader.onload = function() {
                  resolve(JSON.parse(this.result));
                };
                fileReader.readAsText(r.fileBlob);
              });
          } else {
            console.warn("no db found");
            resolve();
          }
        });
    });
  }

  async function updateDatabase({ data, databaseName }) {
    const currentDatabase = await readDatabase();
    return uploadFile({
      client,
      file: createJsonFile({ ...currentDatabase, ...data }, databaseName),
      path: databaseFilePath
    });
  }

  async function uploadImage({ path = "/images/", file }) {
    const filePath = `${path}${file.name}`;
    await client.filesUpload({
      path: filePath,
      contents: file,
      mode: "overwrite"
    });
    const image = await client.sharingCreateSharedLink({ path: filePath });
    return {
      ...image,
      name: file.name,
      url: image.url.replace(/.$/, "1")
    };
  }

  return {
    authUrl: getAuthUrl(),
    createClient,
    getClient,
    logOutDropbox,
    readDatabase,
    saveDatabase,
    updateDatabase,
    uploadImage
  };
}

module.exports = index;
