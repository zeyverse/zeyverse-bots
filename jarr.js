require("./setting.js");
require("./lib/function.js");

//Module 
const { NewMessage } = require("telegram/events");
const fetch = require("node-fetch"); 
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const os = require("os");
const speed = require("performance-now");

//Setting Blacklist Jpm
const blFile = path.join(__dirname, "data/bljpm.json");
if (!fs.existsSync(blFile)) {
  fs.writeFileSync(blFile, JSON.stringify([], null, 2));
}
global.blacklistGroups = JSON.parse(fs.readFileSync(blFile, "utf8"));
function saveBlacklist() {
  fs.writeFileSync(blFile, JSON.stringify(global.blacklistGroups, null, 2));
}

//Settings Jeda Jpm
const dataJpm = path.join(__dirname, "data/jeda.json");
function loadJeda() {
  if (!fs.existsSync(dataJpm)) {
    fs.writeFileSync(dataJpm, JSON.stringify({ jpm: 2000 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dataJpm));
}

function saveJeda(newData) {
  fs.writeFileSync(dataJpm, JSON.stringify(newData, null, 2));
}
let jeda = loadJeda();

//Setting Owner & Premium User 
const ownerFile = "./data/owner.json"
const premFile  = "./data/premium.json"

const loadJSON = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : []
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const isOwner = (id) => {
  id = id.toString()
  const owners = [
    ...loadJSON(ownerFile).map(String),
    ...(Array.isArray(global.owner) ? global.owner.map(String) : global.owner ? [String(global.owner)] : [])
  ]
  return owners.includes(id)
}

const isPrem = (id) => loadJSON(premFile).map(String).includes(id.toString())

//Start 
module.exports = (client) => {
  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!message || !message.message) return;
    message.userId = message.senderId?.toString(); 
    const text = message.message.trim();

//Tampilan Menu In Telegram 
if (text === ".menu") {
  const textMenu = `Halo Kak 👋
Nice to meet you, I am ${global.namaBot}, I was created and developed by ${global.namaOwn} 🕷️

  —Bot Informasi 
    ▢ Bot name : ${global.namaBot}
    ▢ Developer : ${global.namaOwn}
    ▢ Version   : ${global.versi}
    ▢ Status Anda : ${isOwner(message.senderId) ? "Owner" : isPrem(message.senderId) ? "Premium User" : "Free User"}

  —Other Menu
    ▢ .ping
    ▢ .tqto
    ▢ .cekid
    ▢ .tourl
   
  —Store Menu
    ▢ .done
    ▢ .jpm
    ▢ .addbl
    ▢ .delbl
    ▢ .listbl
    ▢ .setjeda
    
  —Owner Menu 
    ▢ .addown
    ▢ .delow
    ▢ .listown
    ▢ .addprem
    ▢ .delprem 
    ▢ .listprem 
    
  —Cpanel Menu 
    ▢ .1gb - unli
    ▢ .listpanel
    ▢ .delpanel 
    ▢ .cadmin
    ▢ .listadmin 
    ▢ .deladmin`;

await client.sendMessage(message.chatId, {
    message: textMenu,
    file: global.menu,
    parse_mode: "Markdown"
  });
}

//Other Menu
if (text === ".cekid") {
  const me = await client.getMe();
  const info = `—About You 🌙

• ID Telegram : \`${me.id}\`
• Username    : ${me.username || "-"}
• Nama        : ${me.firstName || ""} ${me.lastName || ""}`;

  await client.sendMessage(message.chatId, {
    message: info,
    parseMode: "markdown"
  });
}

if (text === ".ping" || text === ".uptime") {
  let timestamp = speed();
  let latensi = speed() - timestamp;
  let totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  let totalCpu = os.cpus().length;

  let respon = `— Informasi Server VPS 🖥️
- Platform : ${os.type()}
- Total RAM : ${totalRam} GB
- Total CPU : ${totalCpu} Core
- Runtime VPS : ${runtime(os.uptime())}

— Informasi Bot 🌐
- Respon Speed : ${latensi.toFixed(4)} detik
- Runtime Bot : ${runtime(process.uptime())}`;
  await client.sendMessage(message.chatId, {
    message: respon,
    parseMode: "markdown"
  });
}

if (text === ".tourl") {
  if (!message.isReply) {
    return await client.sendMessage(message.chatId, {
      message: "Balas media (foto/video) dengan command .tourl"
    });
  }

  const replyMsg = await message.getReplyMessage();
  if (!replyMsg.media) {
    return await client.sendMessage(message.chatId, {
      message: "Pesan yang dibalas tidak mengandung media!"
    });
  }

  try {
    const fs = require("fs");
    const path = require("path");
    const { ImageUploadService } = require("node-upload-images");
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tmpFile = path.join(tmpDir, `temp_${Date.now()}`);
    await client.downloadMedia(replyMsg, { outputFile: tmpFile });
    const buffer = fs.readFileSync(tmpFile);
    const service = new ImageUploadService("pixhost.to");
    const filename = replyMsg.file ? replyMsg.file.name || "jarr.png" : "jarr.png";
    const { directLink } = await service.uploadFromBinary(buffer, filename);
    await client.sendMessage(message.chatId, {
      message: `Success! ✅\nURL: ${directLink}`
    });
    fs.unlinkSync(tmpFile);

  } catch (err) {
    console.error("Tourl Error:", err);
    await client.sendMessage(message.chatId, {
      message: "❌ Terjadi kesalahan saat mengubah media menjadi URL."
    });
  }
}

//Store Menu
if (text.startsWith(".done")) {
if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
const arg = text.replace(".done", "").trim();
if (!arg) {
    return await client.sendMessage(message.chatId, {
      message: "Cara Penggunaan:\n.done textnya"
    });
  }
await client.sendMessage(message.chatId, { message: `Transaksi Berhasil ✅

▢ Tanggal Trx : ${new Date().toLocaleString()}
▢ Barang : ${arg}
▢ Status : Selesai

⚠️ All Transaksi No Reffund!!

Jangan Lupa Gabung 🍂
 • ${global.chtele}
 
 • ${global.chwa}
 
© ${global.namaOwn} 2025`
  });
}

if (text === ".addbl") {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!message.isGroup) 
    return await client.sendMessage(message.chatId, { message: mess.grup });
  const chatIdToAdd = message.chatId.toString();
  if (!global.blacklistGroups.includes(chatIdToAdd)) {
    global.blacklistGroups.push(chatIdToAdd);
    saveBlacklist();
  }
  await client.sendMessage(message.chatId, { message: `Grup Di Blacklist ✅` });
}

if (text === ".delbl") {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!message.isGroup) 
    return await client.sendMessage(message.chatId, { message: mess.grup });
  const chatIdToDel = message.chatId.toString();
  global.blacklistGroups = global.blacklistGroups.filter(id => id !== chatIdToDel);
  saveBlacklist();
  await client.sendMessage(message.chatId, { message: `Grup Unblacklist ✅` });
}

