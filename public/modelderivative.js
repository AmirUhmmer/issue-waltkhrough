export async function getAllProperties(urn, modelGuid, objectId = null) {
  const endpoint = `/api/modelderivative/properties/${urn}/${modelGuid}`;
  if (objectId) {
    endpoint = `${endpoint}?objectId=${objectId}`;
  }
  const resp = await fetch(endpoint);

  return resp.json();
}

export async function getMetadata(urn) {
  const res = await fetch(`/api/modelderivative/metadata/${urn}`);
  return res.json();
}