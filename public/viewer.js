/// import * as Autodesk from "@types/forge-viewer";
//import { getIssues } from "../routes/services/issues";
import { createIssue_v2, getAllIssues } from "./issues.js";
import { getMetadata } from "./modelderivative.js";
import { getOneProject } from "./sidebar.js";
var viewer = null;
var pushpinData = null;
var selectedProject = null;
var selectedProjectItem = null;
var pushpinExt = null;
var pushpinIssueExt = null;
var viewerPushPinExt = null;
var issueFilter = null;
var modelCount = 0;
var loadedModelCounter = 0;
var g_projectItems = [];
var srcWin = null;
var srcOrigin = "";
var src = null;
var oneIssueDetails = null;

const params = new URLSearchParams(window.location.search);
const userGuid = params.get("userGuid");
const deviceType = params.get("deviceType");
const newGuid = params.get("newGuid");


const modelSetViews = [
  {
    containerId: "bd676732-fbaf-4f1e-bd70-35268dbb216c",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:4b04FjlWQ1a2OzXiLry9qQ",
        viewableName: "DB8-SEMY-ARST-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:xCLLbKXaTJugWRJKyXn3lA",
        viewableName: "DB8-SEMY-P41-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:s8kRPfTvTHSCSk3zORE9-w",
        viewableName: "DB8-SEMY-SITE-ASBUILT",
      },
    ],
  },

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
  },

  {
    containerId: "552de2d1-bc00-41a4-8d90-ec063d64a4c6",
    modelSetId: "15054182-e125-4c29-9ec2-b106cafaf660",
    modelSetViewId: "b86d148b-2001-4874-89d4-c8e2e1b8c645",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:UwhmTaE5RQ21--nmCQd2pA",
        viewableName: "HG62-SEMY-ARST-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:Oiuj-KZlQGWHcvIe4nDKKQ",
        viewableName: "HG62-SEMY-P41-ASBUILT",
      },
    ],
  },

  {
    containerId: "bf8f603c-7e37-4367-9900-69e279377191",
    modelSetId: "c5b540bc-cd60-4fc0-8773-e75e3aeaa806",
    modelSetViewId: "652ff58a-92db-4c0d-ba67-4f8739732c8c",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:sRfOlKPITMG3zSgBoeF3Ww",
        viewableName: "SMY-DB8-xxx-SIT-R24",
      },
      {
        // urn:adsk.wipemea:dm.lineage:xdXReqV0T1azoWueEiSnzg <-- Prod
        // urn:adsk.wipemea:dm.lineage:zSzRg1lhS9uzKEXQgvbrKA <-- test
        // urn:adsk.wipemea:dm.lineage:OBZybXF9T8KxRSZK3MbA5A <-- detach
        lineageUrn: "urn:adsk.wipemea:dm.lineage:xdXReqV0T1azoWueEiSnzg",
        viewableName: "DB8-SEMY-ARST-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:cuy9_KQiSyadqUu2aI_Bsg",
        viewableName: "DB8-SEMY-P41-ASBUILT",
      },
    ],
  },

  {
    containerId: "6623a4ce-ac71-4678-af1c-55a4030ff9d9",
    modelSetId: "04b02d5f-68f3-4f99-9da4-25efc09e8732",
    modelSetViewId: "16f86a0f-5342-4217-bb9a-c07b727fdf77",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:Af_CxVQ8R9Gk7aIC2c69Rw",
        viewableName: "ODV18-SEMY-ARST-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:QlwJKiUVTzORuyDvPuGl1Q",
        viewableName: "ODV18-SEMY-P41-ASBUILT",
      },
    ],
  },

  {
    containerId: "e4cde0c5-7fd9-4974-9832-616f058478f9",
    modelSetId: "b5e38b3b-e760-44b1-95c2-699adb09654d",
    modelSetViewId: "6ae54740-0d61-46d6-bfb6-fbb0ed462798",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:q8g1LE0vQ2WO5AHJ9Kd55A",
        viewableName: "SOL10-SEMY-P41-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:gs0PRB3eRUS6ANLK09vDYA",
        viewableName: "SOL10-SEMY-ARST-ASBUILT",
      },
    ],
  },
  {
    containerId: "a08e2cf9-5b5c-4254-883e-15a9fcf3cb5c",
    modelSetId: "981d3313-3ea4-419d-9c47-3a9837ae4570",
    modelSetViewId: "3f6d8589-bd8c-404f-b0b9-db847f90d807",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:k9jCDybIRKK0DqORUNDnrA",
        viewableName: "SEMY-SOL20-ARST-ASBUILT",
      },
    ],
  },
  {
    containerId: "1c8224f1-b860-4a2b-821b-d393c94b190d",
    modelSetId: "2cef0d71-341d-43ab-9270-30dc3a2ac6f3",
    modelSetViewId: "a77b9e61-2f7b-40aa-ac3e-575d2aab3e82",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:NsE81iHwS6inclXR2YMw_g",
        viewableName: "BS19-SEMY-P41-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:cH693J46Riyi-_ccyuHx4g",
        viewableName: "BS19-SEMY-ARST-ASBUILT",
      },
    ],
  },
  {
    containerId: "bca6a4c5-fbd8-4dcb-a637-b3713a06cc8d",
    modelSetId: "da80d29f-f7b0-4445-bf04-1b5ffeb6aa03",
    modelSetViewId: "e629ca4e-730a-49b9-82c8-6981d9ff332e",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:VLzD-rrOS9SQvV6rnJT7LA",
        viewableName: "SMY-SEMY-ARST-JV3_OCAB",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:Ty5wLZ92TqCHkIn80Mmipg",
        viewableName: "JV3-SEMY-P41-ASBUILT-COMMON AREAS",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:U9tz-MHvQfS2Hg9gRITkdA",
        viewableName: "JV3-SEMY-P41-ASBUILT-OCAB",
      },
    ],
  },
  {
    containerId: "1c8224f1-b860-4a2b-821b-d393c94b190d",
    modelSetId: "2cef0d71-341d-43ab-9270-30dc3a2ac6f3",
    modelSetViewId: "a77b9e61-2f7b-40aa-ac3e-575d2aab3e82",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:NsE81iHwS6inclXR2YMw_g",
        viewableName: "BS19-SEMY-P41-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:cH693J46Riyi-_ccyuHx4g",
        viewableName: "BS19-SEMY-ARST-ASBUILT",
      },
    ],
  },
  // {
  //   containerId: "bca6a4c5-fbd8-4dcb-a637-b3713a06cc8d",
  //   modelSetId: "da80d29f-f7b0-4445-bf04-1b5ffeb6aa03",
  //   modelSetViewId: "e629ca4e-730a-49b9-82c8-6981d9ff332e",
  //   definition: [
  //     {
  //       lineageUrn: "urn:adsk.wipemea:dm.lineage:VLzD-rrOS9SQvV6rnJT7LA",
  //       viewableName: "SMY-SEMY-ARST-JV3_OCAB",
  //     },
  //     {
  //       lineageUrn: "urn:adsk.wipemea:dm.lineage:Ty5wLZ92TqCHkIn80Mmipg",
  //       viewableName: "JV3-SEMY-P41-ASBUILT-COMMON AREAS",
  //     },
  //     {
  //       lineageUrn: "urn:adsk.wipemea:dm.lineage:U9tz-MHvQfS2Hg9gRITkdA",
  //       viewableName: "JV3-SEMY-P41-ASBUILT-OCAB",
  //     },
  //   ],
  // },
  {
    containerId: "ad45ddb0-25b9-451d-9c3a-61c7a6e0232f",
    modelSetId: "a202460b-8f04-4cea-b9cf-29b9f03a4ca7",
    modelSetViewId: "c3e76c0d-6441-4b2a-aace-93829f8eed66",
    definition: [
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:ys5aGM_9S8S7mQQVGsSk1Q",
        viewableName: "FV50-SEMY-P41-ASBUILT",
      },
      {
        lineageUrn: "urn:adsk.wipemea:dm.lineage:HT_kw5D_SEyxCe84jqaASQ",
        viewableName: "FV50-SEMY-ARST-ASBUILT",
      },
    ],
  },
];

