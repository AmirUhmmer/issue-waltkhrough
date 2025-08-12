const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const formidable = require("formidable");

const config = require("../../config");
const { authRefreshMiddleware } = require("../services/oauth");
const model_derivative_services = require("../services/modelderivative");

router.get("/api/thumbnail/:urn", authRefreshMiddleware, async (req, res) => {
  config.credentials.token_3legged = req.internalOAuthToken.access_token;

  try {
    const { urn } = req.params;

    const { height, width } = req.query;
    const size = height
      ? { height: height, width: height }
      : width
      ? { height: width, width: width }
      : { height: 40, width: 40 };

    //get issues collection with the filter
    const thumbnail = await model_derivative_services.getThumbnail(urn, size);
    res.writeHead(200, { "Content-Type": "image/png" });

    thumbnail.pipe(res);
  } catch (err) {
    console.log(`/api/thumbnail/urn`, err);
    res.status(500).end;
  }
});

router.get(
  "/api/modelderivative/properties/:urn/:modelGuid",
  authRefreshMiddleware,
  async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;

    try {
      const { urn, modelGuid } = req.params;

      const { objectId } = req.query;

      //get properties
      const allProperties = await model_derivative_services.getAllProperties(
        urn,
        modelGuid,
        objectId
      );

      res.json(allProperties);
    } catch (err) {
      console.log(`/api/modelderivative/:urn/:modelGuid`, err);
      res.status(500).end;
    }
  }
);

router.get(
  "/api/modelderivative/metadata/:urn",
  authRefreshMiddleware,
  async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;

    try {
      const { urn } = req.params;
      const metadata = await model_derivative_services.getMetadata(urn);

      res.json(metadata);
    } catch (e) {
      console.log(`/api/modelderivative/metadata/:urn`, e);
      res.status(500).end;
    }
  }
);
module.exports = router;
