// async function getJSON(url) {
//   const resp = await fetch(url);
//   if (!resp.ok) {
//     alert("Could not load tree data. See console for more details.");
//     console.error(await resp.text());
//     return [];
//   }
//   return resp.json();
// }

async function getJSON(url) {
    const token = localStorage.getItem('authTokenHemyIssue');
    const refreshToken = localStorage.getItem('refreshTokenHemyIssue');
    const expires_at = localStorage.getItem('expires_atHemyIssue');
    const internal_token = localStorage.getItem('internal_tokenHemyIssue');


    console.log("Request URL:", url);
    // console.log("Authorization Header:", `Bearer ${token}`);

    const resp = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,  // Send authToken in the Authorization header
            'x-refresh-token': refreshToken,         // Send refreshToken in a custom header
            'x-expires-at': expires_at,              // Send expires_at in a custom header
            'x-internal-token': internal_token       // Send internal_token in a custom header
        }
    });
    // if (!resp.ok) {
    //     fetchAccessToken();
    //     alert('Could not load tree data. See console for more details.');
    //     console.error(await resp.text());
    //     // return [];
    // }
    return resp.json();
}

function createTreeNode(id, text, icon, children = false) {
  return { id, text, children, itree: { icon } };
}

async function getHubs() {
  const hubs = await getJSON("/api/hubs");
  return hubs.map((hub) =>
    createTreeNode(`hub|${hub.id}`, hub.attributes.name, "icon-hub", true)
  );
}

async function getHubsList() {
  const hubs = await getJSON("/api/hubs");
  return hubs;
}

async function getProjects(hubId) {
  const projects = await getJSON(`/api/hubs/${hubId}/projects`);
  return projects.map((project) =>
    createTreeNode(
      `project|${hubId}|${project.id}|${project.relationships.issues.data.id}`,
      project.attributes.name,
      "icon-project",
      false
    )
  );
}

async function getProjectsList(hubId) {
  const projects = await getJSON(`/api/hubs/${hubId}/projects`);
  return projects;
}

export async function getProjectsDropdown(hubId) {
  const projects = await getJSON(`/api/hubs/${hubId}/projects`);
  return projects.map((project) =>
    $("#project-list").append(
      $("<option>")
        .val(
          `project|${hubId}|${project.id}|${project.relationships.issues.data.id}`
        )
        .text(project.attributes.name)
    )
  );
}

async function getContents(hubId, projectId, folderId = null) {
  const contents = await getJSON(
    `/api/hubs/${hubId}/projects/${projectId}/contents` +
    (folderId ? `?folder_id=${folderId}` : "")
  );
  return contents.map((item) => {
    if (item.type === "folders") {
      return createTreeNode(
        `folder|${hubId}|${projectId}|${item.id}`,
        item.attributes.displayName,
        "icon-my-folder",
        true
      );
    } else {
      return createTreeNode(
        `item|${hubId}|${projectId}|${item.id}`,
        item.attributes.displayName,
        "icon-item",
        true
      );
    }
  });
}

async function getFolderContents(hubId, projectId, folderId = null) {
  const contents = await getJSON(
    `/api/hubs/${hubId}/projects/${projectId}/contents` +
    (folderId ? `?folder_id=${folderId}` : "")
  );

  return contents;
}

async function getVersions(hubId, projectId, itemId) {
  const versions = await getJSON(
    `/api/hubs/${hubId}/projects/${projectId}/contents/${itemId}/versions`
  );
  return versions.map((version) =>
    createTreeNode(
      `version|${version.id}`,
      version.attributes.createTime,
      "icon-version"
    )
  );
}

export async function getItemVersions(hubId, projectId, itemId) { }

export async function getVersionsList(hubId, projectId, itemId) {
  const versions = await getJSON(
    `/api/hubs/${hubId}/projects/${projectId}/contents/${itemId}/versions`
  );
  return versions;
}

