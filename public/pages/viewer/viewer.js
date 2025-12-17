import {
  initViewer,
  loadModelAndIssues,
  loadModelsandCreateIssue,
  initiateCreateIssueV2,
  loadIssuePushpinsFiltered,
  navigateHAFL
} from "../../viewer.js";
import { getOneProject } from "../../sidebar.js";
import {
  getAllIssues,
  getIssueSubTypesData,
  initIssueDefs,
} from "../../issues.js";
import { getMetadata } from "../../modelderivative.js";

let viewer = null;

const params = new URLSearchParams(window.location.search);
const containerId = params.get("containerId");
const mode = params.get("mode");
const userGuid = params.get("userGuid");
const deviceType = params.get("deviceType");
const hardAsset = params.get("hardAsset");
const functionalLocation = params.get("floc");

const login = document.getElementById("login");
const divMain = document.getElementById("div-main");
const divLoading = document.getElementById("div-loading");
const divMainSidebar = document.getElementById("div-main-sidebar");
const divHeader = document.getElementById("header");
const issueReportingForm = document.getElementById("form-issue-report");
const viewerDiv = document.querySelector(".adsk-viewing-viewer");
const preview = document.getElementById("preview");

function setupSidebarListeners(viewer) {
  document.querySelectorAll(".sidebar .icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const subSidebar = document.getElementById(targetId);

      document.querySelectorAll(".sidebar .icon").forEach((item) => {
        item.classList.remove("active");
      });
      icon.classList.add("active");

      document.querySelectorAll(".sub-sidebar").forEach((sidebar) => {
        if (sidebar.id !== targetId) {
          sidebar.classList.remove("open");
        }
      });
      subSidebar.classList.toggle("open");
      if (subSidebar.classList.contains("open")) {
        preview.classList.add("sub-sidebar-open");
        preview.classList.add("shrink");
      } else {
        preview.classList.remove("sub-sidebar-open");
        preview.classList.remove("shrink");
      }
      viewer.resize();
    });
  });
}

async function renderProjectItems(containerId) {
  const projectItems = await getOneProject(containerId);
  const imageDiv = document.getElementById("models-sidebar-items");
  imageDiv.innerHTML = "";
  projectItems.forEach(async (item) => {
    const itemObject = await item;
    const version = itemObject.latestVersion;
    const itemDiv = document.createElement("div");
    const imgContainer = document.createElement("div");
    const divSpinner = document.createElement("div");
    const img = document.createElement("img");
    const divLabel = document.createElement("div");
    const itmContainer = document.createElement("div");

    imgContainer.className = "image-container";
    divSpinner.className = "spinner-border";
    divSpinner.role = "status";
    divLabel.className = "thumbnail-label";
    divLabel.innerText = version.attributes.displayName;
    itmContainer.className = "item-container";
    itmContainer.appendChild(imgContainer);
    itmContainer.appendChild(divLabel);

    itemDiv.className = "sub-icon";
    imgContainer.appendChild(divSpinner);
    imgContainer.appendChild(img);
    itemDiv.appendChild(itmContainer);

    divSpinner.classList.add("d-none");
    img.classList.add("d-none");
    imageDiv.appendChild(itemDiv);
  });
}

function setupSocket(userGuid, viewer) {
  const create_socket = () => {
    const socket = new WebSocket(
      // `wss://staging-issue-reporting-bxcubjc8gfemgkay.northeurope-01.azurewebsites.net/ws/${userGuid}` // <--staging
     //`wss://autodesk-issues-reporting.azurewebsites.net/ws/${userGuid}`
      `ws://localhost:8080/ws/${userGuid}` // <-- localhost
    );
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "create_issue") {
        viewer.resize();
        initiateCreateIssueV2(viewer, message, userGuid);
      } else if (message.type === "select_one") {
        viewer.resize();
        const issue_id = message.issueId;
        await viewer.loadExtension(
          "Autodesk.BIM360.Extension.PushPin"
        ).then((ext) => {
          ext.selectOne(issue_id);
        });
      } else if (message.type === "filter_issue") {
        const issueStatus = message.issueStatus;
        const issueSubtype = message.issueSubtype;
        loadIssuePushpinsFiltered(issueStatus, issueSubtype);
      } else {
        console.log(message);
      }
    };
  };
  create_socket();
  setInterval(create_socket, 180000);
}