async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See the console for more details.");
    console.error(err.message);
  }
}

export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer(
      {
        getAccessToken,
      },
      async function () {
        const config = {
          extensions: [
            "Autodesk.DocumentBrowser",
            "Autodesk.AEC.Minimap3DExtension",
          ],
        };
        const v = new Autodesk.Viewing.GuiViewer3D(container, config);
        v.start();
        v.setTheme("light-theme");
        viewer = v;

        resolve(v);
      }
    );
  });
}

export function createCustomToolbar(viewer, onclick) {
  const toolbar = viewer.getTo;
}

export function loadModel(urn, guid) {
  function onDocumentLoadSuccess(doc) {
    var viewables = guid
      ? doc.getRoot().findByGuid(guid)
      : doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, viewables);
    viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      onGeometryLoaded
    );
  }
  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }
  Autodesk.Viewing.Document.load(
    "urn:" + urn,
    onDocumentLoadSuccess,
    onDocumentLoadFailure
  );
}

export function loadItemInModel(urn) {
  function onDocumentLoadSuccess(doc) {

    viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
    viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      () => { }
    );
  }

  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }

  const urn_encoded = window.btoa(urn).replace(/=/g, "");
  Autodesk.Viewing.Document.load(
    "urn:" + urn_encoded,
    onDocumentLoadSuccess,
    onDocumentLoadFailure
  );
}

export function loadInitialModel(viewer, item, projectId) {
  function onDocumentLoadSuccess(doc) {
    selectedProjectItem = item;
    selectedProject = projectId;

    viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
    viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      onInitialGeometryLoaded
    );
  }

  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }

  const urn = window.btoa(item.id).replace(/=/g, "");
  Autodesk.Viewing.Document.load(
    "urn:" + urn,
    onDocumentLoadSuccess,
    onDocumentLoadFailure
  );
}


export function loadModelforIssueCreation(item) {
  function onDocumentLoadSuccess(doc) {
    selectedProjectItem = item;
    selectedProject = projectId;

    viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry(true));
    viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      onGeometryIssueLoad
    );
  }
  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }
  const urn = window.btoa(item.id).replace(/=/g, "");
  Autodesk.Viewing.Document.load(
    "urn:" + urn,
    onDocumentLoadSuccess,
    onDocumentLoadFailure
  );
}
export async function setPushpinData(v) {
  pushpinData = v;
}
export async function createPushPins(v, issue) {
  var pushpinExtension = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );
  pushpinExtension.removeAllItems();
  pushpinExtension.showAll();

  const pushpin = [];

  if (issue.sheetGuid !== viewer.selectedItem.guid()) {
    var viewable = viewer.bubble.search({ guid: issue.sheetGuid }); // get sheet by guid
    if (!viewable.length) {
      return console.error("Sheet could not be found.");
    }
    // Select sheet to display (callbacks are the same as in `onDocumentLoadSuccess`)
    viewer.selectItem(viewable[0], onItemLoadSuccess, onItemLoadFail);
    // To highlight this pushpin in the sheet, use this function `PushPinExtensionHandle.selectOne(issue_id);` within the `onItemLoadSuccess` function.
  } else {
    // If the pushpin is in the current sheet, select the pushpin
    pushpinExtension.selectOne(issue.id);
    pushpin.push(v);

    pushpinExtension.loadItemsV2(pushpin);
    pushpinExtension.selectOne(v.id);
  }
}

