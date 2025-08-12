require("dotenv").config();
const localStorage = require("localStorage");
const APS = require("forge-apis");
const axios = require("axios");
const { ACCESS_TOKEN, EXPIRES_IN, REFRESH_TOKEN, APP_BASE_URL } = process.env;
const {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES,
  PUBLIC_TOKEN_SCOPES,
} = require("../../config");

const internalAuthClient = new APS.AuthClientThreeLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES
);
const publicAuthClient = new APS.AuthClientThreeLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  PUBLIC_TOKEN_SCOPES
);

const service = (module.exports = {});

service.getAuthorizationUrl = () => internalAuthClient.generateAuthUrl();

service.authCallbackMiddleware = async (req, res, next) => {
  const internalCredentials = await internalAuthClient.getToken(req.query.code);

  console.log("INTERNAL CREDS", internalCredentials);

  const publicCredentials = await publicAuthClient.refreshToken(
    internalCredentials
  );

  console.log("PUBLIC CREDS", publicCredentials);

  req.session.public_token = publicCredentials.access_token;
  req.session.internal_token = internalCredentials.access_token;
  req.session.refresh_token = publicCredentials.refresh_token;

  req.session.expires_at = Date.now() + internalCredentials.expires_in * 1000;

  //console.log('PROFILE', profile);

  localStorage.setItem("access_token", req.session.public_token);
  localStorage.setItem("refresh_token", publicCredentials.refresh_token);
  localStorage.setItem("expires_in", internalCredentials.expires_in);
  localStorage.setItem(
    "expires_at",
    Date.now() + internalCredentials.expires_in * 1000
  );
  next();
};

service.authRefreshMiddleware = async (req, res, next) => {
  //const { refresh_token, expires_at } = req.session;
  const { userEmail } = req.params;
  let refresh_token = localStorage.getItem("refresh_token") ?? REFRESH_TOKEN;
  let expires_at =
    Number(localStorage.getItem("expires_at")) ??
    Date.now() + EXPIRES_IN * 1000;
  let access_token = localStorage.getItem("access_token") ?? ACCESS_TOKEN;
  let expires_in = Number(localStorage.getItem("expires_in")) ?? EXPIRES_IN;

  //console.log('Local Storage', localStorage)

  if (!refresh_token) {
    // refresh_token = REFRESH_TOKEN;
    // expires_at = Date.now() + expires_in * 100000;

    // req.session.public_token = access_token;
    // req.session.internal_token = access_token;
    // req.session.refresh_token = refresh_token;
    // req.session.expires_at = expires_at;
    res.status(401).end();
    return;
  }

  //console.log("Refresh Token", refresh_token, expires_at);
  if (expires_at < Date.now()) {
    const internalCredentials = await internalAuthClient.refreshToken({
      refresh_token,
    });
    const publicCredentials = await publicAuthClient.refreshToken(
      internalCredentials
    );
    req.session.public_token = publicCredentials.access_token;
    req.session.internal_token = internalCredentials.access_token;
    req.session.refresh_token = publicCredentials.refresh_token;
    req.session.expires_at = Date.now() + internalCredentials.expires_in * 1000;

    localStorage.setItem("access_token", publicCredentials.access_token);
    localStorage.setItem("refresh_token", publicCredentials.refresh_token);
    localStorage.setItem("expires_in", internalCredentials.expires_in);
    localStorage.setItem(
      "expires_at",
      Date.now() + internalCredentials.expires_in * 1000
    );
  }
  req.internalOAuthToken = {
    access_token: req.session.internal_token ?? access_token,
    expires_in: Math.round(
      (req.session.expires_at ?? expires_at - Date.now()) / 1000
    ),
  };
  req.publicOAuthToken = {
    access_token: req.session.public_token ?? access_token,
    expires_in: Math.round(
      (req.session.expires_at ?? expires_at - Date.now()) / 1000
    ),
  };



  next();
};

service.getUserProfile = async (token) => {
  const resp = await new APS.UserProfileApi().getUserProfile(
    internalAuthClient,
    token
  );
  return resp.body;
};

service.getTokens = async (email) => {
  const resp = await axios.get(`${APP_BASE_URL}/api/sqlite/token/${email}`);

  return resp;
};

service.refreshToken = async () => {};
