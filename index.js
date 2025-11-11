// ---------------------- IMPORT MODULE ----------------------
const express = require('express')
const path = require('path')
const crypto = require('crypto')
const mysql = require('mysql2')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

// ---------------------- MIDDLEWARE ----------------------
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// ---------------------- KONFIGURASI DATABASE ----------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

// Tes koneksi ke database
db.connect((err) => {
  if (err) {
    console.error('❌ Gagal terhubung ke database:', err)
  } else {
    console.log('✅ Terhubung ke database MySQL')
  }
})

// ---------------------- ENDPOINT TEST ----------------------
app.get('/test', (req, res) => {
  res.send('Server API Key berjalan normal 🚀')
})

// ---------------------- ENDPOINT BUAT API KEY ----------------------
app.post('/create', (req, res) => {
  // Generate API key acak
  const apiKey = `sk-sm-v1-${crypto.randomBytes(16).toString('hex')}`

  // Simpan ke database
  const query = 'INSERT INTO api_keys (`key`) VALUES (?)'
  db.query(query, [apiKey], (err, result) => {
    if (err) {
      console.error('❌ Gagal menyimpan API key:', err)
      return res.status(500).json({ success: false, message: 'Gagal menyimpan API key.' })
    }

    console.log('🔑 API Key baru disimpan:', apiKey)
    res.status(201).json({ success: true, apiKey, createdAt: new Date().toISOString() })
  })
})

// ---------------------- ENDPOINT CEK API KEY ----------------------
app.post('/cekapi', (req, res) => {
  const { key } = req.body

  if (!key) {
    return res.status(400).json({ success: false, valid: false, message: 'API key tidak boleh kosong.' })
  }

  const query = 'SELECT * FROM api_keys WHERE `key` = ?'
  db.query(query, [key], (err, results) => {
    if (err) {
      console.error('❌ Gagal mengecek API key:', err)
      return res.status(500).json({ success: false, valid: false, message: 'Terjadi kesalahan server.' })
    }

    if (results.length > 0) {
      res.json({ success: true, valid: true, message: 'API key valid ✅' })
    } else {
      res.json({ success: true, valid: false, message: 'API key tidak valid ❌' })
    }
  })
})

// ---------------------- HALAMAN UTAMA ----------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// ---------------------- JALANKAN SERVER ----------------------
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`)
})