export async function pushpin_SelectOne(issueId, pushpin) {
  var pushpinExtension = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );
  // var pa = [];
  // pa.push(pushpin);

  //pushpinExtension.loadItemsV2(pa);
  pushpinExtension.selectOne(issueId);
}
async function onGeometryLoaded(evt) {
  //load extension of pushpin
  //remove last items collection
  var pushpinExtension = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );
  pushpinExtension.removeAllItems();
  pushpinExtension.showAll();

  var pushpin = [];
  pushpin.push({
    type: "issues",
    id: pushpinData.id,
    label: pushpinData.title,
    status: pushpinData.status,
    position: pushpinData.position,
    objectId: pushpinData.objectId,
    viewerState: pushpinData.viewerState,
  });
  pushpinExtension.loadItemsV2(pushpin);
  pushpinExtension.selectOne(pushpinData.id);
}
async function onInitialGeometryLoaded(evt) {
  //load extension of pushpin
  //remove last items collection

  console.log("Viewer With Model", viewer);
  pushpinExt = await viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");

  pushpinExt.pushPinManager.addEventListener("pushpin.created", function (e) {
    pushpinExt.endCreateItem();
    console.log({ e });
    const newIssue = e.value.itemData;
    pushpinExt.setDraggableById(newIssue.id, true);
    // console.log(e);
  });

  const fasIcon = document.createElement("i");

  pushpinExt.pushPinManager.addEventListener("pushpin.selected", function (e) {
    console.log(e);
    const pushPinItem = e.value;
    const pushPinList = e.target.pushPinList;
    fasIcon.className = "";
    fasIcon.style.fontSize = "";

    pushPinList.forEach((pushpin) => {
      const unselectedPusPinsDiv = document.getElementById(pushpin.itemData.id);
      unselectedPusPinsDiv.backgroundImage = "";
    });
    // const pushpindiv = document.getElementById(pushPinItem.itemData.id);
    // pushpindiv.style.backgroundImage = "";
  });

  pushpinExt.removeAllItems();
  pushpinExt.showAll();

  const filter = {
    "filter[linkedDocumentUrn]": selectedProjectItem.relationships.item.data.id,
  };

  const allIssues = await getAllIssues(selectedProject, filter);

  //console.log({ allIssues });

  var pushpin = [];

  //  await populateIssueList('#issue-list', allIssues)
  $.each(allIssues, (index, issue) => {
    //  console.log(issue);
    const pushpinDetails =
      issue.linkedDocuments.length > 0
        ? issue.linkedDocuments[0].details
        : null;

    if (pushpinDetails) {
      pushpin.push({
        type: "issues",
        id: issue.id,
        label: issue.title,
        status: issue.status,
        position: pushpinDetails.position,
        objectId: pushpinDetails.objectId,
        viewerState: pushpinDetails.viewerState,
      });
    }
  });
  pushpinExt.loadItemsV2(pushpin);

  $("#btn-create-issue").attr("disabled", false);
}
async function onGeometryIssueLoad(evt) {
  pushpinIssueExt = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );

  pushpinIssueExt.startCreateItem({
    label: "New Issue",
    status: "open",
    type: "issues",
  });

  pushpinIssueExt.pushPinManager.addEventListener(
    "pushpin.created",
    function (e) {
      pushpinIssueExt.endCreateItem();
      console.log({ e });
      const newIssue = e.value.itemData;
      pushpinIssueExt.setDraggableById(newIssue.id, true);
      //console.log(viewer.selectedItem);
    }
  );
}

export async function startCreatePushPin() {
  alert("Click on one of the object in the Viewer");
  pushpinExt.startCreateItem({ label: "New", status: "open", type: "issues" });
}
export async function loadModelAndIssues(viewer, item, projectId) {
  selectedProjectItem = item;
  selectedProject = projectId;
  loadedModelCounter = 0;
  await getProjectModels(projectId);
  await loadIssuesList(projectId);
  // const urn = window.btoa(item.id).replace(/=/g, "");
  // Autodesk.Viewing.Document.load(
  //   "urn:" + urn,
  //   onDocumentLoadSuccess,
  //   onDocumentLoadFailure
  // );
}

