import fetch from "isomorphic-fetch";
import { parseQueryString } from "./utils";

const Dropbox = require("dropbox").Dropbox;

const TOKEN_KEY = "dbdbtoken";

let client;

export function getClient() {
  return client;
}

export function getAccessTokenFromUrl() {
  return parseQueryString(window.location.hash).access_token;
}

export function createClient({ defaultAccessToken, fetchMethod = fetch } = {}) {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  const accessToken =
    defaultAccessToken || sessionToken || getAccessTokenFromUrl();

  console.log(accessToken);
  if (!sessionToken && accessToken) {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
  }

  if (accessToken) {
    console.log("accessToken", accessToken);
    client = new Dropbox({ accessToken, fetch: fetchMethod });
    return getClient();
  }

  console.warn("No access token for Dropbox available");
}

export function getAuthUrl(clientId) {
  const dbx = new Dropbox({ clientId, fetch });
  return dbx.getAuthenticationUrl(`${window.location.origin}/auth`);
}

export function logOutDropbox() {
  console.log("logOutDropbox called");
  window.sessionStorage.removeItem(TOKEN_KEY);
}
