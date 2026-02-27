export async function getAllProperties(urn, modelGuid, objectId = null) {
  const token = localStorage.getItem('authTokenHemyIssue');
  const refreshToken = localStorage.getItem('refreshTokenHemyIssue');
  const expires_at = localStorage.getItem('expires_atHemyIssue');
  const internal_token = localStorage.getItem('internal_tokenHemyIssue');

  const endpoint = `/api/modelderivative/properties/${urn}/${modelGuid}`;
  if (objectId) {
    endpoint = `${endpoint}?objectId=${objectId}`;
  }
  const resp = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
        'x-refresh-token': refreshToken,         // Send refreshToken in a custom header
        'x-expires-at': expires_at,              // Send expires_at in a custom header
        'x-internal-token': internal_token       // Send internal_token in a custom header
      }
  });

  return resp.json();
}

//Original Code
// export async function getMetadata(urn) {
//   const token = localStorage.getItem('authTokenHemyIssue');
//   const refreshToken = localStorage.getItem('refreshTokenHemyIssue');
//   const expires_at = localStorage.getItem('expires_atHemyIssue');
//   const internal_token = localStorage.getItem('internal_tokenHemyIssue');

//   const res = await fetch(`/api/modelderivative/metadata/${urn}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
//         'x-refresh-token': refreshToken,         // Send refreshToken in a custom header
//         'x-expires-at': expires_at,              // Send expires_at in a custom header
//         'x-internal-token': internal_token       // Send internal_token in a custom header
//       }
//   });
//   return res.json();
// }



export async function getMetadata(urn) {
  const token = localStorage.getItem('authTokenHemyIssue');
  const refreshToken = localStorage.getItem('refreshTokenHemyIssue');
  const expires_at = localStorage.getItem('expires_atHemyIssue');
  const internal_token = localStorage.getItem('internal_tokenHemyIssue');

  const res = await fetch(`/api/modelderivative/metadata/${urn}`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
        'x-refresh-token': token,         // Send refreshToken in a custom header
        'x-expires-at': expires_at,              // Send expires_at in a custom header
        'x-internal-token': token       // Send internal_token in a custom header
      }
  });
  return res.json();
}


