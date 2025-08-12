const APS = require("forge-apis");
const {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES,
  PUBLIC_TOKEN_SCOPES,
} = require("../../config");
const { get } = require("./fetch_common.js");
const config = require("../../config");

const internalAuthClient = new APS.AuthClientThreeLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES
);

const service = (module.exports = {});
service.getHubs = async (token) => {
  const resp = await new APS.HubsApi().getHubs(null, internalAuthClient, token);
  return resp.body.data.filter(
    (i) => i.attributes.extension.type == "hubs:autodesk.bim360:Account"
  );
};

service.getProjects = async (hubId, token) => {
  const resp = await new APS.ProjectsApi().getHubProjects(
    hubId,
    null,
    internalAuthClient,
    token
  );
  return resp.body.data;
};

service.getProjectContents = async (hubId, projectId, folderId, token) => {
  if (!folderId) {
    const resp = await new APS.ProjectsApi().getProjectTopFolders(
      hubId,
      projectId,
      internalAuthClient,
      token
    );
    return resp.body.data;
  } else {
    const resp = await new APS.FoldersApi().getFolderContents(
      projectId,
      folderId,
      null,
      internalAuthClient,
      token
    );
    return resp.body.data;
  }
};

service.getItemVersions = async (projectId, itemId, token) => {
  const resp = await new APS.ItemsApi().getItemVersions(
    projectId,
    itemId,
    null,
    internalAuthClient,
    token
  );
  return resp.body.data;
};

service.getOneProject = async (hubId, projectId) => {
  try {
    let endpoint = config.endpoints.dataManagement.one_project.format(
      hubId,
      projectId
    );
    const headers = config.endpoints.httpHeaders(
      config.credentials.token_3legged
    );
    const response = await get(endpoint, headers);

    console.log(`getting one project ${projectId} of hubId ${hubId}`);
    return response.data;
  } catch (e) {
    console.error(
      `getting one project ${projectId} of hubId ${hubId} failed: ${e}`
    );
    return {};
  }
};