export function initTree(selector, onSelectionChanged) {
  // See http://inspire-tree.com
  const tree = new InspireTree({
    data: function (node) {
      if (!node || !node.id) {
        return getHubs();
      } else {
        const tokens = node.id.split("|");
        switch (tokens[0]) {
          case "hub":
            return getProjects(tokens[1]);
          //case 'project': return getContents(tokens[1], tokens[2]);
          //case 'folder': return getContents(tokens[1], tokens[2], tokens[3]);
          //case 'item': return getVersions(tokens[1], tokens[2], tokens[3]);
          default:
            return [];
        }
      }
    },
    selection: {
      allow: true,
    },
  });
  tree.on("node.click", function (event, node) {
    event.preventTreeDefault();
    const tokens = node.id.split("|");

    if (tokens[0] === "project") {
      onSelectionChanged(tokens[2], tokens[3]);
    }
  });
  return new InspireTreeDOM(tree, { target: selector });
}

// export async function initProjectDropdown(selector) {
//   const hubs = await getHubsList();

//   hubs.map(async (hub) => {
//     $(selector).append(`<optgroup label="${hub.attributes.name}">`);

//     const projects = await getProjectsList(hub.id);
//     projects.map(async (project) => {
//       const folders = await getFolderContents(hub.id, project.id);

//       $(selector).append(`<optgroup label="${project.attributes.name}">`);

//       const projectFilesFolder = folders[0];
//       const items = await getFolderContents(
//         hub.id,
//         project.id,
//         projectFilesFolder.id
//       );
//       const itemFilter = items.filter((item) => item.type === "items");
//       itemFilter.map((item) => {
//         $(selector)
//           .append(`<option value="project|${hub.id}|${project.id}|${project.relationships.issues.data.id}">
//                     &nbsp;&nbsp;&nbsp;${item.attributes.displayName}
//                   </option>`);
//       });

//       $(selector).append(`</optgroup>`);
//     });
//     $(selector).append(`</optgroup>`);
//   });
// }

export async function getThumbnails(urn) {
  //const seedUrn = window.btoa(urn).replace(/=/g, "");
  const thumbnail = await getJSON(`/api/thumbnail/${urn}`);

  return thumbnail;
}

export async function initProjectDropdown(selector) {
  const hubs = await getHubsList();
  const mainHub = hubs[0];

  const projects = await getProjectsList(mainHub.id);

  $.each(projects, async (index, project) => {
    //  console.log('PROJECT', project, value);
    var optgroup = $("<optgroup>");
    optgroup.attr("label", project.attributes.name);

    const folders = await getFolderContents(mainHub.id, project.id);
    const mainFolder = folders[0];
    const items = await getFolderContents(
      mainHub.id,
      project.id,
      mainFolder.id
    );
    const itemFilter = items.filter((item) => item.type === "items");
    await $.each(itemFilter, async (index, item) => {
      const versionList = await getVersionsList(
        mainHub.id,
        project.id,
        item.id
      );
      const latestVersion = versionList[0];

      var option = $("<option></option>");
      option.val(
        `project|${mainHub.id}|${project.id}|${project.relationships.issues.data.id
        }|${item.id}|${project.relationships.issues.data.id}|${latestVersion.id
        }|${JSON.stringify(latestVersion)}|${JSON.stringify(item)}`
      );
      option.text(item.attributes.displayName);
      optgroup.append(option);
      //  console.log({latestVersion});
      //  const thumbnail = await getThumbnails(latestVersion.relationships.thumbnails.data.id);

      // console.log({thumbnail });

    });

    $(selector).append(optgroup);
  });

  return projects;
}