if (text === ".listbl") {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (global.blacklistGroups.length === 0) {
    return await client.sendMessage(message.chatId, { message: "Tidak ada grup di blacklist" });
  }
  let list = global.blacklistGroups.map((id, i) => `${i + 1}. ${id}`).join("\n");
  return await client.sendMessage(message.chatId, { 
    message: "Daftar Grup di Blacklist 🔒\n" + list
  });
}

if (text.startsWith(".jpm")) {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!message.isReply) {
    return await client.sendMessage(message.chatId, { 
      message: "Cara Penggunaan :\n.jpm dengan reply pesannya (support teks & media)"
    });
  }

  const replyMsg = await message.getReplyMessage();
  let teks = replyMsg.message || ""; // ambil teks dari reply

  const dialogs = await client.getDialogs();
  const allGroups = dialogs.filter(d => d.isGroup);
  const groups = allGroups.filter(d => !global.blacklistGroups.includes(d.id.toString()));

  const totalSemua = allGroups.length;
  const totalBlacklist = allGroups.length - groups.length;
  const totalBroadcast = groups.length;

  const jeda = (global.jedaJpm && !isNaN(global.jedaJpm)) ? global.jedaJpm : 2000;

  await client.sendMessage(message.chatId, { 
    message: `Memproses Broadcast 🚀
    
 • Total Grup : ${totalSemua}
 • Grup Di Blacklist : ${totalBlacklist}
 • Dikirim ke : ${totalBroadcast}
 • Jeda Pengiriman : ${jeda / 1000} detik`
  });

  let sukses = 0;
  let gagal = 0;

  for (const dialog of groups) {
    try {
      // forward pesan (bisa teks atau media)
      await client.forwardMessages(dialog.id, { messages: [replyMsg] });

      // kalau ada teks tambahan, kirim juga
      if (teks && teks !== replyMsg.message) {
        await client.sendMessage(dialog.id, { message: teks });
      }
      sukses++;
    } catch {
      gagal++;
    }
    await new Promise(r => setTimeout(r, jeda)); // jeda antar kirim
  }

  await client.sendMessage(message.chatId, { 
    message: `Broadcast selesai ✅
    
 • Pesan Terkirim : ${sukses}
 • Pesan Gagal Terkirim : ${gagal}`
  });
}