async function getProjectModels(containerId) {
  // function onDocumentLoadSuccess(doc) {
  //   const loadOptions = {
  //     globalOffset: { x: 0, y: 0, z: 0 }, // force all models to origin
  //     applyRefPoint: true, // Apply reference point to all models
  //     // placementTransform: new THREE.Matrix4().setPosition({ x: 0, y: 0, z: 0 }), // Force placement to origin
  //     keepCurrentModels: true, // Keeps existing models in the viewer
  //     placementTransform: new THREE.Matrix4().setPosition(m.xform)
  //   };
  //   const geometry = doc.getRoot().getDefaultGeometry();
  //   console.log("geometry node:", geometry);
  //   viewer.loadDocumentNode(
  //     doc,
  //     doc.getRoot().getDefaultGeometry(),
  //     loadOptions
  //   );

  //   viewer.addEventListener(
  //     Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
  //     modelLoaded
  //   );
  // }

  function onDocumentLoadSuccess(doc) {
    const geometry = doc.getRoot().getDefaultGeometry();
    const offset = geometry?.globalOffset || { x: 0, y: 0, z: 0 };

    const loadOptions = {
      globalOffset: offset,
      keepCurrentModels: true,
      placementTransform: new THREE.Matrix4().setPosition(offset),
    };

    viewer.loadDocumentNode(doc, geometry, loadOptions);

    viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      modelLoaded
    );
  }


  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }

  const projectItems = await getOneProject(containerId);
  console.log("PRoject Items", projectItems);
  modelCount = projectItems.length;
  const modelSet = modelSetViews.filter(
    (model) => model.containerId === containerId
  );
  if (modelSet.length > 0) {
    modelCount = modelSet[0].definition.length;
    const projectItemResults = await Promise.all(projectItems);
    modelSet[0].definition.forEach(async (model, index) => {
      const objItem = projectItemResults.filter(
        (item) => item.id === model.lineageUrn
      );
      //    console.log(objItem);

      if (objItem[0].latestVersion) {
        g_projectItems.push(objItem[0]);
        const urn = window.btoa(objItem[0].latestVersion.id).replace(/=/g, "");
        console.log("Item URN", urn);
        Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          onDocumentLoadSuccess,
          onDocumentLoadFailure
        );

      }
    });
  } else {
    projectItems.forEach(async (item, index) => {
      const itemObj = await item;
      const latestVersion = itemObj.latestVersion;
      // issueFilter = {
      //   "filter[linkedDocumentUrn]": itemObj.id,
      // };
      // allIssues = await getAllIssues(projectId, issueFilter);
      //      console.log("ItemObj", itemObj);
      g_projectItems.push(itemObj);
      const urn = window.btoa(latestVersion.id).replace(/=/g, "");
      console.log("Item URN", urn);
      Autodesk.Viewing.Document.load(
        `urn:${urn}`,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
      );
    });
  }
}

async function modelLoaded(evt) {
  loadedModelCounter++;
  if (loadedModelCounter === modelCount) {
    if (viewer.model) {
      viewer.loadExtension("Autodesk.AEC.LevelsExtension").then(async () => {
        console.log("Levels Extension Loaded");
        await loadIssuePushpins();
      });
      viewer.loadExtension("Autodesk.AEC.Minimap3DExtension").then(async () => {
        console.log("Minimap3DExtension Extension Loaded");
      });

      if (deviceType) {
        if (deviceType == "mobile") {
          await hideToolbar(viewer, [
            {
              type: "navTools",
              toolbarIds: [
                "toolbar-orbitTools",
                "toolbar-panTool",
                "toolbar-zoomTool",
                "toolbar-cameraSubmenuTool",
                "toolbar-bimWalkTool"
              ]
            },
            {
              type: "modelTools",
              toolbarIds: [
                "toolbar-measurementSubmenuTool",
                "toolbar-sectionTool",
                "toolbar-documentModels",
                "toolbar-explodeTool",
                "toolbar-pushpinVis",
                "toolbar-pushpinFieldIssuesVis",
                "toolbar-pushpinRfisVis"
              ]
            },
            {
              type: "settingsTools",
              toolbarIds: [
                "toolbar-fullscreenTool",
                "toolbar-propertiesTool",
                "toolbar-settingsTool"
              ]
            }

          ]);

          }

      }






    }
  }
}

export async function loadModelsandCreateIssue(viewer, projectId, srcParam) {
  selectedProject = projectId;
  src = srcParam;
  loadedModelCounter = 0;
  viewer.addEventListener(
    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
    issuesModelLoaded
  );

  function onDocumentLoadSuccess(doc) {
    const loadOptions = {
      // globalOffset: { x: 0, y: 0, z: 0 }, // force all models to origin
      // placementTransform: new THREE.Matrix4().setPosition({ x: 0, y: 0, z: 0 }), // Force placement to origin
      keepCurrentModels: true, // Keeps existing models in the viewer
    };
    viewer.loadDocumentNode(
      doc,
      doc.getRoot().getDefaultGeometry(),
      loadOptions
    );
  }

  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }

  const projectItems = await getOneProject(projectId);
  //allIssues = await getAllIssues(projectId, {});
  modelCount = projectItems.length;
  const modelSet = modelSetViews.filter(
    (model) => model.containerId === projectId
  );

  if (modelSet.length > 0) {
    modelCount = modelSet[0].definition.length;
    const projectItemResults = await Promise.all(projectItems);
    modelSet[0].definition.forEach(async (model, index) => {
      const objItem = projectItemResults.filter(
        (item) => item.id === model.lineageUrn
      );
      //console.log(objItem);
      if (objItem[0].latestVersion) {
        g_projectItems.push(objItem[0]);
        const urn = window.btoa(objItem[0].latestVersion.id).replace(/=/g, "");
        console.log("Item URN", urn);
        Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          onDocumentLoadSuccess,
          onDocumentLoadFailure
        );
      }
    });
  }
  else {
    projectItems.forEach(async (item, index) => {
      const itemObj = await item;
      const latestVersion = itemObj.latestVersion;
      console.log("ItemObj", "Item ", index + 1);
      const urn = window.btoa(latestVersion.id).replace(/=/g, "");
      g_projectItems.push(itemObj);
      console.log("Item URN", urn);
      Autodesk.Viewing.Document.load(
        `urn:${urn}`,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
      );
    });
  }

}


