const PREFIX = "192.168.100";
let ipList = []; // tu peux remplacer par DB ou fichier

function isValidSuffix(suffix) {
  const n = Number(suffix);
  return Number.isInteger(n) && n >= 1 && n <= 254;
}

function addIP(suffix) {
  if (!isValidSuffix(suffix)) {
    return "❌ Suffixe invalide (1 à 254)";
  }

  const ip = `${PREFIX}.${suffix}`;

  if (ipList.includes(ip)) {
    return `⚠️ L'IP ${ip} existe déjà`;
  }

  ipList.push(ip);
  return `✅ IP ajoutée : ${ip}`;
}

function removeIP(suffix) {
  if (!isValidSuffix(suffix)) {
    return "❌ Suffixe invalide (1 à 254)";
  }

  const ip = `${PREFIX}.${suffix}`;

  const index = ipList.indexOf(ip);
  if (index === -1) {
    return `⚠️ L'IP ${ip} n'existe pas`;
  }

  ipList.splice(index, 1);
  return `🗑️ IP supprimée : ${ip}`;
}

function showIPs() {
  if (ipList.length === 0) {
    return "📭 Aucune IP enregistrée";
  }

  return "📋 IP enregistrées :\n" + ipList.join("\n");
}

async function handleIPCommand(message) {
  const parts = message.trim().split(" ");

  if (parts.length < 2 || parts[0] !== "!ip") {
    return null;
  }

  const action = parts[1];
  const suffix = parts[2];

  switch (action) {
    case "add":
      return addIP(suffix);

    case "remove":
      return removeIP(suffix);

    case "show":
      return showIPs();

    default:
      return "❓ Commande inconnue\nExemple : !ip add 25";
  }
}

module.exports = { handleIPCommand };
