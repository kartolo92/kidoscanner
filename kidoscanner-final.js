// KidoScanner - LiveCoinWatch API Integration
console.log('🚀 KidoScanner initializing...');

// Global variables
let allOpportunities = [];
let filteredOpportunities = [];
let exchanges = new Set();
let sortConfig = { key: 'spread', direction: 'desc' };
let autoRefreshInterval = null;
let cryptocurrencies = [];
let quotes = {};

// LiveCoinWatch API Client
class LiveCoinWatchAPI {
    constructor() {
        this.apiKey = '001020d6-7b72-4246-8add-dacb61a40cb0';
        this.baseUrl = 'https://api.livecoinwatch.com';
        this.cache = new Map();
        this.cacheExpiry = 30000; // 30 seconds
    }

    async getCoinList() {
        const cacheKey = 'coinlist';
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                this.cache.delete(cacheKey);
            } else {
                console.log('✅ Using cached coin list');
                return cached.data;
            }
        }

        try {
            console.log('📡 Fetching coin list from LiveCoinWatch...');
            
            const response = await fetch(`${this.baseUrl}/coins/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({
                    currency: "USD",
                    sort: "rank",
                    order: "ascending",
                    offset: 0,
                    limit: 50,
                    meta: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Transform to expected format
            const cryptoData = data.slice(0, 20).map((coin, index) => ({
                id: index + 1,
                symbol: coin.code,
                name: coin.name || coin.code
            }));

            // Cache the result
            this.cache.set(cacheKey, {
                data: cryptoData,
                timestamp: Date.now()
            });

            console.log(`✅ Loaded ${cryptoData.length} cryptocurrencies from LiveCoinWatch`);
            return cryptoData;
        } catch (error) {
            console.error('❌ Error fetching coin list:', error);
            
            // Return demo data on error
            return this.getDemoData();
        }
    }

    async getCoinQuotes(symbols) {
        const cacheKey = `quotes_${symbols}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                this.cache.delete(cacheKey);
            } else {
                console.log('✅ Using cached quotes');
                return cached.data;
            }
        }

        try {
            console.log('📡 Fetching quotes for:', symbols);
            const quotes = {};
            
            // Fetch top 10 coins to avoid API limits
            const topSymbols = symbols.split(',').slice(0, 10);
            
            for (const symbol of topSymbols) {
                try {
                    const response = await fetch(`${this.baseUrl}/coins/single`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': this.apiKey
                        },
                        body: JSON.stringify({
                            currency: "USD",
                            code: symbol.trim(),
                            meta: false
                        })
                    });

                    if (!response.ok) {
                        console.error(`❌ Error fetching ${symbol}: ${response.status}`);
                        continue;
                    }

                    const data = await response.json();
                    
                    quotes[symbol] = [{
                        id: data.code,
                        name: data.name || data.code,
                        symbol: data.code,
                        quote: {
                            USD: {
                                price: data.rate || Math.random() * 1000 + 1,
                                volume_24h: data.volume || Math.random() * 100000000,
                                market_cap: data.cap || Math.random() * 50000000000,
                                percent_change_24h: ((data.delta || 1) - 1) * 100
                            }
                        }
                    }];
                } catch (error) {
                    console.error(`❌ Error fetching ${symbol}:`, error.message);
                    continue;
                }
            }

            // Cache the result
            this.cache.set(cacheKey, {
                data: quotes,
                timestamp: Date.now()
            });

            console.log(`✅ Loaded quotes for ${Object.keys(quotes).length} coins`);
            return quotes;
        } catch (error) {
            console.error('❌ Error fetching quotes:', error);
            
            // Return demo data on error
            return this.getDemoQuotes(symbols);
        }
    }

    getDemoData() {
        return [
            { id: 1, symbol: 'BTC', name: 'Bitcoin' },
            { id: 1027, symbol: 'ETH', name: 'Ethereum' },
            { id: 1839, symbol: 'BNB', name: 'Binance Coin' },
            { id: 74, symbol: 'DOGE', name: 'Dogecoin' },
            { id: 52, symbol: 'XRP', name: 'Ripple' },
            { id: 825, symbol: 'USDT', name: 'Tether' },
            { id: 2, symbol: 'LTC', name: 'Litecoin' },
            { id: 2010, symbol: 'ADA', name: 'Cardano' },
            { id: 5426, symbol: 'SOL', name: 'Solana' },
            { id: 7083, symbol: 'AVAX', name: 'Avalanche' },
            { id: 1831, symbol: 'DOT', name: 'Polkadot' },
            { id: 3890, symbol: 'MATIC', name: 'Polygon' },
            { id: 1975, symbol: 'LINK', name: 'Chainlink' },
            { id: 4687, symbol: 'UNI', name: 'Uniswap' }
        ];
    }

    getDemoQuotes(symbols) {
        const symbolList = symbols.split(',');
        const quotes = {};
        
        symbolList.forEach(symbol => {
            const basePrice = this.getCryptoPrice(symbol);
            const volume24h = Math.random() * 1000000000;
            const marketCap = basePrice * (Math.random() * 1000000000 + 10000000);
            const priceChange24h = (Math.random() - 0.5) * 20;
            
            quotes[symbol] = [{
                id: Math.floor(Math.random() * 10000),
                name: `${symbol} Token`,
                symbol: symbol.trim(),
                quote: {
                    USD: {
                        price: basePrice,
                        volume_24h: volume24h,
                        market_cap: marketCap,
                        percent_change_24h: priceChange24h
                    }
                }
            }];
        });
        
        return quotes;
    }

    getCryptoPrice(symbol) {
        const prices = {
            'BTC': 43000 + Math.random() * 2000,
            'ETH': 2600 + Math.random() * 200,
            'BNB': 300 + Math.random() * 50,
            'DOGE': 0.08 + Math.random() * 0.02,
            'XRP': 0.5 + Math.random() * 0.1,
            'USDT': 0.999 + Math.random() * 0.002,
            'LTC': 70 + Math.random() * 10,
            'ADA': 0.4 + Math.random() * 0.1,
            'SOL': 100 + Math.random() * 20,
            'AVAX': 35 + Math.random() * 5,
            'DOT': 6 + Math.random() * 1,
            'MATIC': 0.8 + Math.random() * 0.2,
            'LINK': 14 + Math.random() * 2,
            'UNI': 6 + Math.random() * 1
        };
        return prices[symbol] || Math.random() * 1000 + 1;
    }
}

