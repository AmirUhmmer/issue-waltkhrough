import {
  initViewer,
  loadModelAndIssues,
  loadModelsandCreateIssue,
  initiateCreateIssueV2,
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
      // viewerDiv.style.marginLeft = "280px";
      // viewerDiv.style.width = "65% !important";
      console.log(src);
      loadModelsandCreateIssue(viewer, containerId, src);
      //     const issueTypes = await getIssueSubTypesData(containerId);
      //    const selectIssueType = document.getElementById("selectIssueTypes");
      //      console.log("Issue Types", issueTypes);

      //     selectIssueType.innerHTML = "";
      //     issueTypes.forEach((issueType) => {
      //      const optgroup = document.createElement("optgroup");

      //     optgroup.label = issueType.title;
      //     issueType.subtypes.forEach((subtype) => {
      //       const opt = document.createElement("option");
      //       opt.value = subtype.id;
      //       opt.textContent = subtype.title;
      //       optgroup.appendChild(opt);
      //     });
      //     selectIssueType.appendChild(optgroup);
      //   });

      //   selectIssueType.value = "86fb9dd6-fce6-40b3-a49d-0e9437bd8111"; // default to Deviation
      //   $("#dateStart").datepicker("setDate", new Date());
      //   $("#dateDue").datepicker("setDate", new Date());
      //   $("#dateStart").datepicker({ dateFormat: "yy-mm-dd" });
      //   $("#dateDue").datepicker({ dateFormat: "yy-mm-dd" });

      //   const btnSave = document.getElementById("btn-save");
      //   const formIssueReporting = document.getElementById(
      //     "form-issue-reporting"
      //   );
      //   formIssueReporting.onsubmit = (event) => {
      //     event.preventDefault();
      //     const pushPin = document.getElementById("input-issue-pushpin");

      //     if (pushPin.value === "") {
      //       alert("Please Click on location of Issue");
      //       return;
      //     }
      //   };
      //
      //
    } else if (mode === "viewIssues") {
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
        // img.id = itemObject.id;
        // img.title = itemObject.attributes.displayName;
        // img.alt = itemObject.attributes.displayName;
        // img.src = `${window.location.origin}/api/thumbnail/${version.relationships.thumbnails.data.id}?height=50&width=50`;

        // img.onload = () => {
        //   divSpinner.classList.add("d-none");
        //   img.classList.remove("d-none");
        // };
        // itemDiv.onclick = async () => {
        //   //  alert(version.id);
        //   await loadModelAndIssues(viewer, itemObject.latestVersion, containerId);
        // }
        imageDiv.appendChild(itemDiv);
      });

      // console.log(userGuid);
      if (userGuid) {


        const create_socket = () => {
          //const socket = new WebSocket(`ws://localhost:8080/ws/${userGuid}`);
          // `wss://staging-issue-reporting-bxcubjc8gfemgkay.northeurope-01.azurewebsites.net/ws/${userGuid}` <--staging
          // `wss://autodesk-issues-reporting.azurewebsites.net/ws/${userGuid}`
          const socket = new WebSocket(
           `wss://autodesk-issues-reporting.azurewebsites.net/ws/${userGuid}`
          );

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
    // alert("finished");

    //#region for prod
    // await fetch("/api/auth/3lo");
    // divLoading.classList.remove("d-none");
    // window.location.reload();
    //#endregion

    const url = await fetch("/api/auth/sso");
    const url_json = await url.json();
    // window.location.href = url_json;
    // window.location.reload();
    const loginWindow = window.open(url_json, "Login", "width=600,height=600");
    //   window.location.reload();
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
    }); //#region  for_localhost
    // login.style.visibility = "visible";
    // login.innerText = "Login";
    // divLoading.classList.add("d-none");

    // login.onclick = () => {
    //   const loginWindow = window.open(
    //     "/api/auth/login",
    //     "Login",
    //     "width=600,height=600"
    //   );
    //   window.addEventListener("message", async (event) => {
    //     if (event.origin !== window.location.origin) {
    //       return; // Ignore messages from other origins
    //     }

    //     const { token, refreshToken, expires_at, internal_token } = event.data;
    //     if (token) {
    //       localStorage.setItem("authToken", token);
    //       localStorage.setItem("refreshToken", refreshToken);
    //       localStorage.setItem("expires_at", expires_at);
    //       localStorage.setItem("internal_token", internal_token);
    //       // const resp = await fetch("/api/auth/profile");
    //       window.location.reload(); // Reload the page to load viewer with token

    //       console.log(token);
    //     }
    //   });
    // };
    //   #endregion
  }
} catch (err) {
  alert("error displaying application");
  console.log(err);
}

export async function loadIssues(containerId, filter = {}) {
  const allIssue = await getAllIssues(containerId, filter);
}

export { viewer };