if (text.startsWith(".setjeda")) {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  const arg = text.replace(".setjeda", "").trim();
  if (!arg) {
    return await client.sendMessage(message.chatId, { 
      message: `Cara Penggunaan : 
.setjeda 3
      
Contoh Jeda :
 • 1 = 1 detik
 • 2 = 2 detik
 • 3 = 3 detik
 • 4 = 4 detik
Dan seterusnya`
    });
  }

  const detik = parseInt(arg);
  if (isNaN(detik) || detik < 1) {
    return await client.sendMessage(message.chatId, { 
      message: "⚠️ Masukkan angka detik yang valid!\n\nContoh: .setjeda 3"
    });
  }

  const lama = jeda.jpm / 1000; // nilai sebelumnya (detik)
  jeda.jpm = detik * 1000;      // simpan dalam ms
  saveJeda(jeda);

  await client.sendMessage(message.chatId, { 
    message: `⏱️ Jeda broadcast berhasil diubah!\n\n • Dari: ${lama} detik\n • Menjadi: ${detik} detik`
  });
}

if (text === ".payment") {
  const pay = `— Payment ${global.namaOwn} 🕷️
  
 ▢ Dana : ${global.dana}
 ▢ Go-Pay : ${global.gopay}
 ▢ Ovo   : ${global.ovo}
 
⚠️ Sertakan Bukti Transaksi`;
  await client.sendMessage(message.chatId, {
    message: pay,
    file: global.qris
  });
}

//Owner Menu
if (text.startsWith(".addown")) {
  const args = text.split(" ");
  const target = args[1];
  let owners = loadJSON(ownerFile);
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!target) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.addown id_user" });
  if (owners.includes(target)) return client.sendMessage(message.chatId, { message: "⚠️ Sudah ada di Owner" });
  owners.push(target);
  saveJSON(ownerFile, owners);
  client.sendMessage(message.chatId, { message: `✅ Berhasil menambahkan ${target} ke Owner` });
}

if (text.startsWith(".delown")) {
  const args = text.split(" ");
  const target = args[1];
  let owners = loadJSON(ownerFile);
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!target) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.delown id_user" });
  if (!owners.includes(target)) return client.sendMessage(message.chatId, { message: "⚠️ Tidak ada di Owner" });
  owners = owners.filter(x => x !== target);
  saveJSON(ownerFile, owners);
  client.sendMessage(message.chatId, { message: `✅ ${target} dihapus dari Owner` });
}

if (text === ".listown") {
  let owners = loadJSON(ownerFile);
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!owners.length) return client.sendMessage(message.chatId, { message: "Daftar Owner kosong" });
  client.sendMessage(message.chatId, { message: `—List All Owner:\n\n${owners.map((x,i)=>`${i+1}. ${x}`).join("\n")}` });
}

if (text.startsWith(".addprem")) {
  const args = text.split(" ");
  const target = args[1];
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!target) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.addprem id_user" });
  let premium = loadJSON(premFile);
  if (premium.includes(target)) return client.sendMessage(message.chatId, { message: "⚠️ User sudah Premium" });
  premium.push(target);
  saveJSON(premFile, premium);
  client.sendMessage(message.chatId, { message: `✅ ${target} berhasil ditambahkan ke Premium` });
}