export async function loadModelsandLoadOneIssue(
  viewer,
  projectId,
  issueDetails,
  srcParam
) {
  selectedProject = projectId;
  src = srcParam;
  loadedModelCounter = 0;
  oneIssueDetails = issueDetails;

  viewer.addEventListener(
    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
    async (evt) => {
      loadedModelCounter++;
      console.log("Loaded Geometry", loadedModelCounter);
      if (loadedModelCounter === modelCount) {
        await viewer
          .loadExtension("Autodesk.AEC.LevelsExtension")
          .then(async () => {
            console.log("Levels Extension Loaded");
            await viewer
              .loadExtension("Autodesk.BIM360.Extension.PushPin")
              .then(async (ext) => {
                ext.removeAllItems();
                ext.showAll();

                var pushpin = [];
                pushpin.push({
                  type: "issues",
                  id: oneIssueDetails.id,
                  label: `#${oneIssueDetails.displayId} - ${oneIssueDetails.title}`,
                  status: oneIssueDetails.status,
                  position: oneIssueDetails.linkedDocuments[0].details.position,
                  objectId: oneIssueDetails.linkedDocuments[0].details.objectId,
                  viewerState:
                    oneIssueDetails.linkedDocuments[0].details.viewerState,
                });

                await ext.loadItemsV2(pushpin);

                console.log("Pushpin Manager", ext);

                ext.pushPinManager.addEventListener(
                  "pushpin.selected",
                  async (e) => {
                    console.log("pushpin.selected", e);
                    const leaflet = document.querySelector(
                      ".leaflet-text-label"
                    );
                    if (leaflet) {
                      leaflet.addEventListener("click", (e) => {
                        console.log(e);
                      });
                    }
                  }
                );

                // Attach double-click event to each pushpin

                const pushpinContainer = document.querySelector(
                  ".adsk-viewing-viewer"
                ); // Adjust if needed
                if (pushpinContainer) {
                  pushpinContainer.addEventListener("dblclick", (event) => {
                    const pushpins = ext.pushPinManager.pushPinList;
                    console.log(event);

                    pushpins.forEach((pushpin) => {
                      if (pushpin.container.contains(event.target)) {
                        event.stopPropagation();
                        console.log("dblclick", e);
                      }
                    });
                  });

                  console.log(
                    "Double-click event attached via pushpin container."
                  );
                }

                await viewer.addEventListener(
                  ext.PUSH_PINS_LOADED_EVENT,
                  () => {
                    console.log("Pushpins loaded, adding dblclick listener...");

                    const pushPinManager = ext.pushPinManager;

                    viewer.container.addEventListener("dblclick", (event) => {
                      const pushpins = pushPinManager.pushPinList;
                      console.log(event);
                      pushpins.forEach((pushpin) => {
                        // Check if the double-clicked target is inside a pushpin
                        if (pushpin.container.contains(event.target)) {
                          event.stopPropagation(); // Prevent conflicts
                          console.log("dblclick", e);
                        }
                      });
                    });

                    console.log(
                      "Double-click event attached via Viewer container."
                    );
                  }
                );
              });

            //    pushpinExt.selectOne(oneIssueDetails.id);
          });
      }

    }
  );

  function onDocumentLoadSuccess(doc) {
    const loadOptions = {
      globalOffset: { x: 0, y: 0, z: 0 }, // force all models to origin
      placementTransform: new THREE.Matrix4().setPosition({ x: 0, y: 0, z: 0 }), // Force placement to origin
      keepCurrentModels: true, // Keeps existing models in the viewer
    };
    viewer.loadDocumentNode(
      doc,
      doc.getRoot().getDefaultGeometry(),
      loadOptions
    );
  }

  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);

  }

  const projectItems = await getOneProject(projectId);
  //allIssues = await getAllIssues(projectId, {});

  modelCount = projectItems.length;
  const modelSet = modelSetViews.filter(
    (model) => model.containerId === projectId
  );


  if (modelSet.length > 0) {
    modelCount = modelSet[0].definition.length;
    const projectItemResults = await Promise.all(projectItems);
    modelSet[0].definition.forEach(async (model, index) => {
      const objItem = projectItemResults.filter(
        (item) => item.id === model.lineageUrn
      );
      //console.log(objItem);
      const urn = window.btoa(objItem[0].latestVersion.id).replace(/=/g, "");
      Autodesk.Viewing.Document.load(
        `urn:${urn}`,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
      );
    });
  }
  else {
    projectItems.forEach(async (item, index) => {
      const itemObj = await item;
      const latestVersion = itemObj.latestVersion;
      // issueFilter = {
      //   "filter[linkedDocumentUrn]": itemObj.id,
      // };
      // allIssues = await getAllIssues(projectId, issueFilter);
      console.log("ItemObj", itemObj);
      const urn = window.btoa(latestVersion.id).replace(/=/g, "");
      console.log("Item URN", urn);
      Autodesk.Viewing.Document.load(
        `urn:${urn}`,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
      );
    });
  }


}

