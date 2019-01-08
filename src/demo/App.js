import React, { useState, useEffect, Suspense } from "react";
import { getAuthUrl, getClient, createClient, logOutDropbox } from "..";
import { hot } from "react-hot-loader/root";

const authUrl = getAuthUrl(process.env.APP_ID);

function App() {
  const [client, setClient] = useState(getClient());

  useEffect(() => {
    setClient(createClient());
  }, []);
  function logOut() {
    logOutDropbox();
    setClient(null);
  }
  return (
    <div>
      {client ? (
        <button onClick={logOut}>Logout</button>
      ) : (
        <a href={authUrl}>Login</a>
      )}
      <pre>{JSON.stringify(client, null, 2)}</pre>
    </div>
  );
}
export default hot(App);
