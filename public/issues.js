import {
  loadModel,
  setPushpinData,
  createPushPins,
  pushpin_SelectOne,
} from "./viewer.js";
var currentContainerId = null;
async function getIssueSubTypes(containerId) {
  const token = localStorage.getItem("authTokenHemyIssue");
  const refreshToken = localStorage.getItem("refreshTokenHemyIssue");
  const expires_at = localStorage.getItem("expires_atHemyIssue");
  const internal_token = localStorage.getItem("internal_tokenHemyIssue");

  const res = await fetch(`/api/issueSubTypes/${containerId}`,
    {
      headers: {
            'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
            'x-refresh-token': refreshToken,         // Send refreshToken in a custom header
            'x-expires-at': expires_at,              // Send expires_at in a custom header
            'x-internal-token': internal_token       // Send internal_token in a custom header
        }
    });
  const issueSubTypes = await res.json();
  return issueSubTypes.map((t) =>
    $("#dropdownIssueTypes").append($("<option>").val(t.id).text(t.title))
  );
}

export async function getIssueSubTypesData(containerId) {
  const token = localStorage.getItem("authTokenHemyIssue");
  const refreshToken = localStorage.getItem("refreshTokenHemyIssue");
  const expires_at = localStorage.getItem("expires_atHemyIssue");
  const internal_token = localStorage.getItem("internal_tokenHemyIssue");

  const res = await fetch(`/api/issueTypes/${containerId}`, {
      headers: {
            'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
            'x-refresh-token': refreshToken,         // Send refreshToken in a custom header
            'x-expires-at': expires_at,              // Send expires_at in a custom header
            'x-internal-token': internal_token       // Send internal_token in a custom header
        }
    });
  const issueTypes = await res.json();
  return issueTypes;
  //    return issueSubTypes.map(t => $('#dropdownIssueTypes').append($('<option>').val(t.id).text(t.title)));
}

export async function getAllIssues(projectId, filter) {
  const token = localStorage.getItem('authTokenHemyIssue');
  const refreshToken = localStorage.getItem('refreshTokenHemyIssue');
  const expires_at = localStorage.getItem('expires_atHemyIssue');
  const internal_token = localStorage.getItem('internal_tokenHemyIssue');

  const params = new URLSearchParams(filter);
  const res = await fetch(
    `${window.location.origin}/api/allIssues/${projectId}?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
            'x-refresh-token': token,         // Send refreshToken in a custom header
            'x-expires-at': expires_at,              // Send expires_at in a custom header
            'x-internal-token': token       // Send internal_token in a custom header
        }
    });
  //  console.log(res.json());
  return await res.json();
}

export async function getIssuesFiltered(projectId, filter) {
  const token = localStorage.getItem('authTokenHemyIssue');
  const refreshToken = localStorage.getItem('refreshTokenHemyIssue');
  const expires_at = localStorage.getItem('expires_atHemyIssue');
  const internal_token = localStorage.getItem('internal_tokenHemyIssue');

  const params = new URLSearchParams(filter);
  const res = await fetch(
    `${window.location.origin}/api/allIssues/${projectId}?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
            'x-refresh-token': refreshToken,         // Send refreshToken in a custom header
            'x-expires-at': expires_at,              // Send expires_at in a custom header
            'x-internal-token': internal_token       // Send internal_token in a custom header
        }
    });
  //  console.log(res.json());
  return await res.json();
}

// export async function initIssueDefs(projectId, containerId) {
//   const res = await fetch(`/api/issueDataMap/${projectId}/${containerId}`);
//   await getIssueSubTypes(containerId);
//   const issueTypes = await getIssueSubTypesData(containerId);
//   $("#issue-type").empty();
//   $.each(issueTypes, (index, issueType) => {
//     const optgroup = $("<optgroup>");
//     optgroup.attr("label", issueType.title);
//     $.each(issueType.subtypes, (index, subtype) => {
//       const option = $("<option></option>");
//       option.text(subtype.title);
//       option.val(`types|${issueType.id}|${subtype.id}`);

//       optgroup.append(option);
//     });
//     $("#issue-type").append(optgroup);
//   });
//   //  console.log({issueTypes});
// }

export async function initIssueDefs(projectId, containerId) {
  const res = await fetch(`/api/issueDataMap/${projectId}/${containerId}`);
  return res;
  //  console.log({issueTypes});
}

export async function createIssue(payload) {
  const res = await fetch(`/api/createIssue/${currentContainerId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: payload }),
  });
  return res;
}

export async function createIssue_v2(payload, contId) {
  const res = await fetch(`/api/createIssue/${contId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: payload }),
  });
  return await res.json();
}