async function issuesModelLoaded(evt) {
  //load extension of pushpin
  //remove last items collection
  loadedModelCounter++;
  console.log("Loaded Geomteries", loadedModelCounter);
  if (loadedModelCounter === modelCount) {
    await viewer.loadExtension("Autodesk.AEC.LevelsExtension").then(async () => {
      console.log("Levels Extension Loaded");

    });
    if (deviceType) {
      if (deviceType == "mobile") {
        await hideToolbar(viewer, [
          {
            type: "navTools",
            toolbarIds: [
              "toolbar-orbitTools",
              "toolbar-panTool",
              "toolbar-zoomTool",
              "toolbar-cameraSubmenuTool",
              "toolbar-bimWalkTool"
            ]
          },
          {
            type: "modelTools",
            toolbarIds: [
              "toolbar-measurementSubmenuTool",
              "toolbar-sectionTool",
              "toolbar-documentModels",
              "toolbar-explodeTool",
              "toolbar-pushpinVis",
              "toolbar-pushpinFieldIssuesVis",
              "toolbar-pushpinRfisVis"
            ]
          },
          {
            type: "settingsTools",
            toolbarIds: [
              "toolbar-fullscreenTool",
              "toolbar-propertiesTool",
              "toolbar-settingsTool"
            ]
          }

        ]);

        await initiateCreateIssue_Mobile(viewer, { new_guid: newGuid }, userGuid);
      }

    }

    else {
      await initIssueCreate();
    }


  }
}

async function loadIssuePushpins(filter = {}) {
  pushpinExt = await viewer.loadExtension("Autodesk.BIM360.Extension.PushPin");

  pushpinExt.pushPinManager.addEventListener(
    "pushpin.selected",
    async function (e) {
      //  console.log(e);
      const pushPinItem = e.value;
      const pushPinList = e.target.pushPinList;
      pushPinList.forEach((pushpin) => {
        const unselectedPusPinsDiv = document.getElementById(
          pushpin.itemData.id
        );
        if (!unselectedPusPinsDiv.classList.contains("selected")) {
          unselectedPusPinsDiv.classList.add("unselected");
        } else {
          unselectedPusPinsDiv.classList.remove("unselected");
        }
      });
    }
  );
  pushpinExt.removeAllItems();
  pushpinExt.showAll();
  // const filter = {
  //   "filter[linkedDocumentUrn]": selectedProjectItem.relationships.item.data.id,
  // };

  var pushpin = [];
  const allIssues = await getAllIssues(selectedProject);
  console.log('All Issues', allIssues)
  $.each(allIssues, (index, issue) => {
    //  console.log(issue);
    const pushpinDetails =
      issue.linkedDocuments.length > 0
        ? issue.linkedDocuments[0].details
        : null;

    if (pushpinDetails && pushpinDetails.objectId) {
      pushpin.push({
        type: "issues",
        id: issue.id,
        label: `#${issue.displayId} - ${issue.title}`,
        status: issue.status,
        position: pushpinDetails.position,
        objectId: pushpinDetails.objectId,
        viewerState: pushpinDetails.viewerState,
      });
    }
  });
  pushpinExt.loadItemsV2(pushpin);
}

async function loadIssuesList(containerId) {
  const divIssueSidebar = document.getElementById("issues-sidebar-items");
  divIssueSidebar.innerHTML = "";
  //console.log(allIssues);

  const issues = await getAllIssues(containerId);
  // console.log("Issues", issues);
  $.each(issues, (index, issue) => {
    const divSubIcon = document.createElement("div");
    const customAttributes = issue.customAttributes;
    const findHemyXLink = customAttributes.filter(
      (attributes) => attributes.title === "Hemy X Link"
    );
    const hemyLinkAttribute = findHemyXLink[0];
    //   console.log(hemyLinkAttribute);

    let innerSubIcon = "";

    divSubIcon.setAttribute("id", `div-issue-subicon-${issue.id}`);

    const statusDisplay = {
      open: {
        title: "Open",
        color: "#f5bf42",
      },
      draft: {
        title: "Draft",
        color: "#000000",
      },
      pending: {
        title: "Pending",
        color: "blue",
      },
      in_review: {
        title: "In Review",
        color: "purple",
      },
      closed: {
        title: "Closed",
        color: "gray",
      },
    };

    if (hemyLinkAttribute && hemyLinkAttribute.value) {
      innerSubIcon = ` <div class="d-block justify-content-between">
                            <div class="d-flex">
                               <h6 class="mb-1 fw-bold">#${issue.displayId} - ${issue.title
        }</h6>
                            </div>
                            <div class="d-flex" style="height: 20px; align-items: center;">
                                <div style="border-radius: 5px; width: 5px; height: 20px; background-color: ${statusDisplay[issue.status].color
        }"></div>
                                <small class="ms-1">${statusDisplay[issue.status].title
        } &middot;</small>
                                <a id="deviation-${issue.id
        }" target="_blank" href="${hemyLinkAttribute.value
        }" title="Go to record"
                                    style="color: #495057;" class="ms-2">
                                    <svg class="w-[18px] h-[18px] text-gray-800 dark:text-white" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                        viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M3 15v3c0 .5523.44772 1 1 1h9.5M3 15v-4m0 4h9m-9-4V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5H3Zm5 0v8m4-8v8m7.0999-1.0999L21 16m0 0-1.9001-1.9001M21 16h-5" />
                                    </svg>
                                </a>
                            </div>
                        </div>`;
    } else {
      innerSubIcon = ` <div class="d-block justify-content-between">
                            <div class="d-flex">
                               <h6 class="mb-1 fw-bold">#${issue.displayId} - ${issue.title
        }</h6>
                            </div>
                            <div class="d-flex" style="height: 20px; align-items: center;">
                                <div style="border-radius: 5px; width: 5px; height: 20px; background-color: ${statusDisplay[issue.status].color
        }"></div>
                                <small class="ms-1">${statusDisplay[issue.status].title
        } &middot;</small>
                            </div>
                        </div>`;
    }
    divSubIcon.innerHTML = innerSubIcon;
    divSubIcon.className = "sub-icon issue";

    divSubIcon.onclick = (event) => {
      pushpinExt.selectOne(issue.id);
      $.each(issues, (index, issue_subicon) => {
        const subicon = document.getElementById(
          `div-issue-subicon-${issue_subicon.id}`
        );
        if (
          divSubIcon.getAttribute("id") ===
          `div-issue-subicon-${issue_subicon.id}`
        ) {
          subicon.classList.add("active");
        } else {
          subicon.classList.remove("active");
        }
      });
      //console.log(divSubIcon.getAttribute("id"));
    };

    divIssueSidebar.appendChild(divSubIcon);
  });
}

