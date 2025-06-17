document.getElementById("saveBtn").addEventListener("click", () => {
  const missionText = document.getElementById("mission").value;
  if (!missionText.trim()) {
    alert("Please enter a mission!");
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    const data ={
      url: url,
      note: missionText,
      timestamp: new Date().toISOString(),
      xpos: 0,
      ypos: 0,
    }
    Call("SAVE_MISSION", data, (response) => {
      if (response.success) {
        document.getElementById("mission").value = "";
        renderMissions();
      }
    });
  });
});

function renderMissions() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    chrome.storage.local.get(["missions"], (result) => {
      const missions = result.missions || [];
      const missionList = document.getElementById("missionList");
      missionList.innerHTML = "";
      missions.forEach((mission) => {
        if (mission.url === url) {
          const li = document.createElement("li");
          const noteSpan = document.createElement("span");
          noteSpan.textContent = mission.note;
          noteSpan.style.marginRight = "10px";
          // Edit button
          const editBtn = document.createElement("button");
          editBtn.style.height ="fit-content";
          editBtn.style.width = "fit-content";
          editBtn.textContent = "✏️";
          editBtn.onclick = () => {
            const newNote = prompt("Edit your mission:", mission.note);
            if (newNote && newNote !== mission.note) {
              /*chrome.runtime.sendMessage({
                type: "UPDATE_MISSION",
                url: mission.url,
                note: newNote,
                xpos: mission.xpos,
                ypos: mission.ypos
              }, renderMissions);*/
              const data ={
                url: mission.url,
                note: newNote,
                xpos: mission.xpos,
                ypos: mission.ypos
              }
              Call("UPDATE_MISSION", data, renderMissions);
            }
          };
          // Delete button
          const delBtn = document.createElement("button");
          delBtn.style.height = "fit-content";
          delBtn.style.width = "fit-content";
          delBtn.textContent = "🗑️";
          delBtn.onclick = () => {
            if (confirm("Delete this mission?")) {
              /*chrome.runtime.sendMessage({
                type: "DELETE_MISSION",
                url: mission.url
              }, renderMissions);*/
              Call("DELETE_MISSION", { url: mission.url }, renderMissions);
            }
          };
          li.appendChild(noteSpan);
          li.appendChild(editBtn);
          li.appendChild(delBtn);
          missionList.appendChild(li);
        }
      });
    });
  });
}

document.getElementById("savedMissions").addEventListener("click", renderMissions);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("saveBtn").click();
  } else if (e.key.toLowerCase() === "q" && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    document.getElementById("mission").focus();
  } else if (e.key === "Escape") {
    e.preventDefault();
    window.close();
  }
});

// Initial render
renderMissions();