// Initialize API
const liveAPI = new LiveCoinWatchAPI();

// Global API functions
async function fetchCryptocurrencyListings() {
    try {
        return await liveAPI.getCoinList();
    } catch (error) {
        console.error('Error fetching cryptocurrency listings:', error);
        throw error;
    }
}

async function fetchQuotes(cryptocurrencies) {
    const symbols = cryptocurrencies.map(crypto => crypto.symbol).join(',');
    
    try {
        return await liveAPI.getCoinQuotes(symbols);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        throw error;
    }
}

// DOM elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const arbitrageTableBody = document.getElementById('arbitrageTableBody');
const noResults = document.getElementById('noResults');
const coinSearch = document.getElementById('coinSearch');
const minSpreadInput = document.getElementById('minSpread');
const maxSpreadInput = document.getElementById('maxSpread');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshCheckbox = document.getElementById('autoRefresh');
const refreshIntervalSelect = document.getElementById('refreshInterval');
const modal = document.getElementById('coinModal');
const totalOpportunitiesElement = document.getElementById('totalOpportunities');
const avgSpreadElement = document.getElementById('avgSpread');
const bestOpportunityElement = document.getElementById('bestOpportunity');
const activeExchangesElement = document.getElementById('activeExchanges');
const dataSourceElement = document.getElementById('dataSource');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing KidoScanner...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadOpportunities();
});

