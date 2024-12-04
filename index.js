const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// استبدل 'YOUR_BOT_TOKEN' بالتوكن الخاص بالبوت
const API_TOKEN = '8175525283:AAEE1Klqi0ucNvVMAMgy65YxYmOD5Szd-sk';
const bot = new TelegramBot(API_TOKEN, { polling: true });

// مجموعة من الـ user agents للاختيار منها عشوائيًا
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL Build/QQ1A.200205.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; Nexus 4 Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"
];

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // إرسال رسالة ترحيبية مع زر زيادة المتابعين
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "زيادة متابعين",
                        callback_data: 'increase_followers'
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'مرحبًا بك! اختر خيارًا:', options);
});

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;

    if (callbackQuery.data === 'increase_followers') {
        bot.answerCallbackQuery(callbackQuery.id);
        bot.sendMessage(chatId, "• أدخل اسم المستخدم الخاص بك:");

        // إعداد الحالة لتلقي اسم المستخدم
        bot.once('message', (msg) => processUsername(msg, chatId));
    }
});

function processUsername(message, chatId) {
    const username = message.text;
    bot.sendMessage(chatId, "• أدخل رابط المنشور الخاص بك:");

    // إعداد الحالة لتلقي رابط المنشور
    bot.once('message', (msg) => processLink(msg, chatId, username));
}

function processLink(message, chatId, username) {
    const link = message.text;

    // إنشاء بريد إلكتروني عشوائي
    const randomEmail = `${Math.floor(Math.random() * 900000) + 100000}@gmail.com`;

    // اختيار user_agent عشوائي
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    // إرسال الطلب إلى API
    axios.post('https://api.likesjet.com/freeboost/7', {
        instagram_username: username,
        link: link,
        email: randomEmail
    }, {
        headers: {
            'User-Agent': randomUserAgent
        }
    })
    .then(response => {
        const responseMessage = response.data.message || 'لم يتم العثور على رسالة.';
        bot.sendMessage(chatId, responseMessage);

        // حذف المعلومات بعد الطلب
        clearUserData(chatId);
    })
    .catch(error => {
        bot.sendMessage(chatId, 'حدث خطأ أثناء معالجة طلبك.');
    });
}

// دالة لإعادة تعيين المعلومات بعد الطلب
function clearUserData(chatId) {
    bot.sendMessage(chatId, "تم إرسال الطلب بنجاح. يمكنك البدء من جديد إذا أردت.");
    // يمكنك هنا إضافة أي عملية أخرى تريد تنفيذها بعد مسح المعلومات
}