async function hideToolbar(viewer, toolBars = []) {

  toolBars.forEach((toolbar) => {
    const toolBarType = toolbar.type;
    const toolBarSet = viewer.toolbar.getControl(toolBarType);
    toolbar.toolbarIds.forEach((tbids) => {
      toolBarSet.removeControl(tbids)
    })
  })
}


async function initIssueCreate() {
  pushpinIssueExt = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );

  pushpinIssueExt.startCreateItem({
    label: "New Issue",
    status: "open",
    type: "issues",
  });
  console.log({ g_projectItems });
  pushpinIssueExt.pushPinManager.addEventListener(
    "pushpin.created",
    async function (e) {
      pushpinIssueExt.endCreateItem();
      console.log({ e });
      const newIssue = e.value.itemData;
      const metadata = await getMetadata(newIssue.seedURN);
      console.log(metadata);
      const view = metadata.data.metadata[0];
      const item = g_projectItems.filter(
        (item) =>
          item.latestVersion.relationships.derivatives.data.id ===
          newIssue.seedURN
      )[0];
      //const urn = window.atob(`${newIssue.seedURN}=`);
      //const params = new URLSearchParams(urn);
      //    console.log({ item });
      //      pushpinIssueExt.setDraggableById(newIssue.id, true);
      const issuePayload = {
        title: "New Issue",
        //        description:
        //         "A conflict between the HVAC duct and the structural beam has been identified.",
        status: "open",
        priority: "high",
        //        due_date: "2025-01-22",
        //        assigned_to: {
        //          id: "user_12345", // Replace with a valid user ID
        //          type: "user",
        //        },

        // issue_type: {
        //   id: "67890", // Replace with a valid issue type ID
        //   name: "Clash Detection",
        // },
        issueSubtypeId: "86fb9dd6-fce6-40b3-a49d-0e9437bd8111",
        location: {
          position: newIssue.position,
          view_data: {
            view_id: view.guid, // Replace with the view ID
            object_id: newIssue.objectId, // Replace with the object ID
          },
        },
        placement: {
          type: "3d",
          position: newIssue.position,
          view: view,
          sheet: {
            sheet_id: newIssue.objectData.guid,
            name: newIssue.objectData.viewName,
            urn: newIssue.objectData.urn,
          },
        },
        linkedDocuments: [
          {
            type: "TwoDVectorPushpin",
            urn: item.id,
            createdAtVersion: item.latestVersion.attributes.versionNumber,
            details: {
              viewable: {
                name: newIssue.objectData.viewName,
                is3D: true,
                id: newIssue.objectData.viewableId,
              },
              position: newIssue.position,
              objectId: newIssue.objectId,
              viewerState: newIssue.viewerState,
            },
          },
        ],

        // root_cause: {
        //   id: "123", // Replace with a valid root cause ID
        //   name: "Design Issue",
        // },
        // // custom_attributes: [
        //   {
        //     id: "attribute_1",
        //     value: "Example value 1",
        //   },
        //   {
        //     id: "attribute_2",
        //     value: "Example value 2",
        //   },
        // ],
        // attachments: [
        //   {
        //     urn: "urn:adsk.objects:os.object:bucket-name/file_name.png",
        //     name: "Screenshot.png",
        //   },
        // ],
      };
      //     const newIssueData = await createIssue_v2(issuePayload, selectedProject);
      //      console.log(newIssueData);

      console.log(src);

      if (src) {
        const issueFormPushpin = document.getElementById("input-issue-pushpin");
        if (issueFormPushpin) {
          issueFormPushpin.value = JSON.stringify(issuePayload);
        }
        src.srcWin.postMessage(issuePayload, src.srcOrigin);
      } else {
        alert("There is a problem communicating with IFrame and Powerapps");
        pushpinIssueExt.removeAllItems();
        pushpinIssueExt.startCreateItem({
          label: "New Issue",
          status: "open",
          type: "issues",
        });
        return;
      }
    }
  );
}

