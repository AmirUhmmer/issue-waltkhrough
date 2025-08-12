import {
  initViewer,
  loadModel,
  loadInitialModel,
  startCreatePushPin,
} from "./viewer.js";
import { initProjectDropdown, getVersionsList, initTree, initial_project_list } from "./sidebar.js";
import {
  initIssueDefs,
  prepareBIMIssuesTree,
  createIssue,
  createComment,
  createAttachment,
  getAllIssues,
  populateIssueList,
  getIssueSubTypesData,
} from "./issues.js";

const login = document.getElementById("login");
const div_container = document.getElementById("div-container");
const icon_sidebar = document.getElementById("iconSidebar");

try {
  const resp = await fetch("/api/auth/profile", {
    method: "GET",
    credentials: "include",
  });
  //const resp2 = await fetch("/api/auth/redirect-url");
  //console.log('RESPONSE2',await resp2.json());
  if (resp.ok) {
    const user = await resp.json();
    //login.innerText = `Logout (${user.name})`;
    login.style.visibility = "hidden";
    login.style.display = "none";

    login.onclick = () => window.location.replace("/api/auth/logout");
    const viewer = await initViewer(document.getElementById("preview"));

    // initTree('#projectTree', async (projectId, containerId) => {
    //     await initIssueDefs(projectId, containerId);
    //     await prepareBIMIssuesTree(containerId);
    // });

    const projectList = await initProjectDropdown("#project-list");
    //const thumbnails = await initial_project_list();

    console.log('Project List', projectList);
    // selectProject (value)
    $("#project-list").change(async function (e) {
      await selectProject(viewer, e.target.value);
      // alert(node);
    });
  } else {
    login.innerText = "Login";
    login.onclick = () => {
      const loginWindow = window.open('/api/auth/login', 'Login', 'width=600,height=600');
      
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) {
          return;  // Ignore messages from other origins
        }

        const { token, refreshToken, expires_at, internal_token } = event.data;
        if (token) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('expires_at', expires_at);
          localStorlage.setItem('internal_token', internal_token);
          // const resp = await fetch("/api/auth/profile");
          window.location.reload();  // Reload the page to load viewer with token

          console.log(token);
        }
      });
    }
    //window.location.replace("/api/auth/login");
    div_container.style.visibility = "hidden";
    icon_sidebar.style.visibility = "hidden";
  }
  login.style.visibility = "visible";

  //initialization
  init();
} catch (err) {
  alert("Could not initialize the application. See console for more details.");
  console.error(err);
}
export async function projectInfo(projectId)
{

  
}

async function selectProject(viewer, value) {
  const node = value;
  const tokens = node.split("|");

  console.log(tokens);
  console.log(JSON.parse(tokens[7]));
  console.log(JSON.parse(tokens[8]));

  const filter = {
    "filter[linkedDocumentUrn]": tokens[4],
  };
  const allIssues = await getAllIssues(tokens[5], filter);

  console.log({ allIssues })
  populateIssueList("#issue-list", allIssues);

  //await loadModel(seedUrn, guid);
  await loadInitialModel(viewer, JSON.parse(tokens[7]), tokens[5]);
  await initIssueDefs(tokens[2], tokens[3]);
  await prepareBIMIssuesTree(tokens[3]);
}

