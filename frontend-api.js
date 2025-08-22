// Frontend API Integration

// Handle user registration
async function handleRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate password match
    if (formData.get('password') !== formData.get('confirmPassword')) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    try {
        const userData = {
            name: formData.get('name'),
            username: formData.get('username'),
            email: formData.get('email'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            mobile: formData.get('mobile'),
            password: formData.get('password')
        };
        
        // Call API to register user
        const response = await window.CredStockAPI.Auth.register(userData);
        
        // Set current user and update UI
        await setCurrentUser(response.user);
        
        showNotification('Registration successful!', 'success');
        
        // Hide auth interface
        document.getElementById('auth-interface').style.display = 'none';
    } catch (error) {
        showNotification(error.message || 'Registration failed', 'error');
    }
}

// Handle user login
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        // Call API to login user
        const response = await window.CredStockAPI.Auth.login(credentials);
        
        // Set current user and update UI
        await setCurrentUser(response.user);
        
        showNotification('Login successful!', 'success');
        
        // Hide auth interface
        document.getElementById('auth-interface').style.display = 'none';
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
}

// Handle user logout
function handleLogout() {
    clearCurrentUser();
    showNotification('Logged out successfully', 'success');
    switchPanel('home');
}

// Load portfolio data
async function loadPortfolioData() {
    try {
        const portfolio = await window.CredStockAPI.Portfolio.getPortfolio();
        
        // Update portfolio UI
        const portfolioContainer = document.querySelector('#portfolio .portfolio-container');
        if (portfolioContainer) {
            if (portfolio.stocks.length === 0) {
                portfolioContainer.innerHTML = '<div class="empty-portfolio">Your portfolio is empty. Start adding stocks!</div>';
                return;
            }
            
            let portfolioHTML = '<div class="portfolio-summary">';
            portfolioHTML += `<div class="summary-item"><span>Total Investment</span><span>$${portfolio.totalInvestment.toFixed(2)}</span></div>`;
            portfolioHTML += '</div>';
            
            portfolioHTML += '<div class="portfolio-stocks">';
            portfolioHTML += '<table class="stock-table">';
            portfolioHTML += '<thead><tr><th>Symbol</th><th>Name</th><th>Quantity</th><th>Purchase Price</th><th>Current Price</th><th>Gain/Loss</th><th>Actions</th></tr></thead>';
            portfolioHTML += '<tbody>';
            
            // Get current stock prices
            const stocks = await window.CredStockAPI.Stock.getAllStocks();
            const stockMap = {};
            stocks.forEach(stock => {
                stockMap[stock.symbol] = stock;
            });
            
            let totalValue = 0;
            
            portfolio.stocks.forEach(stock => {
                const currentStock = stockMap[stock.symbol] || { price: 0, change: 0 };
                const currentValue = stock.quantity * currentStock.price;
                const purchaseValue = stock.quantity * stock.purchasePrice;
                const gainLoss = currentValue - purchaseValue;
                const gainLossPercent = (gainLoss / purchaseValue) * 100;
                
                totalValue += currentValue;
                
                portfolioHTML += '<tr>';
                portfolioHTML += `<td>${stock.symbol}</td>`;
                portfolioHTML += `<td>${stock.name}</td>`;
                portfolioHTML += `<td>${stock.quantity}</td>`;
                portfolioHTML += `<td>$${stock.purchasePrice.toFixed(2)}</td>`;
                portfolioHTML += `<td>$${currentStock.price.toFixed(2)}</td>`;
                portfolioHTML += `<td class="${gainLoss >= 0 ? 'positive' : 'negative'}">${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)} (${gainLossPercent.toFixed(2)}%)</td>`;
                portfolioHTML += `<td><button class="action-btn edit-stock" data-symbol="${stock.symbol}">Edit</button><button class="action-btn remove-stock" data-symbol="${stock.symbol}">Remove</button></td>`;
                portfolioHTML += '</tr>';
            });
            
            portfolioHTML += '</tbody></table></div>';
            
            // Add total portfolio value
            portfolioHTML = portfolioHTML.replace('<div class="portfolio-summary">', `<div class="portfolio-summary"><div class="summary-item"><span>Total Value</span><span>$${totalValue.toFixed(2)}</span></div>`);
            
            portfolioContainer.innerHTML = portfolioHTML;
            
            // Add event listeners for edit and remove buttons
            document.querySelectorAll('.edit-stock').forEach(button => {
                button.addEventListener('click', () => editStock(button.getAttribute('data-symbol')));
            });
            
            document.querySelectorAll('.remove-stock').forEach(button => {
                button.addEventListener('click', () => removeStock(button.getAttribute('data-symbol')));
            });
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showNotification('Failed to load portfolio data', 'error');
    }
}

// Add stock to portfolio
async function addStockToPortfolio(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const stockData = {
            symbol: formData.get('symbol'),
            name: formData.get('stockName'),
            quantity: parseInt(formData.get('quantity')),
            purchasePrice: parseFloat(formData.get('purchasePrice'))
        };
        
        await window.CredStockAPI.Portfolio.addStock(stockData);
        
        showNotification('Stock added to portfolio', 'success');
        
        // Reload portfolio data
        loadPortfolioData();
        
        // Close add stock form
        document.getElementById('add-stock-form').reset();
        document.getElementById('add-stock-modal').style.display = 'none';
    } catch (error) {
        showNotification(error.message || 'Failed to add stock', 'error');
    }
}

