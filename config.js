require('dotenv').config();
let { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, SERVER_SESSION_SECRET, PORT, WS_BASEURL } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_CALLBACK_URL || !SERVER_SESSION_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
const INTERNAL_TOKEN_SCOPES = ['viewables:read', 'data:read','data:write','account:read', 'bucket:create', 'bucket:read'];
const PUBLIC_TOKEN_SCOPES = ['viewables:read', 'account:read', 'data:read', 'data:write', 'bucket:create', 'bucket:read'];
PORT = PORT || 8080

const APS_BASE_URL = 'https://developer.api.autodesk.com';
var credentials = {
    token_3legged:''
}

const endpoints = {
    
    // bim360Issues:{
    //     get_user_profile:`${APS_BASE_URL}/issues/v2/containers/{0}/users/me`,
    //     get_issues:`${APS_BASE_URL}/issues/v2/containers/{0}/issues`,
    //     get_one_issue:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}`,
    //     patch_one_issue:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}`,
    //     get_issue_comments:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}/comments`,
    //     create_issue_comment:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}/comments`,
    //     get_issue_attachments:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}/attachments`,
    //     create_issue_attachments:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}/attachments`,
    //     update_issue_attachment_with_server:`${APS_BASE_URL}/issues/v2/containers/{0}/issues/{1}/attachments/{2}`,
    //     get_root_categories:`${APS_BASE_URL}/issues/v2/containers/{0}/issue-root-cause-categories`,
    //     get_issue_types:`${APS_BASE_URL}/issues/v2/containers/{0}/issue-types`,
    //     get_issue_attributes_defs:`${APS_BASE_URL}/issues/v2/containers/{0}/issue-attribute-definitions`
    //  },
     bim360Issues:{
        get_user_profile:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/users/me`,
        get_issues:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues`,
        get_one_issue:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}`,
        patch_one_issue:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}`,
        get_issue_comments:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}/comments`,
        create_issue_comment:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}/comments`,
        get_issue_attachments:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}/attachments`,
        create_issue_attachments:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}/attachments`,
        update_issue_attachment_with_server:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issues/{1}/attachments/{2}`,
        get_root_categories:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issue-root-cause-categories`,
        get_issue_types:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issue-types`,
        get_issue_attributes_defs:`${APS_BASE_URL}/construction/issues/v1/projects/{0}/issue-attribute-definitions`
     },
    dataManagement:{ 
        s3_signed_download:`${APS_BASE_URL}/oss/v2/buckets/{0}/objects/{1}/signeds3download`,
        s3_signed_upload:`${APS_BASE_URL}/oss/v2/buckets/{0}/objects/{1}/signeds3upload`,
        one_project: `${APS_BASE_URL}/project/v1/hubs/{0}/projects/{1}`
    }, 
    admin:{
        get_project_users:`${APS_BASE_URL}/bim360/admin/v1/projects/{0}/users`
    },
    relationship:{
         search:`${APS_BASE_URL}/bim360/relationship/v2/containers/{0}/relationships:search`,
    },
    modelDerivative: {
        thumbnail: `${APS_BASE_URL}/modelderivative/v2/regions/eu/designdata/{0}/thumbnail`,
        allProperties: `${APS_BASE_URL}/modelderivative/v2/regions/eu/designdata/{0}/metadata/{1}/properties`,
        metadata: `${APS_BASE_URL}/modelderivative/v2/regions/eu/designdata/{0}/metadata`,
        job: `${APS_BASE_URL}/modelderivative/v2/designdata/job`
    },
    
    modelSet : {
        modelSetViews: `${APS_BASE_URL}/bim360/modelset/v3/containers/{0}/modelsets/{1}/views/{2}`
    }, 
    aecDataModel: {
        graphql : `${APS_BASE_URL}/aec/graphql`
    },
   
    httpHeaders: function (access_token) {
        return {
          Authorization: 'Bearer ' + access_token,
          "X-Frame-Options": ""
        }
    } 
  }
  

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_CALLBACK_URL,
    SERVER_SESSION_SECRET,
    INTERNAL_TOKEN_SCOPES,
    PUBLIC_TOKEN_SCOPES,
    PORT,
    endpoints,
    credentials,
    WS_BASEURL
};