async function init() {
  //feather icon
  feather.replace();

  //due date box
  $("#notify-click").hide();
  const thisDate = new Date();

  $("#issue-duedate").datepicker("setDate", new Date());
  $("#issue-startdate").datepicker("setDate", new Date());

  $("#issueDueDate").datepicker(
    "setDate",
    new Date(thisDate.getUTCFullYear(), thisDate.getMonth(), 1)
  );

  $("#issueDueDateTo").datepicker("setDate", new Date());
  $("#issueDueDate").datepicker({ autoclose: true });

  $("#newIssueDueDate").datepicker("setDate", new Date());
  $("#newIssueDueDate").datepicker({ autoclose: true });

  $("#issueDueDate").change(function () {
    const thisIssueTree = $("#issueTree").jstree(true);
    if (thisIssueTree) thisIssueTree.refresh();
  });

  $("#issueDueDateTo").change(function () {
    const thisIssueTree = $("#issueTree").jstree(true);
    if (thisIssueTree) thisIssueTree.refresh();
  });

  $("#btn-create-issue").click(async function () {
    await startCreatePushPin();
  });

  $("#btn-modal-create-issue").click(async function (rvt) {
    const title = $("#issue-title").val();
    const description = $("#issue-description").val();

    const dateInput = new Date($("#issue-duedate").val());
    const dateStartInput = new Date($("#issue-startdate").val());

    const dueDate = `${dateInput.getUTCFullYear()}-${(
      "0" +
      (dateInput.getUTCMonth() + 1)
    ).slice(-2)}-${("0" + dateInput.getUTCDate()).slice(-2)}`;
    const startDate = `${dateStartInput.getUTCFullYear()}-${(
      "0" +
      (dateStartInput.getUTCMonth() + 1)
    ).slice(-2)}-${("0" + dateStartInput.getUTCDate()).slice(-2)}`;

    const status = $("#issue-status").find("option:selected").val();
    const issueType = $("#issue-type").find("option:selected").val();
    const issueTypeIds = issueType.split("|");

    const objectDataStr = $("#txt-pushpindata").val();
    const objectData = JSON.parse(objectDataStr);

    const project = $("#project-list").find("option:selected").val();
    const project_tokens = project.split("|");
    const item = JSON.parse(project_tokens[8]);
    const version = JSON.parse(project_tokens[7]);

    // const payload = {
    //   type: "issues",
    //   attributes: {
    //     title: title,
    //     dueDate: dueDate,
    //     status: issue.status.split("-")[1] || issue.status,
    //     target_urn: project_tokens[4],
    //     starting_version: project_tokens[6], // See step 1 for the version ID.
    //     // The issue type ID and issue subtype ID. See GET ng-issue-types for more details.
    //     ng_issue_type_id: issueTypeIds[1],
    //     ng_issue_subtype_id: issueTypeIds[2],
    //     // ``sheet_metadata`` is the sheet in the document associated with the pushpin.
    //     sheet_metadata: {
    //       // `viewerApp.selectedItem` references the current sheet
    //       is3D: viewerApp.selectedItem.is3D(),
    //       sheetGuid: viewerApp.selectedItem.guid(),
    //       sheetName: viewerApp.selectedItem.name(),
    //     },
    //     pushpin_attributes: {
    //       // Data about the pushpin
    //       type: "TwoDVectorPushpin", // This is the only type currently available
    //       object_id: issue.objectId, // (Only for 3D models) The object the pushpin is situated on.
    //       location: issue.position, // The x, y, z coordinates of the pushpin.
    //       viewer_state: issue.viewerState, // The current viewer state. For example, angle, camera, zoom.
    //     },
    //   },
    // };

    const payload = {
      description: description,
      title: title,
      issueSubtypeId: issueTypeIds[2],
      status: status,
      dueDate: dueDate,
      startDate: startDate,
      linkedDocuments: [
        {
          type: 'TwoDVectorPushpin',
          urn: project_tokens[4],
          createdAtVersion: version.attributes.versionNumber,
          details: {
            viewable: {
              name: version.attributes.name,
              is3D: true
            },
            position: objectData.position,
            objectId: objectData.objectId,
            viewerState: objectData.viewerState
          },
        }
      ]
    };

    await createIssue(payload);
    const filter = {
      "filter[linkedDocumentUrn]": project_tokens[4],
    };
    const allIssues = await getAllIssues(project_tokens[5], filter);

    await populateIssueList("#issue-list", allIssues)

    $("#frm-issues-modal").modal('hide');


  });

  $("#btnCreateComment").click(function (rvt) {
    const jsTreeInstance = $("#issueTree").jstree(true);
    const node = jsTreeInstance.get_selected(true)[0];

    if (node.type == "issues") {
      if ($("#newComment").val() && $("#newComment").val() != "") {
        createComment(
          node.data.containerId,
          node.data.issueId,
          $("#newComment").val()
        );
      } else {
        alert("please input comment body!");
      }
    } else {
      alert("please select one issue!");
    }
  });

  $("#btnCreateAttachment").click(function (rvt) {
    const jsTreeInstance = $("#issueTree").jstree(true);
    const node = jsTreeInstance.get_selected(true)[0];

    if (node.type == "issues") {
      const fileName = $("#selectedFile").val();
      if (fileName == undefined || fileName == "") {
        alert("please select a file!");
        return;
      }

      createAttachment(node.data.containerId, node.data.issueId, fileName);
    } else {
      alert("please select one issue!");
    }

    createAttachment();
  });

  $("#selectedFile").on("change", function (evt) {
    const jsTreeInstance = $("#issueTree").jstree(true);
    const node = jsTreeInstance.get_selected(true)[0];

    if (node.type == "issues") {
      const files = evt.target.files;
      if (files.length === 1) {
        const formData = new FormData();
        formData.append("png", files[0]);
        formData.append("name", files[0].name);
        createAttachment(node.data.containerId, node.data.issueId, formData);
      }
    }
    //selectLocalFile(evt);
  });
}
