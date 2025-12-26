const {
  default: makeWASocket,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys')

const Pino = require('pino')
const readline = require('readline')
const { addIpToWhitelist } = require('./wifi') // optionnel

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')

  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  /* 🔑 GÉNÉRATION DU CODE PAR NUMÉRO (UNE SEULE FOIS) */
  if (!state.creds.registered) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(
      '📱 Entre ton numéro WhatsApp (ex: 226XXXXXXXX) : ',
      async (number) => {
        try {
          const code = await sock.requestPairingCode(number)
          console.log('\n✅ CODE DE LIAISON WHATSAPP :', code)
          console.log('➡ WhatsApp > Appareils connectés > Associer avec un numéro\n')
          rl.close()
        } catch (err) {
          console.error('❌ Erreur pairing:', err)
          rl.close()
        }
      }
    )
  }

  /* 🤖 BOT ACTIF APRÈS CONNEXION */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const jid = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (!text) return

    // Test connexion
    if (text === '!ping') {
      await sock.sendMessage(jid, { text: '✅ Bot WhatsApp connecté' })
    }

    // Exemple : ajout IP whitelist WiFi
    if (text.startsWith('!addip')) {
      const ip = text.split(' ')[1]

      if (!ip) {
        await sock.sendMessage(jid, {
          text: '❌ Utilisation : !addip 192.168.1.50'
        })
        return
      }

      try {
        await addIpToWhitelist(ip)
        await sock.sendMessage(jid, {
          text: `✅ IP ${ip} ajoutée à la whitelist WiFi`
        })
      } catch (err) {
        await sock.sendMessage(jid, {
          text: `❌ Erreur WiFi : ${err.message}`
        })
      }
    }
  })
}

startBot()
