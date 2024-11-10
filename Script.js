const btcPriceElement = document.getElementById("btcPrice");
const updateTimeElement = document.getElementById("updateTime");
let lastPrice = null;

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
        const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        updateTimeElement.textContent = `Última atualização: ${formattedTime}`;

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
setInterval(fetchBTCPrice, 30000);
fetchBTCPrice();
