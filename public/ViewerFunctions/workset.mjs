let worksetData

export function workset(viewer) {
  extractWorkset(viewer, (worksets) => {
    if (!worksets || worksets.size === 0) {
      console.warn("No worksets found — skipping UI");
      return;
    }

    worksetData = worksets;
    // console.log("Extracted worksets:", worksetData);

    // ✅ Only create UI when data exists
    createWorksetButton(viewer);
    showWorksetPanel(viewer);
  });
}

// Declare the button globally so it can be accessed in other functions
let showWorksetButton;

//#region Workset Button
function createWorksetButton(viewer) {
  const toolbar = viewer.getToolbar();
  if (!toolbar) {
    console.error("Toolbar not found");
    return;
  }

  // Create a new toolbar button
  showWorksetButton = new Autodesk.Viewing.UI.Button(
    "showWorksetButton"
  );

  // Apply icon styling directly to the button's container
  const buttonContainer = showWorksetButton.container;
  buttonContainer.style.backgroundImage = "url(../../images/levels.svg)"; // Set your icon image source here
  buttonContainer.style.backgroundColor = "transparent"; // Make background transparent
  buttonContainer.style.backgroundSize = "25px"; // Adjust size of the background image
  buttonContainer.style.backgroundRepeat = "no-repeat"; // Ensure no repeat of the image
  buttonContainer.style.backgroundPosition = "center"; // Center the image inside the button
  // buttonContainer.style.filter = "invert(1)";
  buttonContainer.style.hoverColor = "#555"; // Optional: Add a hover effect

  showWorksetButton.setToolTip("Levels"); // Set the tooltip for the button

  // Define the action when the button is clicked
  showWorksetButton.onClick = function () {
    if (!viewer.WorksetPanel) {
      showWorksetPanel(viewer);
      viewer.WorksetPanel.setVisible(true); // ✅ SHOW IT
    } else {
      viewer.WorksetPanel.setVisible(
        !viewer.WorksetPanel.isVisible()
      );
    }
  };

  // Add the button to a new toolbar group
  let subToolbar = viewer.toolbar.getControl("myAppToolbar");
  if (!subToolbar) {
    subToolbar = new Autodesk.Viewing.UI.ControlGroup("myAppToolbar");
    toolbar.addControl(subToolbar);
  }
  subToolbar.addControl(showWorksetButton);

  // Call this function once the viewer is fully initialized
  viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, function () {
    createToolbarRepeatingTaskButton(viewer);
  });
}
// #endregion: Workset Button Creation


// #region Workset Panel
// Function to create and display a docking panel
export function showWorksetPanel(viewer) {
  // Create a custom Docking Panel class
  class WorksetPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, title, options) {
      super(viewer.container, title, options);
      this.viewer = viewer;

      // Set the panel styles
      this.container.style.top = "10px";
      this.container.style.left = "10px";
      this.container.style.width = "300px";
      this.container.style.height = "325px";
      this.container.style.resize = "auto";
      this.container.style.backgroundColor = "#ffffff";
      this.container.style.title = "Levels";
      this.container.style.fontWeight = "bolder";

      // Create and configure the scroll container
      this.createScrollContainer();
    }

    // Create the content of the panel
    createScrollContainer() {
      // Create the scroll container
      this.scrollContainer = document.createElement("div");
      this.scrollContainer.style.overflow = "auto";
      this.scrollContainer.style.padding = "1em"; // Add padding to the scroll container
      this.scrollContainer.style.height = "100%"; // Ensure it takes full panel height
      this.container.appendChild(this.scrollContainer); // Append the scroll container to the panel

      // Create and append elements to the scroll container
      this.createPanelContent();
    }

    // Create the content inside the scroll container
    createPanelContent() {

      const container = this.scrollContainer;
      container.innerHTML = "";

      const sorted = sortWorksets(worksetData);
      let activeItem = null;

      sorted.forEach((worksetName) => {
        const item = document.createElement("div");
        item.className = "workset-item";
        item.textContent = worksetName;

        item.onclick = () => {
          const viewer = this.viewer;
          // If clicking the already-active item → reset view
          if (activeItem === item) {
            item.classList.remove("active");
            activeItem = null;

            // SHOW ALL (clear isolate)
            const viewer = this.viewer;
            viewer.impl.modelQueue().getModels().forEach(model => {
              viewer.isolate([], model);
            });

            return;
          }

          // Otherwise, activate new item
          if (activeItem) activeItem.classList.remove("active");
          item.classList.add("active");
          activeItem = item;

          filterByWorkset(worksetName, viewer);
        };

        container.appendChild(item);
      });
    }
  }

  // Check if a panel already exists and remove it
  if (viewer.WorksetPanel) {
    viewer.WorksetPanel.setVisible(false);
    viewer.WorksetPanel.uninitialize();
  }

  // Create a new panel with the title 'Service Task'
  viewer.WorksetPanel = new WorksetPanel(
    viewer,
    "Levels",
    "Levels",
    {}
  );
}
// #endregion Workset Panel