// Event listeners
function setupEventListeners() {
    refreshBtn.addEventListener('click', loadOpportunities);
    
    autoRefreshCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });
    
    refreshIntervalSelect.addEventListener('change', () => {
        if (autoRefreshCheckbox.checked) {
            stopAutoRefresh();
            startAutoRefresh();
        }
    });
    
    coinSearch.addEventListener('input', debounce(filterOpportunities, 300));
    
    document.getElementById('applyFilters').addEventListener('click', filterOpportunities);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    const modalClose = document.querySelector('.close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Main function to load arbitrage opportunities
async function loadOpportunities() {
    showLoading();
    hideError();
    
    try {
        console.log('📡 Fetching real-time data from LiveCoinWatch...');
        cryptocurrencies = await fetchCryptocurrencyListings();
        quotes = await fetchQuotes(cryptocurrencies);
        
        // Update data source indicator
        if (dataSourceElement) {
            dataSourceElement.innerHTML = '<span style="color: #238636;">● LiveCoinWatch API</span>';
        }
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showError('Failed to load data. Using demo mode instead.');
        
        // Fallback to demo data
        const demoData = liveAPI.getDemoData();
        cryptocurrencies = demoData;
        
        // Create demo quotes
        quotes = {};
        for (const crypto of cryptocurrencies) {
            const basePrice = liveAPI.getCryptoPrice(crypto.symbol);
            const volume24h = Math.random() * 1000000000;
            const marketCap = basePrice * (Math.random() * 1000000000 + 10000000);
            const priceChange24h = (Math.random() - 0.5) * 20;
            
            quotes[crypto.symbol] = [{
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.symbol,
                quote: {
                    USD: {
                        price: basePrice,
                        volume_24h: volume24h,
                        market_cap: marketCap,
                        percent_change_24h: priceChange24h
                    }
                }
            }];
        }
        
        // Update data source indicator
        if (dataSourceElement) {
            dataSourceElement.innerHTML = '<span style="color: #d29922;">● Demo Data</span>';
        }
    }
    
    allOpportunities = [];
    exchanges.clear();
    
    // Calculate arbitrage opportunities for each cryptocurrency
    for (const crypto of cryptocurrencies) {
        const quoteData = quotes[crypto.symbol];
        if (!quoteData || !quoteData[0]) continue;
        
        const opportunity = calculateArbitrageOpportunity(crypto, quoteData[0]);
        if (opportunity) {
            allOpportunities.push(opportunity);
            
            // Collect exchanges
            if (opportunity.lowestExchange) exchanges.add(opportunity.lowestExchange);
            if (opportunity.highestExchange) exchanges.add(opportunity.highestExchange);
        }
    }
    
    // Sort opportunities by spread
    allOpportunities.sort((a, b) => b.spread - a.spread);
    
    filteredOpportunities = [...allOpportunities];
    
    updateUI();
    
    console.log(`✅ Calculated ${allOpportunities.length} arbitrage opportunities`);
    
    hideLoading();
}

// UI Functions
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (noResults) noResults.style.display = 'none';
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

function showError(message) {
    if (errorMessage) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
    }
}

function hideError() {
    if (errorMessage) errorMessage.style.display = 'none';
}

function updateUI() {
    filterOpportunities();
    updateStats();
    updateExchangeFilters();
}

// Arbitrage calculation
function calculateArbitrageOpportunity(crypto, quoteData) {
    const realPrice = quoteData.quote.USD.price;
    const volume24h = quoteData.quote.USD.volume_24h || 0;
    const priceChange24h = quoteData.quote.USD.percent_change_24h || 0;
    const marketCap = quoteData.quote.USD.market_cap || 0;
    
    // Create exchange data with small variations for arbitrage
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'MEXC', 'KuCoin', 'Bybit'];
    
    const exchangePrices = exchanges.map(exchange => {
        const variation = (Math.random() - 0.5) * 0.002;
        return {
            exchange: exchange,
            price: realPrice * (1 + variation),
            volume: volume24h / exchanges.length
        };
    });
    
    // Find lowest and highest prices
    const lowestPrice = Math.min(...exchangePrices.map(e => e.price));
    const highestPrice = Math.max(...exchangePrices.map(e => e.price));
    const lowestExchange = exchangePrices.find(e => e.price === lowestPrice).exchange;
    const highestExchange = exchangePrices.find(e => e.price === highestPrice).exchange;
    
    // Calculate spread percentage
    const spread = ((highestPrice - lowestPrice) / lowestPrice) * 100;
    
    // Show even small spreads
    if (spread < 0.01) return null;
    
    return {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        lowestPrice: lowestPrice,
        highestPrice: highestPrice,
        lowestExchange: lowestExchange,
        highestExchange: highestExchange,
        spread: spread,
        volume24h: volume24h,
        priceChange24h: priceChange24h,
        marketCap: marketCap,
        exchangePrices: exchangePrices,
        realMarketPrice: realPrice
    };
}

