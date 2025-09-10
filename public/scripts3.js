// public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('scripts.js loaded and DOM ready');

    // Modal references
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    let loginBtn = document.getElementById('loginBtn');
    let registerBtn = document.getElementById('registerBtn');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const closeButtons = document.querySelectorAll('.close-modal');
    const launchCampaignBtn = document.getElementById('launchCampaignBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const applyInfluencerFiltersBtn = document.getElementById('applyInfluencerFiltersBtn');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');

    // Campaign modal
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
                    <input type="text" id="campaign-title" placeholder="Enter campaign title" required>
                </div>
                <div class="form-group">
                    <label for="campaign-description">Description</label>
                    <textarea id="campaign-description" placeholder="Describe your campaign" required></textarea>
                </div>
                <div class="form-group">
                    <label for="campaign-industry">Industry</label>
                    <select id="campaign-industry" required>
                        <option value="fashion">Fashion & Beauty</option>
                        <option value="food">Food & Beverage</option>
                        <option value="tech">Technology</option>
                        <option value="travel">Travel & Tourism</option>
                        <option value="health">Health & Fitness</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="campaign-budget">Budget (ETB)</label>
                    <input type="number" id="campaign-budget" placeholder="Enter budget" min="1" required>
                </div>
                <div class="form-group">
                    <label for="campaign-tiktok">TikTok Profile URL</label>
                    <input type="url" id="campaign-tiktok" placeholder="Enter your TikTok profile URL" required>
                </div>
                <div class="form-group">
                    <label for="campaign-performance">Performance Model</label>
                    <select id="campaign-performance" required>
                        <option value="cpa">Cost Per Acquisition</option>
                        <option value="cpc">Cost Per Click</option>
                        <option value="cpe">Cost Per Engagement</option>
                        <option value="fixed">Fixed Rate</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="campaign-deadline">Deadline</label>
                    <input type="date" id="campaign-deadline" required>
                </div>
                <button class="btn btn-primary" id="createCampaignBtn">Proceed to Payment</button>
            </div>
        </div>
    `;
    document.body.appendChild(campaignModal);
    console.log('Campaign modal appended to DOM');

    // Helper function for API calls
    async function fetchWithErrorHandling(url, options) {
        try {
            console.log(`Fetching ${url} with options:`, options);
            const response = await fetch(url, options);
            console.log(`Response from ${url}:`, response.status);
            const result = await response.json();
            console.log(`Result from ${url}:`, result);
            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}`);
            }
            return result;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            alert(`Error: ${error.message}`);
            throw error;
        }
    }

    // Check if elements exist
    if (!loginBtn) console.error('loginBtn not found');
    if (!registerBtn) console.error('registerBtn not found');
    if (!switchToRegister) console.error('switchToRegister not found');
    if (!switchToLogin) console.error('switchToLogin not found');
    if (!launchCampaignBtn) console.error('launchCampaignBtn not found');
    if (!applyFiltersBtn) console.error('applyFiltersBtn not found');
    if (!applyInfluencerFiltersBtn) console.error('applyInfluencerFiltersBtn not found');
    if (!loginSubmitBtn) console.error('loginSubmitBtn not found');
    if (!registerSubmitBtn) console.error('registerSubmitBtn not found');

    // Event listeners
    loginBtn?.addEventListener('click', () => {
        console.log('Login button clicked');
        loginModal.style.display = 'flex';
    });

    registerBtn?.addEventListener('click', () => {
        console.log('Register button clicked');
        registerModal.style.display = 'flex';
    });

    switchToRegister?.addEventListener('click', (e) => {
        console.log('Switch to register clicked');
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });

    switchToLogin?.addEventListener('click', (e) => {
        console.log('Switch to login clicked');
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Close modal clicked');
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

    launchCampaignBtn?.addEventListener('click', () => {
        console.log('Launch campaign button clicked');
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to create a campaign');
            loginModal.style.display = 'flex';
        } else {
            campaignModal.style.display = 'flex';
        }
    });

    // Logout functionality
    function logout() {
        console.log('Logout clicked');
        localStorage.removeItem('token');
        updateAuthButtons();
        window.location.reload();
    }

    // Update auth buttons
    function updateAuthButtons() {
        console.log('Updating auth buttons');
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) {
            console.error('auth-buttons not found');
            return;
        }
        const token = localStorage.getItem('token');
        authButtons.innerHTML = token ? `
            <button class="btn btn-outline" id="logoutBtn">Logout</button>
            <button class="btn btn-primary" id="campaignBtn">Create Campaign</button>
        ` : `
            <button class="btn btn-outline" id="loginBtn">Login</button>
            <button class="btn btn-primary" id="registerBtn">Sign Up</button>
        `;
        if (token) {
            document.getElementById('logoutBtn')?.addEventListener('click', logout);
            document.getElementById('campaignBtn')?.addEventListener('click', () => {
                console.log('Create campaign button clicked');
                campaignModal.style.display = 'flex';
            });
        } else {
            loginBtn = document.getElementById('loginBtn');
            registerBtn = document.getElementById('registerBtn');
            loginBtn?.addEventListener('click', () => {
                console.log('Login button clicked');
                loginModal.style.display = 'flex';
            });
            registerBtn?.addEventListener('click', () => {
                console.log('Register button clicked');
                registerModal.style.display = 'flex';
            });
        }
    }

    // Login submission
    loginSubmitBtn?.addEventListener('click', async () => {
        console.log('Login submit clicked');
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        await fetchWithErrorHandling('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(result => {
            localStorage.setItem('token', result.token);
            loginModal.style.display = 'none';
            updateAuthButtons();
            loadCampaigns();
            alert('Login successful');
        }).catch(error => {
            console.error('Login failed:', error);
        });
    });

    // Register submission
    registerSubmitBtn?.addEventListener('click', async () => {
        console.log('Register submit clicked');
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password')?.value;
        const role = document.getElementById('register-role')?.value;
        if (!name || !email || !password || !role) {
            alert('Please fill in all fields');
            return;
        }
        await fetchWithErrorHandling('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        }).then(result => {
            localStorage.setItem('token', result.token);
            registerModal.style.display = 'none';
            updateAuthButtons();
            loadCampaigns();
            alert('Registration successful');
        }).catch(error => {
            console.error('Registration failed:', error);
        });
    });

    // Campaign creation
    document.getElementById('createCampaignBtn')?.addEventListener('click', async () => {
        console.log('Create campaign submit clicked');
        const title = document.getElementById('campaign-title')?.value;
        const description = document.getElementById('campaign-description')?.value;
        const industry = document.getElementById('campaign-industry')?.value;
        const budget = document.getElementById('campaign-budget')?.value;
        const tiktokUrl = document.getElementById('campaign-tiktok')?.value;
        const performanceModel = document.getElementById('campaign-performance')?.value;
        const deadline = document.getElementById('campaign-deadline')?.value;
        if (!title || !description || !industry || !budget || !tiktokUrl || !performanceModel || !deadline) {
            alert('Please fill in all campaign fields');
            return;
        }
        await fetchWithErrorHandling('/api/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description, industry, budget, tiktokUrl, performanceModel, deadline })
        }).then(result => {
            campaignModal.style.display = 'none';
            alert('Campaign created! Redirecting to Telebirr payment...');
            // window.location.href = result.paymentUrl; // Mocked for testing
            loadCampaigns();
        }).catch(error => {
            console.error('Campaign creation failed:', error);
        });
    });

    // Apply campaign filters
    applyFiltersBtn?.addEventListener('click', async () => {
        console.log('Apply campaign filters clicked');
        const industry = document.getElementById('industry')?.value;
        const budget = document.getElementById('budget')?.value;
        const performance = document.getElementById('performance')?.value;
        await fetchWithErrorHandling(`/api/campaigns?industry=${industry}&budget=${budget}&performance=${performance}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(data => {
            const campaignGrid = document.querySelector('#campaigns-tab .card-grid');
            campaignGrid.innerHTML = '';
            if (!data.campaigns || !Array.isArray(data.campaigns) || data.campaigns.length === 0) {
                campaignGrid.innerHTML = '<p>No campaigns found.</p>';
                console.log('No campaigns found for filters');
                return;
            }
            data.campaigns.forEach(campaign => {
                const card = document.createElement('div');
                card.className = 'card campaign-card';
                card.innerHTML = `
                    <div class="card-header">
                        <h3>${campaign.title || 'Untitled'}</h3>
                        <span class="campaign-badge">${(campaign.performanceModel || 'N/A').toUpperCase()}</span>
                    </div>
                    <div class="card-body">
                        <p>${campaign.description || 'No description'}</p>
                        <p><a href="${campaign.tiktokUrl || '#'}" target="_blank">TikTok Profile</a></p>
                        <div class="niche-tags">
                            <span class="niche-tag">${campaign.industry || 'Unknown'}</span>
                        </div>
                        <div class="stats">
                            <div class="stat">
                                <span class="stat-value">ETB ${campaign.budget || 0}</span>
                                <span class="stat-label">Budget</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${campaign.applications?.length || 0}</span>
                                <span class="stat-label">Applications</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <span>Deadline: ${campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'N/A'}</span>
                        <button class="btn btn-primary btn-sm">Apply Now</button>
                    </div>
                `;
                campaignGrid.appendChild(card);
            });
        }).catch(error => {
            console.error('Filter campaigns failed:', error);
        });
    });

    // Apply influencer filters (placeholder for future implementation)
    applyInfluencerFiltersBtn?.addEventListener('click', () => {
        console.log('Apply influencer filters clicked');
        alert('Influencer filters not yet implemented.');
    });

    // Tab switching
    function switchTab(tabName) {
        console.log(`Switching to tab: ${tabName}`);
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const tabElement = document.getElementById(tabName + '-tab');
        if (tabElement) {
            tabElement.classList.add('active');
            event.currentTarget.classList.add('active');
            if (tabName === 'campaigns') loadCampaigns();
        } else {
            console.error(`Tab ${tabName}-tab not found`);
        }
    }

    // Load campaigns
    async function loadCampaigns(page = 1) {
        console.log(`Loading campaigns, page: ${page}`);
        const campaignGrid = document.querySelector('#campaigns-tab .card-grid');
        if (!campaignGrid) {
            console.error('Campaign grid not found');
            alert('Error: Campaign grid not found');
            return;
        }
        campaignGrid.innerHTML = '<p>Loading campaigns...</p>';
        try {
            const response = await fetch(`/api/campaigns?page=${page}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Campaigns API response status:', response.status);
            const data = await response.json();
            console.log('Raw API response:', data);
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            if (!data.campaigns || !Array.isArray(data.campaigns)) {
                throw new Error('Invalid API response: campaigns array missing or not an array');
            }
            campaignGrid.innerHTML = '';
            if (data.campaigns.length === 0) {
                campaignGrid.innerHTML = '<p>No campaigns found.</p>';
                console.log('No campaigns returned from API');
                return;
            }
            data.campaigns.forEach(campaign => {
                const card = document.createElement('div');
                card.className = 'card campaign-card';
                card.innerHTML = `
                    <div class="card-header">
                        <h3>${campaign.title || 'Untitled'}</h3>
                        <span class="campaign-badge">${(campaign.performanceModel || 'N/A').toUpperCase()}</span>
                    </div>
                    <div class="card-body">
                        <p>${campaign.description || 'No description'}</p>
                        <p><a href="${campaign.tiktokUrl || '#'}" target="_blank">TikTok Profile</a></p>
                        <div class="niche-tags">
                            <span class="niche-tag">${campaign.industry || 'Unknown'}</span>
                        </div>
                        <div class="stats">
                            <div class="stat">
                                <span class="stat-value">ETB ${campaign.budget || 0}</span>
                                <span class="stat-label">Budget</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${campaign.applications?.length || 0}</span>
                                <span class="stat-label">Applications</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <span>Deadline: ${campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'N/A'}</span>
                        <button class="btn btn-primary btn-sm">Apply Now</button>
                    </div>
                `;
                campaignGrid.appendChild(card);
            });
            const pagination = document.createElement('div');
            pagination.className = 'pagination';
            pagination.innerHTML = `
                <button onclick="loadCampaigns(${data.page - 1})" ${data.page === 1 ? 'disabled' : ''}>Previous</button>
                <span>Page ${data.page} of ${data.pages || 1}</span>
                <button onclick="loadCampaigns(${data.page + 1})" ${data.page === data.pages ? 'disabled' : ''}>Next</button>
            `;
            campaignGrid.appendChild(pagination);
        } catch (error) {
            console.error('Error loading campaigns:', error);
            campaignGrid.innerHTML = '<p>Error loading campaigns. Please try again.</p>';
            alert('Error loading campaigns: ' + error.message);
        }
    }

    // Attach tab listeners
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            console.log('Tab clicked:', tab.textContent);
            switchTab(tab.textContent.toLowerCase().replace(' ', '-')); // Handle 'Video Editors'
        });
    });

    // Initialize
    updateAuthButtons();
    loadCampaigns();
});