// #region Extract Worksets
function extractWorkset(viewer, callback) {
  const models = viewer.impl.modelQueue().getModels();
  const options = new Set();
  let pending = 0;
  buildWorksetCache(viewer, pending);

  models.forEach((model) => {
    const instanceTree = model.getData()?.instanceTree;
    if (!instanceTree) return;

    const rootId = instanceTree.getRootId();
    if (rootId == null) return;

    const collect = (dbId) => {
      pending++;

      model.getProperties(dbId, (props) => {
        const workset = props.properties?.find(
          p => p.displayName === "Workset"
        );

        if (
          workset?.displayValue &&
          workset.displayValue.toLowerCase().includes("level")
        ) {
          options.add(workset.displayValue);
        }

        pending--;
        if (pending === 0) {
          callback([...options]); // ✅ CORRECT timing
        }
      });

      instanceTree.enumNodeChildren(dbId, collect);
    };

    instanceTree.enumNodeChildren(rootId, collect);
  });

  // safety for empty models
  if (pending === 0) callback([...options]);
}
// #endregion

const worksetCache = new Map(); 
// #region Filter by Workset
function filterByWorkset(worksetName, viewer) {

  viewer.clearSelection();
  viewer.setGhosting(false);

  worksetCache.forEach((modelMap, model) => {
    const dbIds = modelMap.get(worksetName);

    if (dbIds && dbIds.length > 0) {
      // isolate matching elements
      viewer.isolate(dbIds, model);
    } else {
      // ❗ NO MATCHES → HIDE ENTIRE MODEL
      viewer.hide(model.getRootId(), model);
    }
  });
}
// #endregion

// #region Build Workset Cache
function buildWorksetCache(viewer, onDone) {
  const models = viewer.impl.modelQueue().getModels();
  let pending = 0;

  models.forEach((model) => {
    const tree = model.getData()?.instanceTree;
    if (!tree) return;

    const modelMap = new Map();
    worksetCache.set(model, modelMap);

    const rootId = tree.getRootId();

    const walk = (dbId) => {
      pending++;

      model.getProperties(dbId, (props) => {
        const workset = props.properties?.find(
          p => p.displayName === "Workset"
        );

        if (workset?.displayValue) {
          if (!modelMap.has(workset.displayValue)) {
            modelMap.set(workset.displayValue, []);
          }
          modelMap.get(workset.displayValue).push(dbId);
        }

        pending--;
        if (pending === 0 && onDone) onDone();
      });

      tree.enumNodeChildren(dbId, walk);
    };

    tree.enumNodeChildren(rootId, walk);
  });

  if (pending === 0 && onDone) onDone();
}
// #endregion 


// #region Sort Worksets
function sortWorksets(names) {
  return [...names].sort((a, b) => {
    const getNum = (n) => {
      const m = n.match(/-?\d+/);
      return m ? parseInt(m[0], 10) : 999;
    };

    return getNum(a) - getNum(b);
  });
}
// #endregion