// Edit stock in portfolio
async function editStock(symbol) {
    try {
        // Get current stock data
        const portfolio = await window.CredStockAPI.Portfolio.getPortfolio();
        const stock = portfolio.stocks.find(s => s.symbol === symbol);
        
        if (!stock) {
            showNotification('Stock not found', 'error');
            return;
        }
        
        // Show edit form
        const editModal = document.getElementById('edit-stock-modal');
        const editForm = document.getElementById('edit-stock-form');
        
        editForm.elements['symbol'].value = stock.symbol;
        editForm.elements['stockName'].value = stock.name;
        editForm.elements['quantity'].value = stock.quantity;
        editForm.elements['purchasePrice'].value = stock.purchasePrice;
        
        editModal.style.display = 'block';
        
        // Handle form submission
        editForm.onsubmit = async (event) => {
            event.preventDefault();
            
            const formData = new FormData(editForm);
            
            try {
                const updatedStockData = {
                    quantity: parseInt(formData.get('quantity')),
                    purchasePrice: parseFloat(formData.get('purchasePrice'))
                };
                
                await window.CredStockAPI.Portfolio.updateStock(symbol, updatedStockData);
                
                showNotification('Stock updated successfully', 'success');
                
                // Reload portfolio data
                loadPortfolioData();
                
                // Close edit form
                editModal.style.display = 'none';
            } catch (error) {
                showNotification(error.message || 'Failed to update stock', 'error');
            }
        };
    } catch (error) {
        showNotification(error.message || 'Failed to edit stock', 'error');
    }
}

// Remove stock from portfolio
async function removeStock(symbol) {
    if (confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
        try {
            await window.CredStockAPI.Portfolio.removeStock(symbol);
            
            showNotification('Stock removed from portfolio', 'success');
            
            // Reload portfolio data
            loadPortfolioData();
        } catch (error) {
            showNotification(error.message || 'Failed to remove stock', 'error');
        }
    }
}

// Search stocks
async function searchStocks(query) {
    try {
        const stocks = await window.CredStockAPI.Stock.searchStocks(query);
        
        // Update search results UI
        const searchResults = document.getElementById('search-results');
        
        if (stocks.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No stocks found</div>';
            return;
        }
        
        let resultsHTML = '<div class="search-results-container">';
        
        stocks.forEach(stock => {
            resultsHTML += `
                <div class="stock-card">
                    <div class="stock-header">
                        <span class="stock-symbol">${stock.symbol}</span>
                        <span class="stock-price">$${stock.price.toFixed(2)}</span>
                    </div>
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                        ${stock.change >= 0 ? '+' : ''}${stock.change}%
                    </div>
                    <button class="add-to-portfolio" data-symbol="${stock.symbol}" data-name="${stock.name}" data-price="${stock.price}">
                        Add to Portfolio
                    </button>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        
        searchResults.innerHTML = resultsHTML;
        
        // Add event listeners for add to portfolio buttons
        document.querySelectorAll('.add-to-portfolio').forEach(button => {
            button.addEventListener('click', () => {
                const symbol = button.getAttribute('data-symbol');
                const name = button.getAttribute('data-name');
                const price = button.getAttribute('data-price');
                
                showAddStockForm(symbol, name, price);
            });
        });
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Failed to search stocks', 'error');
    }
}

// Show add stock form
function showAddStockForm(symbol, name, price) {
    const addStockModal = document.getElementById('add-stock-modal');
    const addStockForm = document.getElementById('add-stock-form');
    
    addStockForm.elements['symbol'].value = symbol;
    addStockForm.elements['stockName'].value = name;
    addStockForm.elements['purchasePrice'].value = price;
    
    addStockModal.style.display = 'block';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const user = await getCurrentUser();
    if (user) {
        updateUIForLoggedInState();
    }
    
    // Add event listeners for auth forms
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleRegistration);
    }
    
    // Add event listener for search form
    const searchForm = document.querySelector('.search-container form');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = searchForm.elements['search'].value.trim();
            if (query) {
                searchStocks(query);
            }
        });
    }
});