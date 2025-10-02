import {
  initViewer,
  loadModelAndIssues,
  loadModelsandCreateIssue,
  initiateCreateIssueV2,
  loadIssuePushpinsFiltered
} from "../../viewer.js";

import { getOneProject } from "../../sidebar.js";
import {
  getAllIssues,
  getIssueSubTypesData,
  initIssueDefs,
} from "../../issues.js";
import { getMetadata } from "../../modelderivative.js";

let viewer = null;

try {
  var src = null;
  var srcWin = null;
  var srcOrigin = null;
  var create_issue_received = false;
  const params = new URLSearchParams(window.location.search);
  const containerId = params.get("containerId");
  const mode = params.get("mode");
  const userGuid = params.get("userGuid");
  const deviceType = params.get("deviceType");

  const login = document.getElementById("login");
  const divMain = document.getElementById("div-main");
  const divLoading = document.getElementById("div-loading");
  const divMainSidebar = document.getElementById("div-main-sidebar");
  const divHeader = document.getElementById("header");
  const issueReportingForm = document.getElementById("form-issue-report");
  const viewerDiv = document.querySelector(".adsk-viewing-viewer");
  const preview = document.getElementById("preview");
  window.addEventListener("message", async function (event) {
    console.log("Message received from parent:", event.data);
    srcWin = event.source;
    srcOrigin = event.origin;
    src = {
      srcWin,
      srcOrigin,
    };
    if (event.data.mode) {
      const newIssueData = await createIssue_v2(
        event.data.payload,
        selectedProject
      );

      srcWin.postMessage(newIssueData, srcOrigin);
    }
    if (event.origin === "https://semydev.crm4.dynamics.com") {
      // Replace with the parent domain
      // Optionally, send a response back
      // event.source.postMessage(
      //   JSON.parse(issuePushpin.value),
      //   event.origin
      // );
    }
  });

  console.log("Start");
  // const token = await  fetch(`/api/sqlite/token/${email}`);
  // const tok = await token.json();
  // console.log(tok)

  const resp = await fetch(`/api/auth/profile`, {
    method: "GET",
    credentials: "include",
  });

  if (resp.ok) {
    const profile = await resp.json();
    //console.log(profile);
    // console.log('USER', profile);
    console.log("USER PROFILE", profile.userid);

    viewer = await initViewer(document.getElementById("preview"));
    // await initIssueDefs(`b.${containerId}`, containerId);

    // if (window.parent.Xrm) {
    //   console.log("XRM is here");
    // }
    //const origin = window.location.ancestorOrigins[0];
    //localStorage.setItem("sample_data", "sample_data from iframe");
    // window.parent.postMessage("ellow", origin);

    //issueReportingForm.classList.toggle("open");
    //divMain.classList.remove("d-none");
    divLoading.classList.add("d-none");

    login.style.display = "none";
    login.style.visibility = "hidden";
    console.log("Viewer Without Model", viewer);
    divHeader.classList.remove("d-none");
    // console.log('Issue Types', issueTypes);
    if (deviceType) {
      if (deviceType == "mobile") {
        divMainSidebar.classList.add("d-none");

      }
      else {
        divMainSidebar.classList.remove("d-none");

      }
    }

    if (mode === "createIssue") {
      divMainSidebar.classList.add("d-none");
      divHeader.classList.add("d-none");
      const issuePushpin = document.getElementById("input-issue-pushpin");
      console.log(src);
      loadModelsandCreateIssue(viewer, containerId, src);

      // #region: view issue
    } else if (mode === "viewIssues") {
      console.log("view issues");


      await loadModelAndIssues(viewer, {}, containerId);

      const projectItems = await getOneProject(containerId);
      // console.log(projectItems);

      document.querySelectorAll(".sidebar .icon").forEach((icon) => {
        icon.addEventListener("click", () => {
          const targetId = icon.getAttribute("data-target");
          const subSidebar = document.getElementById(targetId);

          const viewerDiv = document.querySelector(".adsk-viewing-viewer");
          // Remove active class from all icons
          document.querySelectorAll(".sidebar .icon").forEach((item) => {
            item.classList.remove("active");
          });
          // Add active class to the clicked icon
          icon.classList.add("active");
          // Hide all sub-sidebars except the target
          document.querySelectorAll(".sub-sidebar").forEach((sidebar) => {
            if (sidebar.id !== targetId) {
              sidebar.classList.remove("open");
            }
          });
          subSidebar.classList.toggle("open");
          if (subSidebar.classList.contains("open")) {
            preview.classList.add("sub-sidebar-open");
            preview.classList.add("shrink");

            viewer.resize();
          } else {
            preview.classList.remove("sub-sidebar-open");
            preview.classList.remove("shrink");
            viewer.resize();
          }
          // Toggle the target sub-sidebar
        });
      });

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

        //      console.log(itemObject)

        //console.log(version);
        divSpinner.classList.remove("d-none");
        divSpinner.classList.add("d-none");
        img.classList.add("d-none");
        imageDiv.appendChild(itemDiv);
      });

      // console.log(userGuid);
      // ! socket listener
      // #region socket listener
      if (userGuid) {


        const create_socket = () => {
          //const socket = new WebSocket(`ws://localhost:8080/ws/${userGuid}`);
          // `wss://staging-issue-reporting-bxcubjc8gfemgkay.northeurope-01.azurewebsites.net/ws/${userGuid}` <--staging
          // `wss://autodesk-issues-reporting.azurewebsites.net/ws/${userGuid}`
          const socket = new WebSocket(
           `wss://autodesk-issues-reporting.azurewebsites.net/ws/${userGuid}`
          );
          // ! create issue from socket
          // #region: create issue from socket
          socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "create_issue") {
              viewer.resize();
              initiateCreateIssueV2(viewer, message, userGuid);

            }
            else if (message.type === "select_one") {
              viewer.resize();
              const issue_id = message.issueId;
              await viewer.loadExtension(
                "Autodesk.BIM360.Extension.PushPin"
              ).then((ext) => {
                ext.selectOne(issue_id);
              });
            }
            else if (message.type === "filter_issue") {
              const issueStatus = message.issueStatus;
              const issueSubtype = message.issueSubtype;
              loadIssuePushpinsFiltered(issueStatus, issueSubtype);
            }
            else {
              console.log(message);
            }
          };
        }
        create_socket();
        setInterval(() => {
          create_socket();
        }
          , 180000);

      }
    }
  } else {

    //#region for prod

    const url = await fetch("/api/auth/sso");
    if (!url.ok) {
      console.log("Failed to get access token");
    }
    const url_json = await url.json();
    console.log(url_json);
    const loginWindow = window.open(url_json, "Login", "width=600,height=600");
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) {
        return; // Ignore messages from other origins
      }

      const { token, refreshToken, expires_at, internal_token } = event.data;
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("expires_at", expires_at);
        localStorage.setItem("internal_token", internal_token);
        // const resp = await fetch("/api/auth/profile");
        window.location.reload(); // Reload the page to load viewer with token

        console.log(token);
      }
    });
  }
} catch (err) {
  alert("error displaying application");
  console.log(err);
}

export async function loadIssues(containerId, filter = {}) {
  const allIssue = await getAllIssues(containerId, filter);
}

export { viewer };
