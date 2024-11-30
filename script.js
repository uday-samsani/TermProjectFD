const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const queryParams = "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

const cryptoListEl = document.getElementById('crypto-data');
const comparisonContainerEl = document.getElementById('comparison-container');

let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

// Fetch data from CoinGecko API
async function fetchCryptoData() {
    try {
        const response = await fetch(`${API_URL}${queryParams}`);
        const data = await response.json();
        renderCryptoList(data);
    } catch (error) {
        console.error("Error fetching crypto data:", error);
    }
}

// Render cryptocurrency list
function renderCryptoList(data) {
    cryptoListEl.innerHTML = '';
    data.forEach(crypto => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${crypto.name} (${crypto.symbol.toUpperCase()})</span>
            <span>$${crypto.current_price.toFixed(2)}</span>
            <button onclick="addToComparison('${crypto.id}')">Compare</button>
        `;
        cryptoListEl.appendChild(li);
    });
}

// Add a cryptocurrency to comparison
function addToComparison(cryptoId) {
    if (selectedCryptos.length >= 5) {
        alert('You can compare up to 5 cryptocurrencies.');
        return;
    }
    if (!selectedCryptos.includes(cryptoId)) {
        selectedCryptos.push(cryptoId);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparison();
    }
}

// Update comparison section
function updateComparison() {
    comparisonContainerEl.innerHTML = '';
    selectedCryptos.forEach(async (cryptoId) => {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}`);
            const data = await response.json();
            const div = document.createElement('div');
            div.classList.add('comparison-card');
            div.innerHTML = `
                <h3>${data.name} (${data.symbol.toUpperCase()})</h3>
                <p>Price: $${data.market_data.current_price.usd.toFixed(2)}</p>
                <p>24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>
                <p>Market Cap: $${(data.market_data.market_cap.usd / 1e9).toFixed(2)}B</p>
                <button onclick="removeFromComparison('${cryptoId}')">Remove</button>
            `;
            comparisonContainerEl.appendChild(div);
        } catch (error) {
            console.error("Error fetching comparison data:", error);
        }
    });
}

// Remove a cryptocurrency from comparison
function removeFromComparison(cryptoId) {
    selectedCryptos = selectedCryptos.filter(id => id !== cryptoId);
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
    updateComparison();
}

// Initialize app
fetchCryptoData();
updateComparison();
setInterval(fetchCryptoData, 60000); // Refresh data every minute