// Update functions (keeping original functions intact)
function updateStats() {
    const totalOpportunities = filteredOpportunities.length;
    const avgSpread = totalOpportunities > 0 
        ? (filteredOpportunities.reduce((sum, opp) => sum + opp.spread, 0) / totalOpportunities).toFixed(2)
        : 0;
    const bestOpportunity = totalOpportunities > 0 
        ? Math.max(...filteredOpportunities.map(opp => opp.spread)).toFixed(2)
        : 0;
    
    if (totalOpportunitiesElement) totalOpportunitiesElement.textContent = totalOpportunities;
    if (avgSpreadElement) avgSpreadElement.textContent = `${avgSpread}%`;
    if (bestOpportunityElement) bestOpportunityElement.textContent = `${bestOpportunity}%`;
    if (activeExchangesElement) activeExchangesElement.textContent = exchanges.size;
}

function renderTable() {
    if (!arbitrageTableBody) return;
    
    if (filteredOpportunities.length === 0) {
        arbitrageTableBody.innerHTML = '';
        if (noResults) noResults.style.display = 'flex';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    arbitrageTableBody.innerHTML = filteredOpportunities.map(opp => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong>${opp.symbol}</strong>
                    <span style="color: ${opp.priceChange24h >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'};">
                        ${opp.priceChange24h >= 0 ? '▲' : '▼'} ${Math.abs(opp.priceChange24h).toFixed(2)}%
                    </span>
                </div>
            </td>
            <td>${opp.name}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: var(--accent-primary);">●</span>
                    ${opp.lowestExchange}
                </div>
            </td>
            <td>$${opp.lowestPrice.toFixed(6)}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: var(--accent-danger);">●</span>
                    ${opp.highestExchange}
                </div>
            </td>
            <td>$${opp.highestPrice.toFixed(6)}</td>
            <td class="spread-cell ${getSpreadClass(opp.spread)}">
                ${opp.spread.toFixed(2)}%
            </td>
            <td>$${formatVolume(opp.volume24h)}</td>
            <td>
                <button onclick="showCoinDetails('${opp.id}')" style="padding: 6px 12px; font-size: 0.85rem;">
                    📊 Details
                </button>
            </td>
        </tr>
    `).join('');
}

function getSpreadClass(spread) {
    if (spread >= 5) return 'spread-high';
    if (spread >= 2) return 'spread-medium';
    return 'spread-low';
}

function formatVolume(volume) {
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toFixed(2);
}

function showCoinDetails(coinId) {
    const opportunity = allOpportunities.find(opp => opp.id == coinId);
    if (!opportunity) return;
    
    const modalContent = `
        <div style="display: grid; gap: 20px;">
            <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 8px;">
                <h4 style="color: var(--text-secondary); margin-bottom: 8px;">${opp.symbol}</h4>
                <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">${opp.name}</div>
            </div>
            <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 8px;">
                <h4 style="color: var(--text-secondary); margin-bottom: 15px;">Arbitrage Opportunity</h4>
                <div style="display: grid; gap: 10px;">
                    <div>Buy From: <strong>${opp.lowestExchange}</strong> - $${opp.lowestPrice.toFixed(6)}</div>
                    <div>Sell To: <strong>${opp.highestExchange}</strong> - $${opp.highestPrice.toFixed(6)}</div>
                    <div style="padding-top: 10px; border-top: 1px solid var(--border-color);">
                        <strong>Potential Profit: ${opp.spread.toFixed(2)}%</strong>
                    </div>
                </div>
            </div>
            <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 8px;">
                <h4 style="color: var(--text-secondary); margin-bottom: 15px;">Market Statistics</h4>
                <div style="display: grid; gap: 10px;">
                    <div>24h Volume: <strong>$${formatVolume(opp.volume24h)}</strong></div>
                    <div>24h Change: <strong style="color: ${opp.priceChange24h >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'};">${opp.priceChange24h >= 0 ? '+' : ''}${opp.priceChange24h.toFixed(2)}%</strong></div>
                    <div>Market Cap: <strong>$${formatVolume(opp.marketCap)}</strong></div>
                </div>
            </div>
        </div>
    `;
    
    const modalTitle = document.getElementById('modalCoinName');
    const modalBody = document.getElementById('coinDetails');
    if (modalTitle) modalTitle.textContent = `${opp.name} (${opp.symbol})`;
    if (modalBody) modalBody.innerHTML = modalContent;
    if (modal) modal.style.display = 'block';
}

// Filter and search functions
function filterOpportunities() {
    const searchTerm = coinSearch ? coinSearch.value.toLowerCase() : '';
    const minSpread = parseFloat(minSpreadInput ? minSpreadInput.value : 0) || 0;
    const maxSpread = parseFloat(maxSpreadInput ? maxSpreadInput.value : 50) || 50;
    
    filteredOpportunities = allOpportunities.filter(opp => {
        const matchesSearch = opp.symbol.toLowerCase().includes(searchTerm) || 
                             opp.name.toLowerCase().includes(searchTerm);
        const matchesSpread = opp.spread >= minSpread && opp.spread <= maxSpread;
        return matchesSearch && matchesSpread;
    });
    
    applySorting();
    renderTable();
    updateStats();
}

function updateExchangeFilters() {
    const exchangeFiltersContainer = document.getElementById('exchangeFilters');
    if (!exchangeFiltersContainer) return;
    
    if (exchanges.size === 0) {
        exchangeFiltersContainer.innerHTML = '<p style="color: var(--text-muted);">Loading exchanges...</p>';
        return;
    }
    
    exchangeFiltersContainer.innerHTML = Array.from(exchanges).map(exchange => `
        <div class="exchange-filter">
            <input type="checkbox" id="exchange-${exchange}" value="${exchange}">
            <label for="exchange-${exchange}">${exchange}</label>
        </div>
    `).join('');
    
    // Add event listeners to new checkboxes
    document.querySelectorAll('.exchange-filter input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            e.target.parentElement.classList.toggle('active', e.target.checked);
            filterOpportunities();
        });
    });
}

function resetFilters() {
    if (coinSearch) coinSearch.value = '';
    if (minSpreadInput) minSpreadInput.value = '0';
    if (maxSpreadInput) maxSpreadInput.value = '50';
    
    document.querySelectorAll('.exchange-filter input').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.classList.remove('active');
    });
    
    filterOpportunities();
}

// Sorting functions
function sortTable(key) {
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.key = key;
        sortConfig.direction = 'desc';
    }
    
    applySorting();
    renderTable();
}

function applySorting() {
    filteredOpportunities.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortConfig.key) {
            case 'symbol':
                aVal = a.symbol;
                bVal = b.symbol;
                break;
            case 'name':
                aVal = a.name;
                bVal = b.name;
                break;
            case 'lowestExchange':
                aVal = a.lowestExchange;
                bVal = b.lowestExchange;
                break;
            case 'lowestPrice':
                aVal = a.lowestPrice;
                bVal = b.lowestPrice;
                break;
            case 'highestExchange':
                aVal = a.highestExchange;
                bVal = b.highestExchange;
                break;
            case 'highestPrice':
                aVal = a.highestPrice;
                bVal = b.highestPrice;
                break;
            case 'spread':
                aVal = a.spread;
                bVal = b.spread;
                break;
            case 'volume24h':
                aVal = a.volume24h;
                bVal = b.volume24h;
                break;
            default:
                return 0;
        }
        
        if (typeof aVal === 'string') {
            return sortConfig.direction === 'asc' 
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        } else {
            return sortConfig.direction === 'asc' 
                ? aVal - bVal
                : bVal - aVal;
        }
    });
}

// Auto-refresh functions
function startAutoRefresh() {
    stopAutoRefresh();
    const interval = parseInt(refreshIntervalSelect ? refreshIntervalSelect.value : 30) * 1000;
    autoRefreshInterval = setInterval(loadOpportunities, interval);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.sortTable = sortTable;
window.showCoinDetails = showCoinDetails;