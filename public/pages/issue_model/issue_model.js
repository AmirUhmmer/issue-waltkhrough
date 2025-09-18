import {
  initViewer,
  loadModel,
  loadModelsandCreateIssue,
  setPushpinData,
  loadModelsandLoadOneIssue,
} from "../../viewer.js";

try {
  var srcWin = null;
  var srcOrigin = "";
  var src = null;
  const login = document.getElementById("login");
  const params = new URLSearchParams(window.location.search);
  const containerId = params.get("containerId");
  const issueId = params.get("issueId");
  const mode = params.get("mode");

  window.addEventListener("message", async (event) => {
    if (!src) {
      srcWin = event.source;
      srcOrigin = event.origin;

      src = {
        srcWin,
        srcOrigin,
      };
    }

    console.log("Message received from parent:", event.data);

    if (event.data.mode) {
      const updatedIssueData = await fetch(
        `/api/issue/${containerId}/${issueId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: event.data.payload }),
        }
      );

      srcWin.postMessage(updatedIssueData, srcOrigin);
    }
  });

  const resp = await fetch("/api/auth/profile", {
    method: "GET",
    credentials: "include",
  });

  const divLoading = document.getElementById("div-loading");
  if (resp.ok) {
    divLoading.style.display = "none";
    const viewer = await initViewer(document.getElementById("preview"));

    // console.log(issue_details);
    if (issueId && containerId) {
      const issue = await fetch(`/api/issue/${containerId}/${issueId}`);
      const issue_details = await issue.json();
      console.log(issue_details);
      if (issue_details.linkedDocuments.length > 0) {
        await loadModelsandLoadOneIssue(
          viewer,
          containerId,
          issue_details,
          src
        );
      } else {
        console.log("Source Window", src);
        loadModelsandCreateIssue(viewer, containerId, src);
      }
    }
    // console.log(issue_details);
  } else {
    divLoading.classList.remove("d-none");
    const url = await fetch("/api/auth/sso");
    const url_json = await url.json();

    const loginWindow = window.open(
      url_json,
      "Login",
      "width=600,height=600"
    );
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

    //  login.style.visibility = "visible";
    //  login.innerText = "Login";
    //  divLoading.classList.add("d-none");
     login.onclick = () => {
     };
  }
} catch (err) {
  alert("error displaying application");
  console.log(err);
}
