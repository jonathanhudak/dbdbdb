import React, { useState, useEffect, useReducer } from "react";
import { hot } from "react-hot-loader/root";
import dbdb from "../index.js";

const {
  authUrl,
  getClient,
  createClient,
  logOutDropbox,
  readDatabase,
  saveDatabase,
  uploadImage,
  updateDatabase
} = dbdb({
  clientId: process.env.APP_ID,
  defaultAccessToken: process.env.DROPBOX_ACCESS_TOKEN
});

const UserInfo = ({ client }) => {
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    client.usersGetCurrentAccount().then(setUserInfo);
  }, []);

  return userInfo ? (
    <div>
      <div>
        <h2>{userInfo.name.familiar_name}</h2>
        <img
          style={{ borderRadius: "50%" }}
          with={50}
          height={50}
          src={userInfo.profile_photo_url}
          alt={userInfo.name.display_name}
        />
      </div>
    </div>
  ) : (
    "loading..."
  );
};

const Loading = () => <div>loading...</div>;

function ArticleForm({ save }) {
  const [value, setValue] = useState("");
  function submit(e) {
    e.preventDefault();
    if (value) {
      save(value);
      setValue("");
    }
  }
  return (
    <form onSubmit={submit}>
      <label>
        Article Title
        <input
          value={value}
          onChange={({ target }) => setValue(target.value)}
          placeholder="Apple"
        />
      </label>
    </form>
  );
}

function ImageGallery() {
  const [imagesFetched, setImagesFetched] = useState(false);
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  function uploadFile(e) {
    setFile([...e.target.files][0]);
  }
  async function save(e) {
    e.preventDefault();
    if (file) {
      const image = await uploadImage({ file });
      setImages([...images, image]);
    }
  }
  useEffect(() => {
    if (imagesFetched) {
      updateDatabase({ data: { imageGallery: images } });
    } else {
      readDatabase().then(({ imageGallery } = {}) => {
        setImages(imageGallery || []);
        setImagesFetched(true);
      });
    }
  }, [images]);
  if (!imagesFetched) return <p>Loading images...</p>;
  return (
    <div>
      <form onSubmit={save}>
        <label htmlFor="image">Choose an image:</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={uploadFile}
          accept="image/png, image/jpeg"
        />
        <button type="submit">Upload</button>
      </form>
      {images.map(image => (
        <img key={image.url} src={image.url} alt={image.name} />
      ))}
    </div>
  );
}

function App() {
  const [articlesFetched, setArticlesFetched] = useState(false);
  const [articles, setArticles] = useState([]);
  const [client, setClient] = useState(getClient() || createClient());

  function logOut() {
    logOutDropbox();
    setClient(null);
  }

  useEffect(() => {
    if (!client) return;
    if (articlesFetched) {
      updateDatabase({ data: { articles } });
    } else {
      readDatabase().then(({ articles } = {}) => {
        setArticles(articles || []);
        setArticlesFetched(true);
      });
    }
  }, [articles]);

  return (
    <div>
      {client ? (
        <div>
          <button onClick={logOut}>Logout</button>
          <UserInfo client={client} />
          {client && <ImageGallery />}
          {articlesFetched ? (
            <ul>
              {articles.map(a => (
                <li key={a}>{a}</li>
              ))}
              <li>
                <ArticleForm
                  save={article => setArticles([...articles, article])}
                />
              </li>
            </ul>
          ) : (
            <p>Loading articles...</p>
          )}
        </div>
      ) : (
        <a href={authUrl}>Login</a>
      )}
    </div>
  );
}
export default hot(App);