export async function initiateCreateIssueV2(viewer, message, userGuid) {
  const pushpin_ext = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );
  //console.log("Pushpin Extension", pushpin_ext);
  const pushpins = pushpin_ext.pushPinManager.pushPinList;
  const create_issuenotif = document.getElementById("add-issue-notif");
  const btn_close = document.getElementById("btn-cancel-issue-create");

  btn_close.onclick = () => {
    create_issuenotif.classList.add("d-none");
    pushpin_ext.endCreateItem();
    pushpin_ext.showAll();
  };

  create_issuenotif.classList.remove("d-none");
  pushpin_ext.hideAll();

  pushpin_ext.startCreateItem({
    label: "New Issue",
    status: "open",
    type: "issues",
  });

  const upsert_pushpin_details = async (pushpin_item) => {
    const div_loading = document.getElementById("div-loading");
    div_loading.classList.remove("d-none");
    const newIssue = pushpin_item.itemData;
    const metadata = await getMetadata(newIssue.seedURN);
    const view = metadata.data.metadata[0];
    const item = g_projectItems.filter(
      (item) =>
        item.latestVersion.relationships.derivatives.data.id ===
        newIssue.seedURN
    )[0];

    const issuePayload = {
      title: "New Issue",
      status: "open",
      priority: "high",
      issueSubtypeId: "86fb9dd6-fce6-40b3-a49d-0e9437bd8111",
      location: {
        position: newIssue.position,
        view_data: {
          view_id: view.guid, // Replace with the view ID
          object_id: newIssue.objectId, // Replace with the object ID
        },
      },
      placement: {
        type: "3d",
        position: newIssue.position,
        view: view,
        sheet: {
          sheet_id: newIssue.objectData.guid,
          name: newIssue.objectData.viewName,
          urn: newIssue.objectData.urn,
        },
      },
      linkedDocuments: [
        {
          type: "TwoDVectorPushpin",
          urn: item.id,
          createdAtVersion: item.latestVersion.attributes.versionNumber,
          details: {
            viewable: {
              name: newIssue.objectData.viewName,
              is3D: true,
              id: newIssue.objectData.viewableId,
            },
            position: newIssue.position,
            objectId: newIssue.objectId,
            viewerState: newIssue.viewerState,
          },
        },
      ],
    };

    const response = await fetch(`/api/sqlite/pushpin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userGuid,
        details: JSON.stringify(issuePayload),
        new_guid: message.new_guid,
      }),
    });
    const get_details = await fetch(`/api/sqlite/pushpin/${message.new_guid}`);
    const result = await get_details.json();
    console.log(result);
    div_loading.classList.add("d-none");
  };
  pushpin_ext.addEventListener("pushpin.created", async (event) => {
    const pushpin_item = event.value;
    pushpin_ext.setDraggableById(pushpin_item.itemData.id, true);
    pushpin_ext.endCreateItem();

    create_issuenotif.classList.add("d-none");
    await upsert_pushpin_details(pushpin_item);
    //   console.log(event);
  });
  pushpin_ext.addEventListener("pushpin.modified", async (event) => {
    const pushpin_item = event.value;
    await upsert_pushpin_details(pushpin_item);
  });
}

export async function initiateCreateIssue_Mobile(viewer, message, userGuid) {
  const pushpin_ext = await viewer.loadExtension(
    "Autodesk.BIM360.Extension.PushPin"
  );
  //console.log("Pushpin Extension", pushpin_ext);

  pushpin_ext.startCreateItem({
    label: "New Issue",
    status: "open",
    type: "issues",
  });

  const upsert_pushpin_details = async (pushpin_item) => {
    const div_loading = document.getElementById("div-loading");
    div_loading.classList.remove("d-none");
    const newIssue = pushpin_item.itemData;
    const metadata = await getMetadata(newIssue.seedURN);
    const view = metadata.data.metadata[0];
    const item = g_projectItems.filter(
      (item) =>
        item.latestVersion.relationships.derivatives.data.id ===
        newIssue.seedURN
    )[0];

    const issuePayload = {
      title: "New Issue",
      status: "open",
      priority: "high",
      issueSubtypeId: "86fb9dd6-fce6-40b3-a49d-0e9437bd8111",
      location: {
        position: newIssue.position,
        view_data: {
          view_id: view.guid, // Replace with the view ID
          object_id: newIssue.objectId, // Replace with the object ID
        },
      },
      placement: {
        type: "3d",
        position: newIssue.position,
        view: view,
        sheet: {
          sheet_id: newIssue.objectData.guid,
          name: newIssue.objectData.viewName,
          urn: newIssue.objectData.urn,
        },
      },
      linkedDocuments: [
        {
          type: "TwoDVectorPushpin",
          urn: item.id,
          createdAtVersion: item.latestVersion.attributes.versionNumber,
          details: {
            viewable: {
              name: newIssue.objectData.viewName,
              is3D: true,
              id: newIssue.objectData.viewableId,
            },
            position: newIssue.position,
            objectId: newIssue.objectId,
            viewerState: newIssue.viewerState,
          },
        },
      ],
    };

    const response = await fetch(`/api/sqlite/pushpin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userGuid,
        details: JSON.stringify(issuePayload),
        new_guid: message.new_guid,
      }),
    });
    const get_details = await fetch(`/api/sqlite/pushpin/${message.new_guid}`);
    const result = await get_details.json();
    console.log(result);
    div_loading.classList.add("d-none");
  };
  pushpin_ext.addEventListener("pushpin.created", async (event) => {
    const pushpin_item = event.value;
    pushpin_ext.setDraggableById(pushpin_item.itemData.id, true);
    pushpin_ext.endCreateItem();

    await upsert_pushpin_details(pushpin_item);
    //   console.log(event);
  });
  pushpin_ext.addEventListener("pushpin.modified", async (event) => {
    const pushpin_item = event.value;
    await upsert_pushpin_details(pushpin_item);
  });
}
