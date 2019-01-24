import fetch from "isomorphic-fetch";
import { parseQueryString } from "./utils";

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

export default function({
  databaseFileName = "dbdb",
  databaseDirectoryPath = "/",
  authRedirect = window.location.origin,
  clientId,
  fetchMethod = fetch,
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
    const accessToken = sessionToken || getAccessTokenFromUrl();

    if (!sessionToken && accessToken) {
      sessionStorage.setItem(tokenKey, accessToken);
    }

    if (accessToken) {
      client = new Dropbox({ accessToken, fetch: fetchMethod });
      return getClient();
    }
  }

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

  return {
    authUrl: getAuthUrl(),
    createClient,
    getClient,
    logOutDropbox,
    readDatabase,
    saveDatabase
  };
}
