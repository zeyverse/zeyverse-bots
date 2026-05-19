require("./setting.js");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

//Buat Sesions Baru
const sesions = path.join(__dirname, "session", "user.session");
let sessionString = "";
if (fs.existsSync(sesions)) {
  sessionString = fs.readFileSync(sesions, "utf8");
  console.log(chalk.green.bold("[✓] Sukses Login Menggunakan Sessions Sebelumnya"));
} else {
  console.log(chalk.red.bold("[!] Sessions Belum Tercatat, Mulai Dari Awal"));
}

//Proses Connect 
const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

(async () => {
await client.start({
  phoneNumber: async () => {
    console.clear();
    console.log(chalk.green.bold("Input Number Telegram (628) :"));
    return (await question("Answer: ")).trim();
  },
  phoneCode: async () => {
    let code = "";
    while (!code) {
      console.log(chalk.green.bold("Input OTP From Telegram :"));
      code = await question("Answer: ");
      if (!code) console.log(chalk.red.bold("OTP tidak boleh kosong!"));
    }
    return code.trim();
  },
  password: async () => {
    console.log(chalk.green.bold("Input 2FA (Enter jika tidak ada):"));
    const pwd = await question("Answer: ");
    if (pwd) {
      console.log(chalk.green.bold("2FA password provided"));
      return pwd;
    } else {
      console.log(chalk.red.bold("No 2FA password"));
      return undefined;
    }
  },
  onError: (err) => {
    if (err.message.includes("PASSWORD_HASH_INVALID")) {
      console.log(chalk.red.bold("Password 2FA salah! Silakan coba lagi."));
    } else {
      console.log(chalk.red("Error:"), err);
    }
  },
});
  rl.close();
  
  //Laporan Bila Berhasil Terkoneksi 
  console.clear();
  console.log(
  chalk.green.bold("User Bot Has Been Active ✅"),
  chalk.hex("#ff69b4")(`
    ⠐⣪⡑⣤⣶⣶⣶⣦⡔⣩⡒⠀
    ⢸⣯⣾⣿⢏⣿⣏⢿⣿⣮⣿⠀
    ⢸⣿⢸⡗⣶⠙⢱⡖⣿⢸⣿⠀
    ⢸⡿⠀⠳⣄⣐⣂⡴⠃⠸⣿⠀
    ⣾⠃⠀⡵⡔⠕⠕⡰⡅⠀⢻⡆
    ⢹⡆⠘⢴⠙⠑⠉⢳⡱⠀⣾⠁
    ⠊⠀⠀⠈⡖⡖⡖⡎⠀⠀⠈⠂
    ⠀⠀⠀⠀⠉⠁⠉⠁⠀⠀⠀⠀\n`),
  chalk.blue.bold("Bot Informasi 🤖"),
  chalk.white.bold(`
  • botname   : ${global.namaBot}
  • developer  : ${global.namaOwn}
  • versi       : ${global.versi}\n\n`),
);

  //Simpan Session
  try {
    const session = client.session.save();
    fs.mkdirSync(path.dirname(sesions), { recursive: true });
    fs.writeFileSync(sesions, session, "utf8");
    console.log(chalk.green.bold(`[✓] Session berhasil disimpan ke: ${sesions}\n\n`));
  } catch (e) {
    console.log(chalk.red.bold("[×] Gagal menyimpan session:"), e);
  }

  // import fitur/menu
  require("./jarr.js")(client);
})();