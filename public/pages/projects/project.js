import { getOneItem } from "../../sidebar.js";
import { initViewer, loadItemInModel } from "../../viewer.js";

try {

    const div_loading = document.getElementById("div-loading");
    const params = new URLSearchParams(window.location.search);
    const containerId =  params.get("containerId");
    const itemId = params.get("itemId");
    
    const resp = await fetch(`/api/auth/profile`, {
        method: "GET",
        credentials: "include",
    });

    if (resp.ok) {
        const viewer = await initViewer(document.getElementById("preview"));
        const latestVersion = await getOneItem(containerId, itemId);

        loadItemInModel(latestVersion.id)
        div_loading.classList.add("d-none");
    }
    else {

        const url = await fetch("/api/auth/sso");
        const url_json = await url.json();

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

                window.location.reload(); // Reload the page to load viewer with token
                console.log(token);
            }
        })

    }






}
catch (error) {
    alert('Error Loading Application. Please see console for logs.');
    console.error('error', error);

}