const { NodeSSH } = require("node-ssh")
const ssh = new NodeSSH()
const config = require("./config")

async function addIPToWhitelist(ip) {
  try {
    await ssh.connect({
      host: config.ROUTER_IP,
      username: config.ROUTER_USER,
      password: config.ROUTER_PASSWORD
    })

    console.log(`✅ Connecté au routeur`)

    // 🔥 COMMANDE FIREWALL (OpenWRT)
    const command = `
      uci add firewall rule
      uci set firewall.@rule[-1].name='WHITELIST_${ip}'
      uci set firewall.@rule[-1].src='lan'
      uci set firewall.@rule[-1].src_ip='${ip}'
      uci set firewall.@rule[-1].target='ACCEPT'
      uci commit firewall
      /etc/init.d/firewall restart
    `

    await ssh.execCommand(command)

    console.log(`✅ IP ${ip} ajoutée à la whitelist`)
    ssh.dispose()
    return true

  } catch (err) {
    console.error("❌ Erreur :", err.message)
    return false
  }
}

module.exports = { addIPToWhitelist }
