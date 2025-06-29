const API = (typeof browser !== "undefined") ? browser :
            (typeof chrome !== "undefined") ? chrome :
            {};
API.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg?.type) return;
  switch (msg.type) {

    case "SAVE_MISSION":
      let url = msg.url;
      if (!url && sender.tab && sender.tab.url) url = sender.tab.url;
      if (!url) {
        sendResponse({ success: false, reason: "No URL provided" });
        return true;
      }
      const newMission = {
        url,
        note: msg.note,
        timestamp: msg.timestamp || new Date().toISOString(),
        xpos: typeof msg.xpos === 'number' ? msg.xpos : 100,
        ypos: typeof msg.ypos === 'number' ? msg.ypos : 100
      };
      const remind = remainderCheck(newMission.note);
      if (remind) {
        newMission.alarm = true;
        const { type, delay, recurring } = remind;
        newMission.alarmConfig = remind;
        const alarmId = `mission-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
        newMission.alarmId = alarmId;
        const alarmOptions = {
          delayInMinutes: delay / 60000
        };
        if (recurring) {
          alarmOptions.periodInMinutes = delay / 60000;
        }
        API.alarms.create(alarmId, alarmOptions);
        API.notifications.create({
          type: 'basic',
          iconUrl: 'icon128.png',
          title: '⏰ Reminder Set',
          message: `Reminder set for ${type} in ${Math.floor(delay / 60000)} minutes.`,
          priority: 1
        });
      }
      API.storage.local.get(["missions"], (res) => {
        let missions = res.missions || [];
        missions = missions.filter(m => m.url !== url);
        missions.push(newMission);
        API.storage.local.set({ missions }, () => {
          sendResponse({ success: true });
        });
      });
      return true;

    case "DELETE_MISSION":
      API.storage.local.get(["missions"], (res) => {
        const missions = res.missions || [];
        const toDelete = missions.find(m => m.url === msg.url);
        const updated = missions.filter(m => m.url !== msg.url);
        if (toDelete?.alarmId) {
          API.alarms.clear(toDelete.alarmId);
        }
        API.storage.local.set({ missions: updated }, () => {
          sendResponse({ success: true });
        });
        
      });
      return true;

    case "UPDATE_MISSION":
      API.storage.local.get(["missions"], (res) => {
        let missions = res.missions || [];
        missions = missions.map(m => {
          if (m.url === msg.url) {
            return {
              ...m,
              note: msg.note,
              xpos: msg.xpos,
              ypos: msg.ypos
            };
          }
          return m;
        });
        API.storage.local.set({ missions }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    case "OPEN_DASHBOARD":
      API.tabs.create({ url: API.runtime.getURL("Dashboard.html") });
      return true;
    case "GET_MISSIONS":
    default:
      console.warn("Unknown message type:", msg.type);
      break;
  }
});
//Helper function 
const remainderCheck = (str) => {
  str = str.toLowerCase();
  const offsetMatch = str.match(/@(\d+)(min|h|hrs)/);
  if (offsetMatch) {
    const [, num, unit] = offsetMatch;
    const multiplier = unit === 'min' ? 60000 : 3600000; // ms
    return {
      type: 'offset',
      delay: parseInt(num) * multiplier,
      recurring: false
    };
  }
  const timeMatch = str.match(/@(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const [_, hour, minute] = timeMatch.map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1); 

    return {
      type: 'time',
      delay: target.getTime() - now.getTime(),
      recurring: false
    };
  }
  if (str.includes('@tomorrow')) {
    const now = new Date();
    const target = new Date(now);
    target.setDate(now.getDate() + 1);
    target.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
    return {
      type: 'tomorrow',
      delay: target.getTime() - now.getTime(),
      recurring: false
    };
  }
  if (str.includes('@daily')) {
    return {
      type: 'daily',
      delay: 24 * 60 * 60 * 1000,
      recurring: true
    };
  }
  if (str.includes('@')) {
    API.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Mindful Reminder Format',
      message: "Use @tomorrow, @daily or @5min / @1h to set a reminder.",
      priority: 2
    });
  }
  return false;
};
//Listener
API.alarms.onAlarm.addListener((alarm) => {
  console.log('⏰ Alarm triggered:', alarm.name);
  API.storage.local.get(['missions'], (res) => {
    const mission = (res.missions || []).find(m => m.alarmId === alarm.name);
    if (!mission) return;
    API.tabs.create({ url: mission.url });
    API.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Mindful Reminder',
      message: `⏰ Time to revisit:\n${mission.note}`,
      priority: 2
    });
  });
});
