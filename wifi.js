const { Client } = require('ssh2')

function addIpToWhitelist(ip) {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn.on('ready', () => {
      conn.exec(`iptables -I INPUT -s ${ip} -j ACCEPT`, (err, stream) => {
        if (err) reject(err)
        stream.on('close', () => {
          conn.end()
          resolve()
        })
      })
    }).connect({
      host: '192.168.1.1',
      port: 22,
      username: 'root',
      password: 'ROUTER_PASSWORD'
    })
  })
}

module.exports = { addIpToWhitelist }
