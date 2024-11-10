const btcPriceElement = document.getElementById("btcPrice");
const updateTimeElement = document.getElementById("updateTime");
const priceHistoryTableBody = document.getElementById("priceHistoryTable").querySelector("tbody");
let lastPrice = null;
let priceHistory = [];  // Lista para armazenar os últimos 10 registros

async function fetchBTCPrice() {
    try {
        const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,brl";
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro na resposta da API');

        const data = await response.json();
        const btcUSD = data.bitcoin.usd;
        const btcBRL = data.bitcoin.brl;

        btcPriceElement.textContent = `USD $${btcUSD.toLocaleString('en-US')} / BRL R$${btcBRL.toLocaleString('pt-BR')}`;

        // Atualiza o horário da última atualização
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        updateTimeElement.textContent = `Última atualização: ${formattedTime}`;

        // Adiciona o novo registro ao histórico
        addPriceToHistory(formattedTime, btcUSD, btcBRL);

        // Verifica se há mudança significativa para enviar notificação
        if (lastPrice && Math.abs(btcUSD - lastPrice) > 500) {
            sendNotification(btcUSD);
        }

        lastPrice = btcUSD;
    } catch (error) {
        btcPriceElement.textContent = "Erro ao carregar";
        console.error("Erro ao buscar o preço do BTC:", error);
    }
}

function addPriceToHistory(time, usdPrice, brlPrice) {
    // Adiciona o novo preço ao histórico e mantém apenas os 10 registros mais recentes
    priceHistory.unshift({ time, usdPrice, brlPrice });
    if (priceHistory.length > 10) {
        priceHistory.pop();
    }

    // Atualiza a tabela de histórico
    updateHistoryTable();
}

function updateHistoryTable() {
    // Limpa a tabela antes de atualizar
    priceHistoryTableBody.innerHTML = '';

    // Adiciona cada registro do histórico à tabela
    priceHistory.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.time}</td>
            <td>USD $${record.usdPrice.toLocaleString('en-US')}</td>
            <td>BRL R$${record.brlPrice.toLocaleString('pt-BR')}</td>
        `;
        priceHistoryTableBody.appendChild(row);
    });
}

function requestNotificationPermission() {
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permissão de notificação concedida.");
            }
        });
    }
}

function sendNotification(btcUSD) {
    if (Notification.permission === "granted") {
        new Notification("Bitcoin Atualizado!", {
            body: `Novo preço do BTC: $${btcUSD.toLocaleString('en-US')}`,
            icon: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
        });
    }
}

requestNotificationPermission();
setInterval(fetchBTCPrice, 3600000); // Atualiza a cada 1 hora (3600000 ms)

fetchBTCPrice();