if (text.startsWith(".delprem")) {
  const args = text.split(" ");
  const target = args[1];
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!target) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.delprem id_user" });
  let premium = loadJSON(premFile);
  if (!premium.includes(target)) return client.sendMessage(message.chatId, { message: "⚠️ User bukan Premium" });
  premium = premium.filter(x => x !== target);
  saveJSON(premFile, premium);
  client.sendMessage(message.chatId, { message: `✅ ${target} dihapus dari Premium` });
}

if (text === ".listprem") {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  let premium = loadJSON(premFile);
  if (!premium.length) return client.sendMessage(message.chatId, { message: "Daftar Premium kosong" });
  client.sendMessage(message.chatId, { message: `—List All User Premium:\n\n${premium.map((x,i)=>`${i+1}. ${x}`).join("\n")}` });
}

//Panel Menu
const paketList = ["1gb","2gb","3gb","4gb","5gb","6gb","7gb","8gb","9gb","10gb","unlimited","unli"];

if (paketList.some(cmd => text.startsWith(`.${cmd}`))) {
  const command = text.split(" ")[0].slice(1);
  const argText = text.slice(command.length + 2);
  if (!isOwner(message.userId) && !isPrem(message.userId)) {
    return await client.sendMessage(message.chatId, { message: mess.ress });
  }

  // ambil input
  let telegramId = null;
  let usernameInput;

  if (!argText) {
    return await client.sendMessage(message.chatId, {
      message: `Cara Penggunaan :\n.${command} nama|id\nAtau :\n.${command} nama`
    });
  }

  if (argText.includes("|")) {
    const [u, id] = argText.split("|");
    usernameInput = u.trim();
    telegramId = id.trim();
  } else {
    usernameInput = argText.trim();
  }

  // === SET RAM, CPU, DISK ===
  let ram, disknya, cpu;
  switch(command) {
    case "1gb": ram="1000"; disknya="1000"; cpu="40"; break;
    case "2gb": ram="2000"; disknya="1000"; cpu="60"; break;
    case "3gb": ram="3000"; disknya="2000"; cpu="80"; break;
    case "4gb": ram="4000"; disknya="2000"; cpu="100"; break;
    case "5gb": ram="5000"; disknya="3000"; cpu="120"; break;
    case "6gb": ram="6000"; disknya="3000"; cpu="140"; break;
    case "7gb": ram="7000"; disknya="4000"; cpu="160"; break;
    case "8gb": ram="8000"; disknya="4000"; cpu="180"; break;
    case "9gb": ram="9000"; disknya="5000"; cpu="200"; break;
    case "10gb": ram="10000"; disknya="5000"; cpu="220"; break;
    case "unlimited": case "unli": ram="0"; disknya="0"; cpu="0"; break;
    default: ram="0"; disknya="0"; cpu="0";
  }

  let username = usernameInput.toLowerCase();
  let email = `${username}@jarr.com`;
  let name = capital(username) + " Server";
  let password = username + "01";

  await client.sendMessage(message.chatId, { message: `⏳ Membuat server. . .` });

  try {
    // 1. Buat user
    let f = await fetch(global.domain + "/api/application/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey
      },
      body: JSON.stringify({
        email, username,
        first_name: name, last_name: "Server",
        language: "en", password
      })
    });
    let data = await f.json();
    if (data.errors) {
      return await client.sendMessage(message.chatId, { message: `⚠️ Error:\n${JSON.stringify(data.errors[0], null, 2)}` });
    }
    let user = data.attributes;
    let usr_id = user.id;

    // 2. Ambil startup
    let f1 = await fetch(global.domain + `/api/application/nests/${nestid}/eggs/${egg}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey
      }
    });
    let data2 = await f1.json();
    let startup_cmd = data2.attributes.startup;

    // 3. Buat server
    let f2 = await fetch(global.domain + "/api/application/servers", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey,
      },
      body: JSON.stringify({
        name, description: tanggal(Date.now()), user: usr_id, egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup: startup_cmd,
        environment: {
          INST: "npm", USER_UPLOAD: "0",
          AUTO_UPDATE: "0", CMD_RUN: "npm start"
        },
        limits: {
          memory: ram, swap: 0, disk: disknya, io: 500, cpu
        },
        feature_limits: { databases: 5, backups: 5, allocations: 5 },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      })
    });
    let result = await f2.json();
    if (result.errors) {
      return await client.sendMessage(message.chatId, { message: `⚠️ Error:\n${JSON.stringify(result.errors[0], null, 2)}` });
    }
    let server = result.attributes;

    // hasil teks
    let teks = `— Yours Panel 📦
- Nama Server : ${name}
- Username : ${user.username}
- Password : ${password}
- Login : ${global.domain}

— Informasi Panel ⚙️
- ID Server : ${server.id}
- Ram : ${ram == "0" ? "unlimited" : (ram / 1000) + "GB"}
- Cpu : ${cpu == "0" ? "unlimited" : cpu + "%"}
- Disk : ${disknya == "0" ? "unlimited" : (disknya / 1000) + "GB"}

⚠️ Jaga baik-baik`;

    // kirim hasil
    if (telegramId) {
      await client.sendMessage(telegramId, { message: teks });
      await client.sendMessage(message.chatId, { message: `Server berhasil dibuat dan dikirim ke ID ${telegramId}` });
    } else {
      await client.sendMessage(message.chatId, { message: teks });
    }

  } catch (e) {
    console.error(e);
    await client.sendMessage(message.chatId, { message: "⚠️ Terjadi error saat membuat server" });
  }
}

if (text === ".listpanel" || text === ".listp" || text === ".listserver") {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });
  if (!global.apikey) return client.sendMessage(message.chatId, { message: "Apikey Tidak Ditemukan!" });

  let page = 1;
  let allServers = [];
  while (true) {
    let res = await fetch(`${global.domain}/api/application/servers?page=${page}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${global.apikey}`,
      },
    });
    let data = await res.json();
    if (!data.data || data.data.length === 0) break;

    allServers.push(...data.data);
    if (!data.meta?.pagination || page >= data.meta.pagination.total_pages) break;
    page++;
  }

  if (!allServers.length) return client.sendMessage(message.chatId, { message: "Tidak ada server panel." });

  let teks = `List All Server Panel 🖥️\n> #Total: ${allServers.length} Server\n\n`;
  let no = 1;

  for (let srv of allServers) {
    let s = srv.attributes;
    let uuid = s.uuid.split("-")[0];
    let status = "unknown";
    try {
      let res = await fetch(`${global.domain}/api/client/servers/${uuid}/resources`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${global.capikey}`,
        },
      });
      let json = await res.json();
      status = json.attributes?.current_state?.toUpperCase() || "unknown";
    } catch { status = "unknown"; }

    teks += `#${no++}\n`;
    teks += `  • ID Server : ${s.id}\n`;
    teks += `  • Nama : ${s.name}\n`;
    teks += `  • RAM : ${s.limits.memory == 0 ? "Unlimited" : (s.limits.memory / 1000) + "GB"}\n`;
    teks += `  • Status : ${status}\n\n`;
  }

  await client.sendMessage(message.chatId, { message: teks });
}

if (text.startsWith(".delpanel") || text.startsWith(".delp")) {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });

  const args = text.split(" ");
  const idServer = args[1];
  if (!idServer) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.delpanel id_server\n.listpanel untuk melihat ID" });
  if (!global.apikey) return client.sendMessage(message.chatId, { message: "Apikey Tidak Ditemukan!" });

  let f = await fetch(global.domain + "/api/application/servers?page=1", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + global.apikey,
    },
  });
  let result = await f.json();
  let servers = result.data;
  let deletedUserId = null;
  let deletedServerName = null;

  for (let server of servers) {
    let s = server.attributes;
    if (idServer == s.id.toString()) {
      deletedUserId = s.user;
      deletedServerName = s.name;
      await fetch(global.domain + `/api/application/servers/${s.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + global.apikey,
        },
      });
      break;
    }
  }

  if (!deletedUserId) return client.sendMessage(message.chatId, { message: "ID Server Tidak Ditemukan" });

  await fetch(global.domain + `/api/application/users/${deletedUserId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + global.apikey,
    },
  });

  client.sendMessage(message.chatId, { message: `✅ Berhasil Menghapus Akun Panel ${deletedServerName} (Server & User)` });
}