function handleMessageEvents() {
  window.addEventListener("message", async function (event) {
    console.log("Message received from parent:", event.data);
    const srcWin = event.source;
    const srcOrigin = event.origin;
    const src = { srcWin, srcOrigin };
    if (event.data.mode) {
      const newIssueData = await createIssue_v2(
        event.data.payload,
        selectedProject
      );
      srcWin.postMessage(newIssueData, srcOrigin);
    }
  });
}

async function handleLogin() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("internal_token");
  
  const url = await fetch("/api/auth/sso");
  if (!url.ok) {
    console.log("Failed to get access token");
    return;
  }
  const url_json = await url.json();
  console.log(url_json);
  const loginWindow = window.open(url_json, "Login", "width=600,height=600");
  window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    const { token, refreshToken, expires_at, internal_token } = event.data;
    if (token) {
      localStorage.setItem("authTokenHemyIssue", token);
      localStorage.setItem("refreshTokenHemyIssue", refreshToken);
      localStorage.setItem("expires_atHemyIssue", expires_at);
      localStorage.setItem("internal_tokenHemyIssue", internal_token);
      // Instead of reloading, try to fetch the profile again
      await main();
    }
  });
}

async function main() {
  try {
    handleMessageEvents();
    const expiresAt = localStorage.getItem("expires_atHemyIssue");
    console.log("Expires:", expiresAt);
    if(!expiresAt || Date.now() > parseInt(expiresAt)) {
      localStorage.removeItem("authTokenHemyIssue");
      localStorage.removeItem("refreshTokenHemyIssue");
      localStorage.removeItem("expires_atHemyIssue");
      localStorage.removeItem("internal_tokenHemyIssue");
      console.log("Token expired or not found, redirecting to login.");
      await handleLogin();
      return;
    }
    const resp = await fetch(`/api/auth/profile`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authTokenHemyIssue")}`,
        "x-refresh-token": localStorage.getItem("refreshTokenHemyIssue"), // Send refreshToken in a custom header
        "x-expires-at": localStorage.getItem("expires_atHemyIssue"), // Send expires_at in a custom header
        "x-internal-token": localStorage.getItem("internal_tokenHemyIssue"), // Send internal_token in a custom header
      },
    });

    if (!resp.ok) {
      await handleLogin();
      return;
    }

    const profile = await resp.json();
    // console.log("USER PROFILE", profile.userid);
    console.log("USER token", localStorage.getItem("authTokenHemyIssue"));

    viewer = await initViewer(document.getElementById("preview"));
    divLoading.classList.add("d-none");
    login.style.display = "none";
    login.style.visibility = "hidden";
    divHeader.classList.remove("d-none");

    if (deviceType) {
      if (deviceType == "mobile") {
        divMainSidebar.classList.add("d-none");
      } else {
        divMainSidebar.classList.remove("d-none");
      }
    }

    if (mode === "createIssue") {
      divMainSidebar.classList.add("d-none");
      divHeader.classList.add("d-none");
      loadModelsandCreateIssue(viewer, containerId, { srcWin: window, srcOrigin: window.origin });
    } else if (mode === "viewIssues") {
      await loadModelAndIssues(viewer, {}, containerId);
      await renderProjectItems(containerId);
      setupSidebarListeners(viewer);
      if (userGuid) {
        setupSocket(userGuid, viewer);
      }
    }

  } catch (err) {
    alert("error displaying application");
    console.log(err);
  }
}

main();

export async function loadIssues(containerId, filter = {}) {
  const allIssue = await getAllIssues(containerId, filter);
}

export { viewer };