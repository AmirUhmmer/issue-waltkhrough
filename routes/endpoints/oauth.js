require("dotenv").config();
const {
  APS_USER_NAME,
  APS_PASSWORD,
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  TENANT_ID,
  AZURE_CLIENT_ID,
  SSO_CALLBACK,
  APP_BASE_URL
} = process.env;

const express = require("express");
let router = express.Router();

const puppeteer = require("puppeteer");
const { chromium } = require("playwright");
const axios = require("axios");
const {
  getAuthorizationUrl,
  authCallbackMiddleware,
  authRefreshMiddleware,
  getUserProfile,
  getTokens
} = require("../services/oauth");

router.get("/api/auth/login", function (req, res) {
  const authUrl = getAuthorizationUrl();
  // console.log(authUrl);
  res.redirect(authUrl);
});

router.get("/api/auth/sso", async function (req, res) {
  const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?client_id=${AZURE_CLIENT_ID}&response_type=id_token&redirect_uri=${encodeURIComponent(
    SSO_CALLBACK
  )}&scope=openid profile email&response_mode=fragment&nonce=${crypto.randomUUID()}&prompt=none`;
  //console.log(authUrl);
  res.json(authUrl);
});

router.get("/api/auth/mssso", function (req, res) {
  const { id_token } = req.query;
  const authUrl = getAuthorizationUrl() + `&id_token=${id_token}`;
  res.redirect(authUrl);
//   const publicToken = req.session.public_token;
//   const refreshToken = req.session.refresh_token;
//   const expires_at = req.session.expires_at;
//   const internal_token = req.session.internal_token;

//   res.send(`
//     <script>
//         if (window.opener) {
//             // Send the token back to the parent window

//             window.opener.postMessage({ token: '${publicToken}', refreshToken: '${refreshToken}', expires_at: '${expires_at}', internal_token: '${internal_token}' }, window.location.origin);

//             window.close();  // Close the popup
//         }
//     </script>
// `);

});

router.get("/api/auth/3lo", function (req, res) {
  const { id_token } = req.query;
  const authUrl = getAuthorizationUrl() + `id_token=${id_token}`;

  (async () => {
    const browser = await chromium.launch({ headless: false }); // Set to true for headless
    const context = await browser.newContext({
      userAgent: "LE",
      viewport: { width: 1280, height: 720 },
      locale: "en-US",
    });
    const page = await context.newPage();

    try {
      // Go to the Autodesk login page
      await page.goto(authUrl);
      // Fill in the email field and proceed
      await page.fill("#userName", APS_USER_NAME);
      await page.waitForTimeout(1000 + Math.random() * 2000); // Random delay
      await page.click("#verify_user_btn");
      console.log("verify user...");
      // Wait for the password field to appear
      // await page.waitForSelector("#password", { visible: true });
      // await page.fill("#password", APS_PASSWORD);
      // // Submit the login form
      // await page.waitForTimeout(1000 + Math.random() * 2000); // Random delay
      // await page.click("#btnSubmit");

      // console.log("verify password...");

      // // Wait for the redirection to the redirect URI
      // console.log("redirecting...");
      // await page.waitForURL();

      // Extract the authorization code from the URL
      console.log("allow access...");
      //  await page.pause();
      // if (await page.locator("selector-for-captcha").isVisible()) {
      //   console.log("CAPTCHA detected. Pausing for manual resolution.");
      //   await page.pause(); // Allow manual resolution
      // }
      await page.click("#allow_btn");

      await page.waitForURL();
      //  console.log("redirecting to callback...")
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      await page.close();
      await browser.close();
      res.send(req.session);
    }
  })();
  //  const url = page.url();

  //  const authCode = new URL(url).searchParams.get('code');
  //   console.log('Authorization Code:', authCode);
  //
  // if (!authCode) {
  //   throw new Error('Failed to retrieve authorization code. Check your credentials and app setup.');
  // }

  // Exchange the authorization code for tokens
  // const tokenResponse = await axios.post(
  //   'https://developer.api.autodesk.com/authentication/v2/token',
  //   new URLSearchParams({
  //     client_id: APS_CLIENT_ID,
  //     client_secret: APS_CLIENT_SECRET,
  //     grant_type: 'authorization_code',
  //     code: authCode,
  //     redirect_uri: APS_CALLBACK_URL,
  //   }),
  //   {
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   }
  // );

  // const { access_token, refresh_token } = tokenResponse.data;
  // console.log('Access Token:', access_token);
  // console.log('Refresh Token:', refresh_token);

  // Save tokens securely or use them in your application.
  // res.redirect("/");
});

router.get("/api/auth/redirect-url", function (req, res) {
  res.json({ redirectUrl: getAuthorizationUrl() });
});

router.get("/api/auth/logout", function (req, res) {
  req.session = null;
  res.redirect("/");
});

router.get(
  "/api/auth/callback",
  authCallbackMiddleware,
  async function (req, res) {
    // res.redirect("/");
    const publicToken = req.session.public_token;
    const refreshToken = req.session.refresh_token;
    const expires_at = req.session.expires_at;
    const internal_token = req.session.internal_token;

    //window.opener.postMessage({ token: '${publicToken}' }, window.location.origin);

    res.send(`
        <script>
            if (window.opener) {
                // Send the token back to the parent window

                window.opener.postMessage({ token: '${publicToken}', refreshToken: '${refreshToken}', expires_at: '${expires_at}', internal_token: '${internal_token}' }, window.location.origin);

                window.close();  // Close the popup
            }
        </script>
    `);
  }
);

router.get("/api/auth/token", authRefreshMiddleware, function (req, res) {
  res.json(req.publicOAuthToken);
});

// router.get(
//   "/api/auth/profile",
//   authRefreshMiddleware,
//   async function (req, res, next) {
//     try {
//       const profile = await getUserProfile(req.internalOAuthToken);
//       res.json({ name: `${profile.family_name}, ${profile.given_name}`, userid: profile.sub });
//     } catch (err) {
//       next(err.data);
//     }
//   }
// );


router.get('/api/auth/profile', authRefreshMiddleware, async function (req, res, next) {
    try {
        const profile = await getUserProfile(req.internalOAuthToken.access_token);
        res.json({ name: `${profile.family_name}, ${profile.given_name}`, userid: profile.sub });
    } catch (err) {
        next(err);
    }
});

router.get(
  "/api/auth/profile/:userEmail",
  authRefreshMiddleware,
  async function (req, res, next) {
    try {
      const profile = await getUserProfile(req.internalOAuthToken);
      //   console.log('PROFILE', profile);
      res.json({ name: `${profile.family_name}, ${profile.given_name}` });
    } catch (err) {
      next(err.data);
    }
  }
);




module.exports = router;