if (text.startsWith(".cadmin") || text.startsWith(".cadp")) {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });

  const args = text.split(" ");
  const username = args[1];
  if (!username) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.cadmin username" });
  const email = `${username}@jarrr.com`;
  const name = username.charAt(0).toUpperCase() + username.slice(1);
  const password = username + "001";

  try {
    let f = await fetch(global.domain + "/api/application/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey,
      },
      body: JSON.stringify({
        email,
        username,
        first_name: name,
        last_name: "Admin",
        root_admin: true,
        language: "en",
        password,
      }),
    });

    let data = await f.json();
    if (data.errors) return client.sendMessage(message.chatId, { message: JSON.stringify(data.errors[0], null, 2) });

    let user = data.attributes;
    let teks = `— Yours Admin Panel 📦

ID User : ${user.id}
Username : ${user.username}
Password : ${password}
Login : ${global.domain}

— Rules Admin Panel ⚠️
Jangan Maling Script
Simpan Baik² Data Akun Ini
Buat Panel Seperlunya Aja, Jangan Asal Buat!
No rusuh`;

    client.sendMessage(message.chatId, { message: "✅ Admin panel berhasil dibuat." });
    client.sendMessage(message.chatId, { message: teks });
  } catch { client.sendMessage(message.chatId, { message: "⚠️ Error saat membuat admin panel" }); }
}