export async function initial_project_list() {
  const hubs = await getHubsList();
  const mainHub = hubs[0];
  const projects = await getProjectsList(mainHub.id);

  $.each(projects, async (index, project) => {
    //  console.log('PROJECT', project, value);
    const accordionItem = $("<div>");
    accordionItem.attr('class', 'accordion-item')

    const folders = await getFolderContents(mainHub.id, project.id);

    const mainFolder = folders[0];
    const items = await getFolderContents(
      mainHub.id,
      project.id,
      mainFolder.id
    );
    const itemFilter = items.filter((item) => item.type === "items");
    $.each(itemFilter, async (index, item) => {
      const versionList = await getVersionsList(
        mainHub.id,
        project.id,
        item.id
      );
      const latestVersion = versionList[0];
      accordionItem.append();
      accordionItem.innerHTML = `<h2 class="accordion-header" id="heading${project.id}">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${project.id}" aria-expanded="true" aria-controls="collapseOne">
                                    ${project.attributes.name}
                                   </button>
                                  </h2>
     <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
     <div class="accordion-body">
            This is the content for the first item. You can include any HTML here.
     </div>
     </div>`

      //     const thumbnail = await getThumbnails(item.id);

      console.log({ project, thumbnail });
    });
  });

  return projects;
}

export async function getOneProject(projectId) {
  const hubs = await getHubsList();
  const mainHub = hubs[0];

  // const projects = await getProjectsList(mainHub.id);
  // console.log({ projects });
  // const oneProject = projects.filter((project) => project.relationships.issues.data.id === projectId);
  
  const project = await getJSON(`/api/projects/${mainHub.id}/b.${projectId}`);
  const modelSetViews = [
    {
      containerId: "90cb12d1-43a4-4360-884b-0625eab88572",
      modelSetId: "f16c5b88-5baf-44d2-827f-f91b5e525e3d",
      modelSetViewId: "8cd23fc0-17b0-4e27-899b-13ec3e1479a6",
      definition: [
        {
          lineageUrn: "urn:adsk.wipemea:dm.lineage:fdosriHoSSq4NPIIkiyvVw",
          viewableName: "SOL11-23-SEMY-ARST-ASBUILT",
        },
        {
          lineageUrn: "urn:adsk.wipemea:dm.lineage:1a6uXwpuRXykLPeEX-YFpg",
          viewableName: "SOL11-23-SEMY-P41-ASBUILT",
        },
      ],
    }
  ]

  //const views = modelSetViews.filter((modelSet) => modelSet.containerId === projectId);


  console.log(project);
  //const project = oneProject[0];
  
  const folders = await getFolderContents(mainHub.id, project.id);

  const mainFolder = folders[0];
  
  const items = await getFolderContents(
    mainHub.id,
    project.id,
    mainFolder.id
  );
  const itemFilter = items.filter(item => item.type === "items" &&  item.attributes.displayName.toLowerCase().endsWith(".rvt"));


  return itemFilter.map(async (item) => {
    const versions = await getVersionsList(mainHub.id, project.id, item.id);
    return Object.assign(item, {"latestVersion" : versions[0]})
  });

  //return await itemFilter;
}

export async function getOneItem(projectId, itemId) {
  const hubs = await getHubsList();
  const mainHub = hubs[0];

  // const projects = await getProjectsList(mainHub.id);
  // console.log({ projects });
  // const oneProject = projects.filter((project) => project.relationships.issues.data.id === projectId);
  
  const project = await getJSON(`/api/projects/${mainHub.id}/b.${projectId}`);


  //const views = modelSetViews.filter((modelSet) => modelSet.containerId === projectId);


  console.log(project);
  //const project = oneProject[0];
  
  const folders = await getFolderContents(mainHub.id, project.id);

  const mainFolder = folders[0];
  
  const items = await getFolderContents(
    mainHub.id,
    project.id,
    mainFolder.id
  );
  const itemFilter = items.filter(item => item.id === itemId);

  const versions = await getVersionsList(mainHub.id, project.id, itemFilter[0].id);

  return await versions[0];
}


export async function allProjects() {
  const hubs = await getHubsList();
  const mainHub = hubs[0];
  const projects = await getProjectsList(mainHub.id);
  return projects;
}
