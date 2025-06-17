injectGoogleFont();
let alreadyLoaded = false;
const observer = new MutationObserver(() => {
    if (alreadyLoaded || document.getElementById('mindfulNote')) return;
    if (!document.getElementById('mindful-search-panel')) {
        chrome.storage.local.get("missions", (res) => {
            if (!res || !res.missions) return;
            const missions = res.missions || [];
            const match = missions.find(m => m.url === window.location.href);
            if (match) {
                alreadyLoaded = true;
                const noteBox = document.createElement('div');
                noteBox.id = 'mindfulNote';
                Object.assign(noteBox.style, {
                    position: 'fixed',
                    top: match.ypos || '100px',
                    left: match.xpos || '100px',
                    backgroundColor: '#1e1e2f',
                    color: '#fff',
                    padding: '15px 20px',
                    border: '1px solid rgba(1, 1, 1, 0.48)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    zIndex: 9999,
                    maxWidth: '320px',
                    fontFamily: 'Segoe UI, sans-serif',
                    cursor: 'default',
                    userSelect: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                });
                const text = document.createElement('div');
                text.textContent = match.note;
                Object.assign(text.style, {
                    padding: '8px 0',
                    whiteSpace: 'pre-wrap',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '14px',
                    marginTop: '10px'
                });
                const closeBtn = document.createElement('div');
                closeBtn.innerText = '×';
                Object.assign(closeBtn.style, {
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                });
                const dragHandle = document.createElement('div');
                dragHandle.innerText = ':::';
                Object.assign(dragHandle.style, {
                    position: 'absolute',
                    left: '10px',
                    top: '8px',
                    cursor: 'move',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: 'rgba(255, 255, 255, 0.5)',
                    padding: '4px',
                    color: 'green',
                    transition: 'color 0.2s'
                });
                const minBtn = document.createElement('button');
                minBtn.title = 'Minimize note';
                minBtn.textContent = '-';
                Object.assign(minBtn.style, {
                    position: 'absolute',
                    top: '8px',
                    right: '38px', 
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                });
                minBtn.addEventListener('mouseenter', () => {
                    minBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                });
                minBtn.addEventListener('mouseleave', () => {
                    minBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                });
                minBtn.addEventListener('click', () => {
                    noteBox.style.display = 'none';
                });
                closeBtn.addEventListener('mouseover', () => {
                    closeBtn.style.backgroundColor = 'darkred';
                });
                
                closeBtn.addEventListener('mouseout', () => {
                    closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                });
                closeBtn.addEventListener('click', () => {
                    
                    noteBox.remove();
                    /*chrome.runtime.sendMessage({
                        type: 'DELETE_MISSION',
                        url: window.location.href
                    });*/
                    Call("DELETE_MISSION", { url: window.location.href }, (response) => {
                        if (response.success) {
                            console.log("Mission deleted successfully");
                        } else {
                            console.error("Failed to delete mission:", response.reason);
                        }
                    });
                });

                dragHandle.addEventListener('mouseover', () => {
                    dragHandle.style.color = 'darkgreen';
                });
                
                dragHandle.addEventListener('mouseout', () => {
                    dragHandle.style.color = 'green';
                });

                
                let isDragging = false, offsetX = 0, offsetY = 0;

                dragHandle.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    offsetX = e.clientX - noteBox.getBoundingClientRect().left;
                    offsetY = e.clientY - noteBox.getBoundingClientRect().top;
                    e.preventDefault();
                });

                document.addEventListener('mousemove', (e) => {
                    if (isDragging) {
                        const x = e.clientX - offsetX;
                        const y = e.clientY - offsetY;
                        noteBox.style.left = `${x}px`;
                        noteBox.style.top = `${y}px`;
                        const data ={
                            url: window.location.href,
                            note: match.note,
                            xpos: x,
                            ypos: y
                        }
                        Call("UPDATE_MISSION", data, (response) => {
                            if (response.success) {
                                console.log("Mission updated successfully");
                            } else {
                                console.error("Failed to update mission:", response.reason);
                            }
                        });
                        /*chrome.runtime.sendMessage({
                            type: 'UPDATE_MISSION',
                            url: window.location.href,
                            note: match.note,
                            xpos: x,
                            ypos: y
                        });*/
                    }
                });

                document.addEventListener('mouseup', () => {
                    isDragging = false;
                });

                text.addEventListener('click', () => {
                    const newNote = prompt("Update your mission note:", match.note);
                    if (newNote && newNote !== match.note) {
                        match.note = newNote;
                        text.textContent = newNote;
                        /*chrome.runtime.sendMessage({
                            type: 'UPDATE_MISSION',
                            url: window.location.href,
                            note: newNote,
                            xpos: parseInt(noteBox.style.left || '100', 10),
                            ypos: parseInt(noteBox.style.top || '100', 10)
                        });*/
                        const data ={
                            url: window.location.href,
                            note: newNote,
                            xpos: parseInt(noteBox.style.left || '100', 10),
                            ypos: parseInt(noteBox.style.top || '100', 10)
                        }
                        Call("UPDATE_MISSION", data,()=>{
                            if (response.success) {
                                noteBox.textContent = newNote;
                            }else{
                                noteBox.remove();
                                console.error("Failed to update mission:", response.reason);
                            }
                        });
                    }
                });
                noteBox.appendChild(dragHandle);
                noteBox.appendChild(minBtn);
                noteBox.appendChild(closeBtn);
                noteBox.appendChild(text);
                document.body.appendChild(noteBox);
            }
        });
    }
});
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('keydown', function(e) {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();        
        if (document.getElementById('mindful-search-panel')) {
            document.getElementById('mindful-search-panel').remove();
            document.getElementById('mindful-search-backdrop')?.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'mindful-search-panel';
        Object.assign(panel.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#1e1e2f', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', zIndex: '10000', minWidth: '350px', maxWidth: '90vw', boxShadow: '0 4px 30px rgba(0,0,0,0.5)', color: '#fff', fontFamily: 'Segoe UI, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px',zIndex: '9999', backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s'
        });
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        Object.assign(closeBtn.style, { position: 'absolute', right: '18px', top: '14px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '22px', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', transition: 'background-color 0.2s',color:"#4caf50" });
        closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = 'rgba(255,255,255,0.2)';
        closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = 'rgba(255,255,255,0.1)';
        closeBtn.onclick = () => { panel.remove(); backdrop?.remove(); };
        panel.appendChild(closeBtn);
        const searchWrapper = document.createElement('div');
        Object.assign(searchWrapper.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',

        });
        const search = document.createElement('input');
        search.type = 'text';
        search.placeholder = 'Search your missions...';
        Object.assign(search.style, {
            flex: '1',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.07)',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
            width:'auto',
            height:'auto',
        });
        const addBtn = document.createElement('button');
        addBtn.textContent = '+';
        addBtn.title = 'Add new mission with current search';
        Object.assign(addBtn.style, {
            backgroundColor: '#4caf50',
            color: '#fff',
            border: 'none',
            height:'42px',
            width: '42px',
            padding: '0 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '20px',
            height: '42px',
            display: 'none'
        });
        addBtn.onclick = () => {
            const val = search.value.trim();
            if (val) {
                const data = {
                    url: window.location.href,
                    note: val,
                    timestamp: new Date().toISOString(),
                    xpos: 100,
                    ypos: 100
                };
                Call("SAVE_MISSION", data, (response) => {
                    if (response.success) {
                        renderList();
                        addBtn.style.display = 'none';
                        search.value = '';
                    } else {
                        console.error("Failed to save mission:", response.reason);
                    }
                });
            }
        };
        searchWrapper.appendChild(search);
        searchWrapper.appendChild(addBtn);
        panel.appendChild(searchWrapper);
        const list = document.createElement('ul');
        Object.assign(list.style, { listStyle: 'none', padding: '0', margin: '0', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px',scrollBehavior: 'smooth' });
        panel.appendChild(list);
        const DashBoard = document.createElement('a');
        DashBoard.textContent = '⚙️ Dashboard';
        DashBoard.target = "_blank";
        DashBoard.href = "#";
        DashBoard.addEventListener('click', (e) => {
            e.preventDefault();
            Call("OPEN_DASHBOARD", {}, (response) => {
                if (response.success) {
                    console.log("Dashboard opened successfully");
                } else {
                    console.error("Failed to open dashboard:", response.reason);
                }
            });
            /*chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });*/
        });
        
        Object.assign(DashBoard.style, {
            color: '#fff',
            textDecoration: 'none',
            fontSize: '14px',
            marginLeft: '10px',
            cursor: 'pointer',
            fontFamily: 'Satisfy, cursive',
            fontWeight: 'bold',
            backgroundColor: '#4caf50',
            width: 'fit-content',
            height: 'fit-content',
            borderRadius: '8px',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
        });
        panel.appendChild(addBtn);
        panel.appendChild(DashBoard);
        
        function renderList() {
            chrome.storage.local.get(['missions'], function(result) {
                const missions = result.missions || [];
                const val = search.value.toLowerCase();
                list.innerHTML = '';
                let foundCurrent = false;
                missions.filter(m => !val || m.note.toLowerCase().includes(val) || m.url.toLowerCase().includes(val)).forEach(mission => {
                    if (mission.url === window.location.href) foundCurrent = true;
                    const li = document.createElement('li');
                    Object.assign(li.style, { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '7px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '2px' });
                    const note = document.createElement('div');
                    note.textContent = mission.note;
                    Object.assign(note.style, { color: '#fff', fontSize: '15px', fontWeight: '500' });
                    const url = document.createElement('div');
                    url.textContent = mission.url;
                    Object.assign(url.style, { color: '#8bc34a', fontSize: '12px', wordBreak: 'break-all' });
                    li.appendChild(note);
                    li.appendChild(url);
                    li.onclick = () => { window.location.href = mission.url; };
                    li.style.cursor = 'pointer';
                    li.title = 'Go to this page';
                    list.appendChild(li);
                });
                addBtn.style.display = foundCurrent ? 'none' : 'block';
            });
        }
        search.oninput = renderList;
        renderList();
        const backdrop = document.createElement('div');
        backdrop.id = 'mindful-search-backdrop';
        Object.assign(backdrop.style, { position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '9999', backdropFilter: 'blur(5px)' });
        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
        backdrop.onclick = closeBtn.onclick;
         
        document.addEventListener('keydown', function escHandler(e) { if (e.key === 'Escape') { closeBtn.onclick(); document.removeEventListener('keydown', escHandler); } });
         
        setTimeout(() => search.focus(), 50);
    }
});
// FontInjector
function injectGoogleFont() {
    if (!document.getElementById('mindful-google-font')) {
        const link = document.createElement('link');
        link.id = 'mindful-google-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap';
        document.head.appendChild(link);
    }
}