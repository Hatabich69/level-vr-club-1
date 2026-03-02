require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg'); // Підключаємо базу даних

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ===== 1. Налаштування підключення до PostgreSQL =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Обов'язково для Render
  }
});

// Перевірка підключення при запуску
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Помилка підключення до БД:', err.message);
  }
  console.log('✅ Успішно підключено до PostgreSQL');
  
  // Створюємо таблицю, якщо її немає
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      phone VARCHAR(50),
      booking_date VARCHAR(20),
      booking_time VARCHAR(20),
      total_price NUMERIC,
      cart_details JSONB,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  client.query(createTableQuery, (err, res) => {
    release();
    if (err) console.error('❌ Помилка створення таблиці:', err.stack);
    else console.log('✅ Таблиця "bookings" готова');
  });
});

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'FrondEnd'))); // Перевірте назву папки!

// ===== Функція відправки в Telegram =====
async function sendTelegram(message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return console.error("❌ Немає токена Telegram");

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body = { chat_id: chatId, text: message, parse_mode: 'HTML' };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log('✅ Telegram повідомлення надіслано');
  } catch (err) {
    console.error('❌ Помилка Telegram:', err);
  }
}

// ===== API Бронювання =====
app.post('/api/book', async (req, res) => {
  try {
    const { cart, totalPrice, date, time, name, phone, comment } = req.body;

    if (!cart || cart.length === 0) return res.status(400).json({ message: 'Кошик порожній' });

    // 2. ЗБЕРЕЖЕННЯ В БАЗУ ДАНИХ
    const insertQuery = `
      INSERT INTO bookings (name, phone, booking_date, booking_time, total_price, cart_details, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [name, phone, date, time, totalPrice, JSON.stringify(cart), comment];
    
    const dbResult = await pool.query(insertQuery, values);
    const newId = dbResult.rows[0].id;
    console.log(`💾 Замовлення #${newId} збережено в базу`);

    // 3. Відправка в Telegram
    const tgMsg = `
📢 <b>Нове бронювання #${newId}</b>
👤 <b>${name}</b> (${phone})
📅 ${date} о ${time}
💰 <b>${totalPrice} грн</b>
🎮 ${cart.map(c => `${c.device} (${c.duration} год)`).join(', ')}
💬 ${comment || ''}
    `.trim();

    await sendTelegram(tgMsg);
    io.emit('newBooking', { id: newId, ...req.body });

    res.json({ success: true, message: `Бронювання #${newId} успішне!` });

  } catch (err) {
    console.error('❌ Помилка сервера:', err);
    res.status(500).json({ success: false, message: 'Помилка збереження' });
  }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});

