const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

// ===================== CONFIG ROUTEUR =====================
const ROUTER_IP = "192.168.1.1";
const ROUTER_USER = "admin";
const SSH_KEY_PATH = "/root/.ssh/id_rsa"; // chemin clé SSH

// Numéros WhatsApp autorisés
const AUTHORIZED_NUMBERS = [
  "226XXXXXXXX@s.whatsapp.net" // ton numéro
];

// ===================== OUTILS =====================
function isValidIP(ip) {
  const regex =
    /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return regex.test(ip);
}

async function runRouterCommand(command) {
  try {
    await ssh.connect({
      host: ROUTER_IP,
      username: ROUTER_USER,
      privateKey: SSH_KEY_PATH,
      readyTimeout: 5000
    });

    const result = await ssh.execCommand(command);
    ssh.dispose();

    if (result.stderr) {
      return `❌ Erreur routeur : ${result.stderr}`;
    }

    return "✅ Commande exécutée avec succès";
  } catch (err) {
    return `❌ Connexion échouée : ${err.message}`;
  }
}

// ===================== ACTIONS ROUTEUR =====================
async function whitelistIP(ip) {
  return await runRouterCommand(`iptables -I INPUT -s ${ip} -j ACCEPT`);
}

async function blacklistIP(ip) {
  return await runRouterCommand(`iptables -I INPUT -s ${ip} -j DROP`);
}

async function unblockIP(ip) {
  return await runRouterCommand(`iptables -D INPUT -s ${ip} -j DROP`);
}

// ===================== HANDLER BOT =====================
async function handleRouterCommand(sender, message) {
  if (!AUTHORIZED_NUMBERS.includes(sender)) {
    return "⛔ Accès refusé";
  }

  const parts = message.trim().split(" ");

  if (parts.length !== 2) {
    return "⚠️ Format invalide\nExemple : !blacklist 192.168.1.10";
  }

  const command = parts[0];
  const ip = parts[1];

  if (!isValidIP(ip)) {
    return "❌ Adresse IP invalide";
  }

  switch (command) {
    case "!whitelist":
      return await whitelistIP(ip);

    case "!blacklist":
      return await blacklistIP(ip);

    case "!unblock":
      return await unblockIP(ip);

    default:
      return "❓ Commande inconnue";
  }
}

module.exports = { handleRouterCommand };
