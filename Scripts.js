const btcPriceElement = document.getElementById("btcPrice");
let lastPrice = null;

async function fetchBTCPrice() {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,brl");
        const data = await response.json();
        const btcUSD = data.bitcoin.usd;
        const btcBRL = data.bitcoin.brl;

        // Exibe o preço na página
        btcPriceElement.textContent = `USD $${btcUSD.toLocaleString('en-US')} / BRL R$${btcBRL.toLocaleString('pt-BR')}`;

        // Verifica se há mudança significativa para enviar notificação
        if (lastPrice && Math.abs(btcUSD - lastPrice) > 500) {
            sendNotification(btcUSD);
        }
        
        lastPrice = btcUSD;  // Atualiza o último preço
    } catch (error) {
        btcPriceElement.textContent = "Erro ao carregar";
        console.error("Erro ao buscar o preço do BTC:", error);
    }
}

// Solicita permissão para notificações
function requestNotificationPermission() {
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permissão de notificação concedida.");
            }
        });
    }
}

// Envia a notificação
function sendNotification(btcUSD) {
    if (Notification.permission === "granted") {
        new Notification("Bitcoin Atualizado!", {
            body: `Novo preço do BTC: $${btcUSD.toLocaleString('en-US')}`,
            icon: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
        });
    }
}

// Chama a função de permissão ao carregar a página
requestNotificationPermission();

// Atualiza o preço a cada 30 segundos
setInterval(fetchBTCPrice, 30000);
fetchBTCPrice();
