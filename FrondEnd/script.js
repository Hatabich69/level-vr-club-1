let cart = [];
let totalPrice = 0;
let isSubmitting = false;

// === Відкрити модальне вікно ===
function openModal() {
  if (cart.length === 0) {
    alert("Корзина порожня. Додайте товари перед бронюванням!");
    return;
  }
  const modal = document.getElementById("dateTimeModal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // блокуємо скрол
  }
}

// === Закрити модальне вікно ===
function closeModal() {
  const modal = document.getElementById("dateTimeModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = ""; // повертаємо скрол
  }
}

// === Клік поза модальним вікном ===
window.addEventListener("click", (e) => {
  const modal = document.getElementById("dateTimeModal");
  if (e.target === modal) {
    closeModal();
  }
});

// === Відправка бронювання на сервер ===
async function submitOrder() {
  if (isSubmitting) return;

  const date = document.getElementById("date")?.value;
  const time = document.getElementById("time")?.value;
  const name = document.getElementById("name")?.value || "";
  const phone = document.getElementById("phone")?.value || "";
  const comment = document.getElementById("comment")?.value || "";

  if (!date || !time) {
    alert("Будь ласка, оберіть дату та час!");
    return;
  }

  if (cart.length === 0) {
    alert("Корзина порожня!");
    return;
  }

  isSubmitting = true;

  try {
    // Тут імітація або реальний запит
    // const response = await fetch("/api/book", ...);
    
    // Імітація успіху для тесту:
    await new Promise(r => setTimeout(r, 1000));
    
    alert("✅ Бронювання успішно надіслано!");

    // Очищаємо після успішного замовлення
    clearCart(); 
    closeModal();
  } catch (error) {
    console.error("❌ Помилка:", error);
    alert(`Не вдалося надіслати бронювання: ${error.message}`);
  } finally {
    isSubmitting = false;
  }
}

// === Скролл та Меню ===
document.addEventListener("DOMContentLoaded", () => {
  // Меню (бургер)
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("active");
        menuToggle.classList.remove("active");
      });
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove("active");
        menuToggle.classList.remove("active");
      }
    });
  }
});

// === Функція оновлення відображення ціни ===
function updateCartDisplay() {
  const priceElement = document.getElementById("total-price");
  if(priceElement) {
      priceElement.innerText = totalPrice;
  }
}

// === Додавання в кошик ===
function addToCart(device, duration, persons, price) {
  cart.push({ device, duration, persons, price });
  totalPrice += price;
  updateCartDisplay();
  alert(`${device} додано! Сума: ${totalPrice} грн.`);
}

// === Логіка карток (ціни, кнопки) ===
document.querySelectorAll(".card-v2").forEach(card => {
  const priceSpan = card.querySelector(".price-display span");
  if (!priceSpan) return; // перевірка, щоб не було помилок

  const baseOne = +priceSpan.dataset.one || 0;
  const baseTwo = +priceSpan.dataset.two || baseOne; // якщо ціни для 2 немає, беремо як для 1

  let hours = 1;
  let players = 1;

  // Оновлення ціни на картці
  function updateCardPrice() {
    const currentPrice = players === 1 ? baseOne * hours : baseTwo * hours;
    priceSpan.innerText = currentPrice;
  }

  // Клік по годинах
  card.querySelectorAll(".btn-hour").forEach(btn => {
    btn.onclick = () => {
      card.querySelectorAll(".btn-hour").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      // Якщо в кнопці span, беремо textContent, інакше innerText
      hours = parseInt(btn.textContent.trim());
      updateCardPrice();
    };
  });

  // Клік по гравцях
  card.querySelectorAll(".player-option").forEach((btn, idx) => {
    btn.onclick = () => {
      card.querySelectorAll(".player-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      players = idx === 0 ? 1 : 2;
      updateCardPrice();
    };
  });

  // Кнопка "Додати"
  const addBtn = card.querySelector(".btn-add");
  if(addBtn) {
      addBtn.onclick = () => {
        const device = card.querySelector("h3")?.innerText || "Послуга";
        const price = players === 1 ? baseOne * hours : baseTwo * hours;
        addToCart(device, hours, players, price);
      };
  }
});

// === ОЧИСТИТИ КОШИК (Виправлено) ===
function clearCart() {
  cart = [];
  totalPrice = 0;
  updateCartDisplay();
  alert("Кошик очищено!");
}



// === Відкрити/Закрити бічну панель кошика ===
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');

    if (sidebar.classList.contains('open')) {
        renderCart();
    }
}