export async function createComment(containerId, issueId, comment) {
  const res = await fetch(`/api/createComment/${containerId}/${issueId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment: comment }),
  });

  // $("#issueTree").jstree(true).refresh();
}

export async function createAttachment(containerId, issueId, formData) {
  const res = await fetch(`/api/createAttachment/${containerId}/${issueId}`, {
    method: "POST",
    body: formData,
  });
}

export function prepareBIMIssuesTree(containerId) {
  currentContainerId = containerId;
  var thisIssueTree = $("#issueTree").jstree(true);
  if (thisIssueTree) {
    thisIssueTree.destroy();
  }

  $("#issueTree")
    .jstree({
      core: {
        themes: { icons: true },
        data: {
          url: `/api/${containerId}/issuesTree`,
          dataType: "json",
          multiple: false,
          cache: false,
          data: function (node) {
            $("#issueTree").jstree(true).toggle_node(node);
            if (node.id == "#") {
              var date_input = new Date($("#issueDueDate").val());
              var date_input_to = new Date($("#issueDueDateTo").val());

              var one_day_late = date_input;
              var due_date =
                date_input.getFullYear() +
                "-" +
                ("0" + (date_input.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + date_input.getDate()).slice(-2);
              var due_date_to =
                date_input_to.getFullYear() +
                "-" +
                ("0" + (date_input_to.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + date_input_to.getDate()).slice(-2);

              one_day_late.setDate(date_input.getDate() + 1);
              one_day_late =
                one_day_late.getFullYear() +
                "-" +
                ("0" + (one_day_late.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + one_day_late.getDate()).slice(-2);
              return {
                id: node.id,
                containerId: containerId,
                filter: { dueDate: `${due_date}...${due_date_to}` },
              };
            } else return { id: node.id, type: node.type, data: node.data };
          },
          success: function (node) {
            //  console.log('NODE', node);
          },
        },
      },
      types: {
        default: {
          icon: "fal fa-border-none",
        },
        "#": {
          icon: "fal fa-border-none",
        },
        issues: {
          icon: "fas fa-exclamation-triangle",
        },
        attachmentscoll: {
          icon: "fas fa-paperclip",
        },
        attributescoll: {
          icon: "",
        },
        commentscoll: {
          icon: "fas fa-layer-group",
        },
        comments: {
          icon: "far fa-comments",
        },
        attachments: {
          icon: "far fa-images",
        },
        attributes: {
          icon: "",
        },
        attributesData: {
          icon: "",
        },
        commentsdata: {
          icon: "",
        },
        pushpin: {
          icon: "far fa-file",
        },
        pushpindata: {
          icon: "",
        },
      },
      plugins: ["types", "state", "sort"],
    })
    .bind("activate_node.jstree", function (evt, data) {
      if (data != null && data.node != null) {
        const issue = data.node.data;

        switch (data.node.type) {
          case "issues":
            console.log({ issue });
            pushpin_SelectOne(issue.issueId);
            break;
          case "pushpin":
            const linkedDocument = data.node.data.linkedDocument;
            const viewable = linkedDocument.details.viewable;
            const is3D = viewable.is3D;
            const guid = viewable.guid;
            const viewerState = linkedDocument.details.viewerState;
            const seedUrn = is3D ? viewerState.seedURN : "";
            const position = linkedDocument.details.position;
            const objectId = linkedDocument.details.objectId;

            //  console.log({issue});
            // var pushPinHandle = await viewer.loadExtension('Autodesk.BIM360.Extension.PushPin');

            // pushPinHandle.createItem({
            //     id: issue.id, // The issue ID.
            //     label: issueAttributes.identifier, // The value displayed when you select the pushpin.
            //     // The shape and color of the pushpin, in the following format: ``type-status`` (e.g., ``issues-open``).
            //     status: issue.type && issueAttributes.status.indexOf(issue.type) === -1 ?
            //               `${issue.type}-${issueAttributes.status}` : issueAttributes.status,
            //     position: pushpinAttributes.location, // The x, y, z coordinates of the pushpin.
            //     type: issue.type, // The issue type.
            //     objectId: pushpinAttributes.object_id, // (Only for 3D models) The object the pushpin is situated on.
            //     viewerState: pushpinAttributes.viewer_state // The current viewer state. For example, angle, camera, zoom.
            //   });
            // setPushpinData({
            //     position: position,
            //     objectId: objectId,
            //     id: data.node.data.id,
            //     title: data.node.data.title,
            //     status: data.node.data.status,
            //     viewerState: viewerState
            // })

            //     loadModel(seedUrn, guid);

            break;
          case "attachments":
            window.location =
              "/api/downloadAttachment?urn=" +
              data.node.data.attachmentUrn +
              "&name=" +
              data.node.text;
            break;
        }
      }
    });
}

export async function populateIssueList(parent, issues) {
  let issueList = [];
  $(parent).empty();
  $.each(issues, (index, issue) => {
    const issue_a = $(`<a>`);
    issue_a.attr("href", "#");
    issue_a.attr("id", `issue-${issue.id}`);
    issue_a.attr("class", "list-group-item list-group-item-action");

    const statusColor = {
      open: "bg-warning",
      closed: "bg-secondary",
      draft: "bg-dark",
      pending: "bg-primary",
      in_review: "bg-info",
    };
    const issue_div = `<div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${issue.title}</h5>
                         </div>
                          <p class="mb-1"><span class="badge ${
                            statusColor[issue.status]
                          }">${issue.status}</span></p>
                          <small>Issue #${issue.displayId}</small>
                          `;

    issue_a.append(issue_div);
    issueList.push(issue_a);
  });

  $(parent).append(issueList);

  $.each(issues, (index, issue) => {
    $(`#issue-${issue.id}`).on("click", function () {
      $("#issue-list .list-group-item").removeClass("active");
      $(this).addClass("active");
      const pushpinData =
        issue.linkedDocuments.length > 0 ? issue.linkedDocuments[0] : null;
      if (pushpinData) {
        const pushpin = {
          type: "issues",
          id: issue.id,
          label: issue.title,
          status: issue.status,
          position: pushpinData.position,
          objectId: pushpinData.objectId,
          viewerState: pushpinData.viewerState,
        };
        pushpin_SelectOne(issue.id, pushpin);
      }
    });
  });
}
