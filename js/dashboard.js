document.addEventListener("DOMContentLoaded", function() {
    API.storage.local.get(["missions"], (result) => {
        const missions = result.missions || [];
        const missionList = document.getElementById("missionList");
        missionList.innerHTML = "";
        missions.forEach((mission) => {
            const li = document.createElement("li");
            li.classList.add("mission-item");
            li.title = `Mission saved on: ${new Date(mission.timestamp).toLocaleString()}`;
            li.style.display = "flex";
            li.style.alignItems = "center";
            const link = document.createElement("a");
            
            if (mission.alarm) {
                li.classList.add("has-alarm");

                const alarmWrapper = document.createElement("div");
                alarmWrapper.className = "alarm-icon-wrapper";
                alarmWrapper.title = `This mission has an alarm${mission.alarmConfig?.recurring ? " (recurring)" : ""}`;

                const alarmDot = document.createElement("div");
                alarmDot.className = "alarm-dot";

                const alarmRings = document.createElement("div");
                alarmRings.className = "alarm-rings";

                alarmWrapper.appendChild(alarmDot);
                alarmWrapper.appendChild(alarmRings);
                li.appendChild(alarmWrapper);
            }
            link.href = mission.url;
            link.target = "_blank";
            link.textContent = mission.note;
            link.className = "mission-note-link";
            link.setAttribute('tabindex', '0');
            const tag = document.createElement("span");
            var delta = Math.floor((new Date() - new Date(mission.timestamp)) / (1000 * 60 * 60));
            if (delta < 2) {
                tag.textContent = "Just now";
            } else if (delta < 24) {
                tag.textContent = Math.floor(delta) + " hours ago";
            } else if (delta < 168) {
                tag.textContent = Math.floor(delta / 24) + " days ago";
            } else if (delta < 720) {
                tag.textContent = Math.floor(delta / 168) + " weeks ago";
            } else {
                tag.textContent = Math.floor(delta / 720) + " months ago";
            }
            tag.className = "badge";
            const urlBadge = document.createElement("span");
            urlBadge.textContent = mission.url;
            urlBadge.className = "badge url";
            urlBadge.title = mission.url;
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "<svg width='18' height='18' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='10' cy='10' r='9' stroke='#ff5e5e' stroke-width='2' fill='none'/><path d='M7 7L13 13M13 7L7 13' stroke='#ff5e5e' stroke-width='2' stroke-linecap='round'/></svg>";
            deleteBtn.className = "delete-btn";
            deleteBtn.title = "Delete mission";
            deleteBtn.addEventListener("click", () => {
                Call("DELETE_MISSION", { url: mission.url }, (response) => {
                    if (response.success) {
                        console.log("Mission deleted successfully");
                    } else {
                        console.error("Failed to delete mission:", response.reason);
                    }
                    window.location.reload();
                });
            });
            li.appendChild(link);
            li.appendChild(tag);
            li.appendChild(urlBadge);
            li.appendChild(deleteBtn);
            missionList.appendChild(li);
        });
    });
});