const emptyCartMessages = [
  "Якось тут порожньо...",
  "Сюди б додати щось...",
  "Все ще нічого...",
  "Забагато вільного простору...",
  "Ні на що не натякаю, але..."
];

function getRandomEmptyMessage() {
    const i = Math.floor(Math.random() * emptyCartMessages.length);
    return emptyCartMessages[i];
}

// === Оновлення відображення кошика (HTML) ===
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const countEl = document.getElementById('cart-count');
    const bookingTotal = document.getElementById('total-price'); // Ціна в старій секції (якщо ще є)

    container.innerHTML = '';
    
    if (cart.length === 0) {
        const message = getRandomEmptyMessage();
        container.innerHTML = `<p class="empty-msg">${message}</p>`;
        countEl.innerText = '0';
        totalEl.innerText = '0 грн';
        return;
    }

    // Генеруємо HTML для кожного товару
    cart.forEach((item, index) => {
        const itemHTML = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.device}</h4>
                    <p>${item.duration} год. / ${item.persons} ос.</p>
                </div>
                <div style="text-align: right;">
                    <div style="color: #00F0FF; font-weight: bold;">${item.price} грн</div>
                    <div class="cart-item-remove" onclick="removeFromCart(${index})">Видалити</div>
                </div>
            </div>
        `;
        container.innerHTML += itemHTML;
    });

    // Оновлюємо загальну суму та лічильник
    totalEl.innerText = totalPrice + ' грн';
    countEl.innerText = cart.length;
    
    // Оновлюємо ціну в модальному вікні бронювання (щоб там теж була правильна сума)
    if(bookingTotal) bookingTotal.innerText = totalPrice; 
}

// === Додавання товару (Оновлена функція) ===
function addToCart(device, duration, persons, price) {
    cart.push({ device, duration, persons, price });
    totalPrice += price;
    
    renderCart(); // Оновлюємо вигляд
    toggleCart(); // Відкриваємо кошик, щоб показати доданий товар (опціонально)
}

// === Видалення товару ===
function removeFromCart(index) {
    totalPrice -= cart[index].price;
    cart.splice(index, 1); // Видаляємо елемент з масиву
    renderCart();
}

// === Повна очистка ===
function clearCart() {
    cart = [];
    totalPrice = 0;
    renderCart();
}

// ---------------------------------------------------------
// Нижче залишається ваш код для модального вікна бронювання
// ---------------------------------------------------------

// ... (тут ваші функції openModal, closeModal, submitOrder) ...
// ... (не забудьте, що кнопка "Оформити" в кошику викликає openModal()) ...

// === Логіка кнопок на картках (не змінена) ===
document.querySelectorAll(".card-v2").forEach(card => {
    // ... ваш код для card logic (hours, players) ...
    const priceSpan = card.querySelector(".price-display span");
    if (!priceSpan) return;

    const baseOne = +priceSpan.dataset.one || 0;
    const baseTwo = +priceSpan.dataset.two || baseOne;

    let hours = 1;
    let players = 1;

    function updateCardPrice() {
        const currentPrice = players === 1 ? baseOne * hours : baseTwo * hours;
        priceSpan.innerText = currentPrice;
    }

    card.querySelectorAll(".btn-hour").forEach(btn => {
        btn.onclick = () => {
            card.querySelectorAll(".btn-hour").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            hours = parseInt(btn.textContent.trim());
            updateCardPrice();
        };
    });

    card.querySelectorAll(".player-option").forEach((btn, idx) => {
        btn.onclick = () => {
            card.querySelectorAll(".player-option").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            players = idx === 0 ? 1 : 2;
            updateCardPrice();
        };
    });

    const addBtn = card.querySelector(".btn-add");
    if(addBtn) {
        addBtn.onclick = () => {
            const device = card.querySelector("h3")?.innerText || "Послуга";
            const price = players === 1 ? baseOne * hours : baseTwo * hours;
            addToCart(device, hours, players, price);
        };
    }
});

// === Відправка бронювання в TELEGRAM ===
async function submitOrder() {
  if (isSubmitting) return;

  // --- НАЛАШТУВАННЯ TELEGRAM (ВСТАВТЕ СВОЇ ДАНІ ТУТ) ---
  const BOT_TOKEN = "8587619718:AAHrl2P2dPZGr2ufA3d2SFaiFGXQCPLzBkg"; // Наприклад: "603123456:AAHg..."
  const CHAT_ID = "-1003266849385";               // Наприклад: "123456789"
  // -----------------------------------------------------

  const date = document.getElementById("date")?.value;
  const time = document.getElementById("time")?.value;
  const name = document.getElementById("name")?.value || "Не вказано";
  const phone = document.getElementById("phone")?.value || "Не вказано";
  const comment = document.getElementById("comment")?.value || "Немає";

  if (!date || !time) {
    alert("Будь ласка, оберіть дату та час!");
    return;
  }

  if (cart.length === 0) {
    alert("Корзина порожня!");
    return;
  }

  isSubmitting = true;
  const submitBtn = document.querySelector(".cyber-btn.confirm");
  if(submitBtn) submitBtn.innerText = "ВІДПРАВКА...";

  // 1. Формуємо красивий текст повідомлення
  let message = `<b>👾 НОВЕ ЗАМОВЛЕННЯ!</b>\n\n`;
  message += `👤 <b>Ім'я:</b> ${name}\n`;
  message += `📞 <b>Телефон:</b> ${phone}\n`;
  message += `📅 <b>Дата:</b> ${date}\n`;
  message += `⏰ <b>Час:</b> ${time}\n\n`;
  message += `🛒 <b>ЗАМОВЛЕННЯ:</b>\n`;

  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.device} (${item.duration} год, ${item.persons} чол) - ${item.price} грн\n`;
  });

  message += `\n💰 <b>ЗАГАЛОМ: ${totalPrice} грн</b>`;
  
  if (comment !== "Немає") {
      message += `\n\n💬 <b>Коментар:</b> ${comment}`;
  }

  try {
    // 2. Відправляємо запит на сервери Telegram
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML" // Дозволяє робити жирний шрифт
      })
    });

    const data = await response.json();

    if (data.ok) {
      alert("✅ Бронювання успішно надіслано! Менеджер зв'яжеться з вами.");
      clearCart(); // Очищаємо кошик
      closeModal(); // Закриваємо вікно
    } else {
      throw new Error(data.description);
    }

  } catch (error) {
    console.error("❌ Помилка Telegram:", error);
    alert(`Помилка відправки: ${error.message}. Перевірте токен або напишіть /start боту.`);
  } finally {
    isSubmitting = false;
    if(submitBtn) submitBtn.innerText = "ПІДТВЕРДИТИ";
  }
}

function openModal() {
  if (cart.length === 0) {
    alert("Корзина порожня...");
    return;
  }
  const modal = document.getElementById("dateTimeModal");
  // Знаходимо блок з частинками
  const particles = document.getElementById("particles-js");

  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; 
    
    // --- ДОДАЙТЕ ЦЕЙ РЯДОК ---
    // Ховаємо частинки, щоб розвантажити процесор
    if(particles) particles.style.display = "none"; 
  }
}

function closeModal() {
  const modal = document.getElementById("dateTimeModal");
  const particles = document.getElementById("particles-js"); // Знаходимо частинки

  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = ""; 
    
    // --- ДОДАЙТЕ ЦЕЙ РЯДОК ---
    // Повертаємо частинки назад
    if(particles) particles.style.display = "block"; 
  }
}


