// import {
//   initViewer,
//   loadModel,
//   loadModelsandCreateIssue,
//   setPushpinData,
//   loadModelsandLoadOneIssue,
// } from "../../viewer.js";

// try {
//   var srcWin = null;
//   var srcOrigin = "";
//   var src = null;
//   const login = document.getElementById("login");
//   const params = new URLSearchParams(window.location.search);
//   const containerId = params.get("containerId");
//   const issueId = params.get("issueId");
//   const mode = params.get("mode");

//   window.addEventListener("message", async (event) => {
//     if (!src) {
//       srcWin = event.source;
//       srcOrigin = event.origin;

//       src = {
//         srcWin,
//         srcOrigin,
//       };
//     }

//     console.log("Message received from parent:", event.data);

//     if (event.data.mode) {
//       const updatedIssueData = await fetch(
//         `/api/issue/${containerId}/${issueId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ payload: event.data.payload }),
//         }
//       );

//       srcWin.postMessage(updatedIssueData, srcOrigin);
//     }
//   });

//   const resp = await fetch("/api/auth/profile", {
//     method: "GET",
//     credentials: "include",
//   });

//   const divLoading = document.getElementById("div-loading");
//   if (resp.ok) {
//     divLoading.style.display = "none";
//     const viewer = await initViewer(document.getElementById("preview"));

//     // console.log(issue_details);
//     if (issueId && containerId) {
//       const issue = await fetch(`/api/issue/${containerId}/${issueId}`);
//       const issue_details = await issue.json();
//       console.log(issue_details);
//       if (issue_details.linkedDocuments.length > 0) {
//         await loadModelsandLoadOneIssue(
//           viewer,
//           containerId,
//           issue_details,
//           src
//         );
//       } else {
//         console.log("Source Window", src);
//         loadModelsandCreateIssue(viewer, containerId, src);
//       }
//     }
//     // console.log(issue_details);
//   } else {
//     divLoading.classList.remove("d-none");
//     const url = await fetch("/api/auth/sso");
//     const url_json = await url.json();

//     const loginWindow = window.open(
//       url_json,
//       "Login",
//       "width=600,height=600"
//     );
//     window.addEventListener("message", async (event) => {
//       if (event.origin !== window.location.origin) {
//         return; // Ignore messages from other origins
//       }

//       const { token, refreshToken, expires_at, internal_token } = event.data;
//       if (token) {
//         localStorage.setItem("authToken", token);
//         localStorage.setItem("refreshToken", refreshToken);
//         localStorage.setItem("expires_at", expires_at);
//         localStorage.setItem("internal_token", internal_token);
//         // const resp = await fetch("/api/auth/profile");
//         window.location.reload(); // Reload the page to load viewer with token

//         console.log(token);
//       }
//     });

//     //  login.style.visibility = "visible";
//     //  login.innerText = "Login";
//     //  divLoading.classList.add("d-none");
//      login.onclick = () => {
//      };
//   }
// } catch (err) {
//   alert("error displaying application");
//   console.log(err);
// }
import {
  initViewer,
  loadModelsandCreateIssue,
  loadModelsandLoadOneIssue,
} from "../../viewer.js";

async function main() {
  const divLoading = document.getElementById("div-loading");
  const login = document.getElementById("login");
  const params = new URLSearchParams(window.location.search);
  const containerId = params.get("containerId");
  const issueId = params.get("issueId");

  let src = null;

  // --- Listen to parent window messages ---
  window.addEventListener("message", async (event) => {
    if (!src) src = { srcWin: event.source, srcOrigin: event.origin };
    console.log("Message received:", event.data);

    if (event.data.mode) {
      const response = await fetch(`/api/issue/${containerId}/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: event.data.payload }),
      });
      src.srcWin.postMessage(await response.json(), src.srcOrigin);
    }
  });

  // --- Handle expired or missing tokens ---
  const expiresAt = localStorage.getItem("expires_atHemyIssue");
  if (!expiresAt || Date.now() > parseInt(expiresAt)) {
    clearTokens();
    console.log("Token expired or missing, starting login...");
    await handleLogin((tokens) => afterLogin(tokens, containerId, issueId, src));
    return;
  }

  // --- Try to load profile with tokens ---
  const profileResp = await fetch("/api/auth/profile", {
    method: "GET",
    credentials: "include",
    headers: buildAuthHeaders(),
  });

  if (profileResp.ok) {
    await loadViewer(containerId, issueId, src);
  } else {
    clearTokens();
    await handleLogin((tokens) => afterLogin(tokens, containerId, issueId, src));
  }
}

// --- Load Viewer and Issue ---
async function loadViewer(containerId, issueId, src) {
  const divLoading = document.getElementById("div-loading");
  divLoading.style.display = "none";

  const viewer = await initViewer(document.getElementById("preview"));
  if (!issueId || !containerId) return;

  const issue = await fetch(`/api/issue/${containerId}/${issueId}`);
  const issueDetails = await issue.json();

  console.log("Issue:", issueDetails);

  if (issueDetails.linkedDocuments?.length > 0) {
    await loadModelsandLoadOneIssue(viewer, containerId, issueDetails, src);
  } else {
    await loadModelsandCreateIssue(viewer, containerId, src);
  }
}

// --- Handle Login (SSO popup) ---
async function handleLogin(onSuccess) {
  const divLoading = document.getElementById("div-loading");
  divLoading.classList.remove("d-none");

  const urlResp = await fetch("/api/auth/sso");
  const ssoUrl = await urlResp.json();

  const loginWindow = window.open(ssoUrl, "Login", "width=600,height=600");

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    const { token, refreshToken, expires_at, internal_token } = event.data;
    if (!token) return;

    const tokens = { token, refreshToken, expires_at, internal_token };
    saveTokens(tokens);
    loginWindow?.close();
    onSuccess(tokens);
  });
}

// --- After successful login (no reload) ---
async function afterLogin(tokens, containerId, issueId, src) {
  console.log("Login successful, loading viewer...");
  await loadViewer(containerId, issueId, src);
}

// --- Helper: build auth headers ---
function buildAuthHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem("authTokenHemyIssue")}`,
    "x-refresh-token": localStorage.getItem("refreshTokenHemyIssue"),
    "x-expires-at": localStorage.getItem("expires_atHemyIssue"),
    "x-internal-token": localStorage.getItem("internal_tokenHemyIssue"),
  };
}

// --- Helper: save tokens ---
function saveTokens({ token, refreshToken, expires_at, internal_token }) {
  localStorage.setItem("authTokenHemyIssue", token);
  localStorage.setItem("refreshTokenHemyIssue", refreshToken);
  localStorage.setItem("expires_atHemyIssue", expires_at);
  localStorage.setItem("internal_tokenHemyIssue", internal_token);
}

// --- Helper: clear tokens ---
function clearTokens() {
  [
    "authTokenHemyIssue",
    "refreshTokenHemyIssue",
    "expires_atHemyIssue",
    "internal_tokenHemyIssue",
  ].forEach((key) => localStorage.removeItem(key));
}

// --- Start ---
main().catch((err) => {
  console.error("Error displaying app:", err);
  alert("Error displaying application");
});
