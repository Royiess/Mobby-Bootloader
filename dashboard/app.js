const API_BASE = "";

async function fetchServices() {
    const res = await fetch("/status");
    const data = await res.json();
    return data.services;
}

async function fetchMaintenance() {
    const res = await fetch("/maintenance");
    const data = await res.json();
    return data.maintenance;
}

async function toggleMaintenance(state) {
    await fetch("/maintenance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_API_KEY"
        },
        body: JSON.stringify({ enabled: state })
    });

    updateUI();
}

function createServiceCard(service) {

    const div = document.createElement("div");
    div.className = "card";

    const statusColor =
        service.status === "online" ? "🟢"
        : service.status === "offline" ? "🔴"
        : "🟡";

    div.innerHTML = `
        <h2>${statusColor} ${service.name}</h2>
        <p>ID: ${service.id}</p>
        <p>Status: ${service.status || "unknown"}</p>
        <p>Ping: ${service.ping ?? "-"}ms</p>
        <p>Last Heartbeat: ${service.lastHeartbeat ? new Date(service.lastHeartbeat).toLocaleTimeString() : "never"}</p>
    `;

    return div;
}

async function updateUI() {

    const servicesContainer = document.getElementById("services");
    const statusLine = document.getElementById("statusLine");

    const services = await fetchServices();
    const maintenance = await fetchMaintenance();

    servicesContainer.innerHTML = "";

    services.forEach(service => {
        servicesContainer.appendChild(createServiceCard(service));
    });

    statusLine.innerText =
        maintenance
            ? "🚧 Maintenance Mode ACTIVE"
            : "🟢 All systems nominal (for now)";

}

setInterval(updateUI, 3000);

updateUI();
