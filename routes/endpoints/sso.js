require("dotenv").config();
const {
  TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  SSO_CALLBACK,
  APP_BASE_URL
} = process.env;

const passport = require('passport');
const { Strategy } = require('passport-oauth2');
const axios = require('axios');

const express = require("express");
let router = express.Router();

passport.use(
    new Strategy(
        {
            authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            clientID: AZURE_CLIENT_ID,
            clientSecret: AZURE_CLIENT_SECRET,
            callbackURL: "http://localhost:8080/sso/auth/callback",
            scope: ['openid', 'profile', 'email', 'User.Read']
        },
        async (accessToken, refreshToken, params, profile, done) => {
            try {
                // Fetch user profile from Microsoft Graph API
                const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                const userProfile = response.data; // Contains email, name, etc.
                return done(null, userProfile);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Serialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.initialize();
passport.session();

router.get('/sso/auth', passport.authenticate('oauth2'));

router.get('/sso/auth/callback',
    passport.authenticate('oauth2', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile');
    }
);

router.get('/sso/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth');
    }
    res.json(req.user); // Returns Microsoft profile with email
});

// Logout
router.get('/sso/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;