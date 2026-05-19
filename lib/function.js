global.getRuntime = function (startTime) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours} Jam ${minutes} Menit ${seconds} Detik`;
}

global.generatePassword = function (length) {
    const characters = "0123456789JARROFC";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

global.generateUsername = function (length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let username = "";
    for (let i = 0; i < length; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return username;
}

global.capital = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

global.tanggal = function (ms) {
  return new Date(ms).toLocaleString("id-ID");
}

global.runtime = function (seconds) {
  seconds = Number(seconds);
  let d = Math.floor(seconds / (3600 * 24));
  let h = Math.floor((seconds % (3600 * 24)) / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = Math.floor(seconds % 60);

  let dDisplay = d > 0 ? d + " hari " : "";
  let hDisplay = h > 0 ? h + " jam " : "";
  let mDisplay = m > 0 ? m + " menit " : "";
  let sDisplay = s > 0 ? s + " detik" : "";

  return dDisplay + hDisplay + mDisplay + sDisplay;
};