// public/scripts.js
// Tab switching functionality
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
    if (tabName === 'campaigns') loadCampaigns();
}

// Modal functionality
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const closeButtons = document.querySelectorAll('.close-modal');
const campaignBtn = document.querySelector('.hero .btn-primary');

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'flex';
});

switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        campaignModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === campaignModal) campaignModal.style.display = 'none';
});

// Logout functionality
function logout() {
    localStorage.removeItem('token');
    updateAuthButtons();
    window.location.reload();
}

// Update auth buttons based on login status
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    const token = localStorage.getItem('token');
    if (token) {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="logout()">Logout</button>
            <button class="btn btn-primary" id="campaignBtn">Create Campaign</button>
        `;
        document.getElementById('campaignBtn').addEventListener('click', () => {
            campaignModal.style.display = 'flex';
        });
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline" id="loginBtn">Login</button>
            <button class="btn btn-primary" id="registerBtn">Sign Up</button>
        `;
        loginBtn = document.getElementById('loginBtn');
        registerBtn = document.getElementById('registerBtn');
        loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
        registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    }
}

// Campaign creation modal
const campaignModal = document.createElement('div');
campaignModal.className = 'modal';
campaignModal.id = 'campaignModal';
campaignModal.innerHTML = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="auth-form">
            <h2>Create a Campaign</h2>
            <div class="form-group">
                <label for="campaign-title">Campaign Title</label>
                <input type="text" id="campaign-title" placeholder="Enter campaign title">
            </div>
            <div class="form-group">
                <label for="campaign-description">Description</label>
                <textarea id="campaign-description" placeholder="Describe your campaign"></textarea>
            </div>
            <div class="form-group">
                <label for="campaign-industry">Industry</label>
                <select id="campaign-industry">
                    <option value="fashion">Fashion & Beauty</option>
                    <option value="food">Food & Beverage</option>
                    <option value="tech">Technology</option>
                    <option value="travel">Travel & Tourism</option>
                    <option value="health">Health & Fitness</option>
                </select>
            </div>
            <div class="form-group">
                <label for="campaign-budget">Budget (ETB)</label>
                <input type="number" id="campaign-budget" placeholder="Enter budget">
            </div>
            <div class="form-group">
                <label for="campaign-tiktok">TikTok Profile URL</label>
                <input type="text" id="campaign-tiktok" placeholder="Enter your TikTok profile URL">
            </div>
            <div class="form-group">
                <label for="campaign-performance">Performance Model</label>
                <select id="campaign-performance">
                    <option value="cpa">Cost Per Acquisition</option>
                    <option value="cpc">Cost Per Click</option>
                    <option value="cpe">Cost Per Engagement</option>
                    <option value="fixed">Fixed Rate</option>
                </select>
            </div>
            <div class="form-group">
                <label for="campaign-deadline">Deadline</label>
                <input type="date" id="campaign-deadline">
            </div>
            <button class="btn btn-primary" id="createCampaignBtn">Proceed to Payment</button>
        </div>
    </div>
`;
document.body.appendChild(campaignModal);

// Handle campaign creation
document.getElementById('createCampaignBtn').addEventListener('click', async () => {
    const title = document.getElementById('campaign-title').value;
    const description = document.getElementById('campaign-description').value;
    const industry = document.getElementById('campaign-industry').value;
    const budget = document.getElementById('campaign-budget').value;
    const tiktokUrl = document.getElementById('campaign-tiktok').value;
    const performanceModel = document.getElementById('campaign-performance').value;
    const deadline = document.getElementById('campaign-deadline').value;

    try {
        const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                title,
                description,
                industry,
                budget,
                tiktokUrl,
                performanceModel,
                deadline
            })
        });
        const result = await response.json();
        if (response.ok) {
            alert('Campaign created! Redirecting to Telebirr payment...');
            window.location.href = result.paymentUrl; // Redirect to Telebirr
        } else {
            alert(result.message || 'Failed to create campaign');
        }
    } catch (error) {
        alert('Error creating campaign');
        console.error(error);
    }
});

// Handle login
document.querySelector('#loginModal .btn-primary').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            loginModal.style.display = 'none';
            updateAuthButtons();
            loadCampaigns();
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (error) {
        alert('Error logging in');
        console.error(error);
    }
});

// Handle registration
document.querySelector('#registerModal .btn-primary').addEventListener('click', async () => {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            registerModal.style.display = 'none';
            updateAuthButtons();
            loadCampaigns();
        } else {
            alert(result.message || 'Registration failed');
        }
    } catch (error) {
        alert('Error registering');
        console.error(error);
    }
});

// Load campaigns dynamically
async function loadCampaigns() {
    try {
        const response = await fetch('/api/campaigns');
        const campaigns = await response.json();
        const campaignGrid = document.querySelector('#campaigns-tab .card-grid');
        campaignGrid.innerHTML = '';
        campaigns.forEach(campaign => {
            const card = document.createElement('div');
            card.className = 'card campaign-card';
            card.innerHTML = `
                <div class="card-header">
                    <h3>${campaign.title}</h3>
                    <span class="campaign-badge">${campaign.performanceModel.toUpperCase()}</span>
                </div>
                <div class="card-body">
                    <p>${campaign.description}</p>
                    <p><a href="${campaign.tiktokUrl}" target="_blank">TikTok Profile</a></p>
                    <div class="niche-tags">
                        <span class="niche-tag">${campaign.industry}</span>
                    </div>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-value">ETB ${campaign.budget}</span>
                            <span class="stat-label">Budget</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${campaign.applications || 0}</span>
                            <span class="stat-label">Applications</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <span>Deadline: ${new Date(campaign.deadline).toLocaleDateString()}</span>
                    <button class="btn btn-primary btn-sm">Apply Now</button>
                </div>
            `;
            campaignGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

// Apply filters
document.querySelector('#campaigns-tab .btn-primary').addEventListener('click', async () => {
    const industry = document.getElementById('industry').value;
    const budget = document.getElementById('budget').value;
    const performance = document.getElementById('performance').value;
    try {
        const response = await fetch(`/api/campaigns?industry=${industry}&budget=${budget}&performance=${performance}`);
        const campaigns = await response.json();
        const campaignGrid = document.querySelector('#campaigns-tab .card-grid');
        campaignGrid.innerHTML = '';
        campaigns.forEach(campaign => {
            const card = document.createElement('div');
            card.className = 'card campaign-card';
            card.innerHTML = `
                <div class="card-header">
                    <h3>${campaign.title}</h3>
                    <span class="campaign-badge">${campaign.performanceModel.toUpperCase()}</span>
                </div>
                <div class="card-body">
                    <p>${campaign.description}</p>
                    <p><a href="${campaign.tiktokUrl}" target="_blank">TikTok Profile</a></p>
                    <div class="niche-tags">
                        <span class="niche-tag">${campaign.industry}</span>
                    </div>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-value">ETB ${campaign.budget}</span>
                            <span class="stat-label">Budget</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${campaign.applications || 0}</span>
                            <span class="stat-label">Applications</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <span>Deadline: ${new Date(campaign.deadline).toLocaleDateString()}</span>
                    <button class="btn btn-primary btn-sm">Apply Now</button>
                </div>
            `;
            campaignGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error filtering campaigns:', error);
    }
});

// Initialize
updateAuthButtons();
loadCampaigns();