if (text.startsWith(".deladmin") || text.startsWith(".deladp")) {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });

  const args = text.split(" ");
  const idAdmin = args[1];
  if (!idAdmin) return client.sendMessage(message.chatId, { message: "Cara Penggunaan :\n.deladmin id_user\n.listadmin untuk lihat daftar" });

  try {
    let cek = await fetch(global.domain + "/api/application/users?page=1", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey,
      },
    });

    let res2 = await cek.json();
    let users = res2.data;
    let target = users.find((u) => u.attributes.id.toString() === idAdmin && u.attributes.root_admin === true);
    if (!target) return client.sendMessage(message.chatId, { message: "⚠️ ID Admin tidak ditemukan!" });

    await fetch(global.domain + `/api/application/users/${idAdmin}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey,
      },
    });

    client.sendMessage(message.chatId, { message: `Berhasil menghapus Admin Panel ${target.attributes.username} ✅` });
  } catch { client.sendMessage(message.chatId, { message: "⚠️ Error saat menghapus admin panel" }); }
}

if (text === ".listadmin" || text === ".listadp") {
  if (!isOwner(message.userId)) return client.sendMessage(message.chatId, { message: mess.own });

  try {
    let cek = await fetch(global.domain + "/api/application/users?page=1", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.apikey,
      },
    });
    let res2 = await cek.json();
    let users = res2.data;
    let adminList = users.filter((i) => i.attributes.root_admin === true);
    if (!adminList.length) return client.sendMessage(message.chatId, { message: "Tidak ada admin panel." });

    let teks = "List All Admin Panel 💻\n\n";
    for (let i of adminList) {
      teks += `◦ ID User : ${i.attributes.id}\n`;
      teks += `◦ Nama : ${i.attributes.first_name}\n\n`;
    }

    client.sendMessage(message.chatId, { message: teks });
  } catch { client.sendMessage(message.chatId, { message: "⚠️ Error saat ambil list admin" }); }
}

//Deteksi Command Di Panel 
if (text.startsWith(".")) {
  let pengirim = message.senderId; // default ID

  if (message.sender) {
    if (message.sender.username) {
      pengirim = `@${message.sender.username}`;
    } else if (message.sender.firstName) {
      pengirim = message.sender.firstName;
    }
  }

  console.log(
    chalk.bgCyan.bold("—Pesan Terdeteksi 💻\n"),
    chalk.white.bold(` • Pengirim     : ${pengirim}\n`),
    chalk.white.bold(` • Command    : ${text}\n\n`)
  );
}

  }, new NewMessage({}));
};