const { ok } = require("assert");
const config = require("../../config");
const { get, post, patch, put, getBinary } = require("./fetch_common");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getThumbnail(urn, size) {
  try {
    let endpoint =
      config.endpoints.modelDerivative.thumbnail.format(urn) +
      `?width=${size.width}&height=${size.height}`;
    //apply with filters
    const headers = config.endpoints.httpHeaders(
      config.credentials.token_3legged
    );
    const response = await getBinary(endpoint, headers);

    //     console.log(response);
    if (response) {
      console.log(`getting thumbnail for urn ${urn}`);
      return response;
    } else {
      return {};
    }
  } catch (e) {
    console.error(`getting thumbnail for  ${urn} failed: ${e}`);
    return {};
  }
}

async function getAllProperties(urn, modelGuid, objectId = null) {
  try {
    let endpoint = config.endpoints.modelDerivative.allProperties;
    //apply with filters
    if (objectId) {
      endpoint = `${endpoint}?objectid=${objectId}`;
    }
    const headers = config.endpoints.httpHeaders(
      config.credentials.token_3legged
    );
    const response = await get(endpoint, headers);

    //     console.log(response);
    if (response) {
      console.log(`getting properties for urn ${urn}`);
      return response;
    } else {
      return {};
    }
  } catch (e) {
    console.error(`getting properties for  ${urn} failed: ${e}`);
    return {};
  }
}

async function getMetadata(urn) {
  try {
    let endpoint = config.endpoints.modelDerivative.metadata.format(urn);
    const headers = config.endpoints.httpHeaders(
      config.credentials.token_3legged
    );
    const response = await get(endpoint, headers);

    if (response) {
      console.log(`getting metadata for urn ${urn}`);
      return response;
    }
  } catch (e) {
    console.error(`getting metadata of urn ${urn} failed: ${e}`);
    return {};
  }
}

async function svf2() {
  try {
    let endpoint = config.endpoints.modelDerivative.job;
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged);
    const payload = req
    const response = await post(endpoint, headers);
    if (response ) {
      console.log(`svf2 job`)
    }
  } catch (e) {}
}

module.exports = {
  getThumbnail,
  getAllProperties,
  getMetadata,
};
