// User Authentication System using Backend API
const CURRENT_USER_KEY = 'credstock_current_user';

// Session Management
async function setCurrentUser(userData) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    updateUIForLoggedInState();
}

async function getCurrentUser() {
    try {
        // First check if we have user data in localStorage
        const userDataStr = localStorage.getItem(CURRENT_USER_KEY);
        if (userDataStr) {
            return JSON.parse(userDataStr);
        }
        
        // If not, try to get from API
        const userData = await window.CredStockAPI.Auth.getCurrentUser();
        if (userData) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
            return userData;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.CredStockAPI.Auth.logout();
    updateUIForLoggedOutState();
}

// Update UI based on authentication state
async function updateUIForLoggedInState() {
    const user = await getCurrentUser();
    if (user) {
        // Update profile section with user data
        populateProfileData(user);
        
        // Show profile section if not already active
        if (window.location.hash !== '#profile') {
            switchPanel('profile');
        }
        
        // Update navigation to show user is logged in
        const navLinks = document.querySelectorAll('.nav-links a[data-panel]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-panel') === 'profile') {
                link.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name}`;
            }
        });
        
        // Show logout button
        const logoutItem = document.getElementById('logout-item');
        if (logoutItem) {
            logoutItem.style.display = 'block';
        }
        
        // Hide Get Started button if user is logged in
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.style.display = 'none';
        }
        
        // Load portfolio data
        loadPortfolioData();
    }
}

function updateUIForLoggedOutState() {
    // Reset navigation
    const navLinks = document.querySelectorAll('.nav-links a[data-panel]');
    navLinks.forEach(link => {
        if (link.getAttribute('data-panel') === 'profile') {
            link.innerHTML = 'Profile';
        }
    });
    
    // Hide logout button
    const logoutItem = document.getElementById('logout-item');
    if (logoutItem) {
        logoutItem.style.display = 'none';
    }
    
    // Show Get Started button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.style.display = 'block';
    }
    
    // Clear profile data
    clearProfileData();
}

// Profile Data Management
function populateProfileData(user) {
    // Update profile header
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email || `${user.username}@credstock.com`;
    
    // Update personal information
    document.getElementById('profile-fullname').textContent = user.name;
    document.getElementById('profile-email-detail').textContent = user.email || `${user.username}@credstock.com`;
    document.getElementById('profile-phone').textContent = user.mobile ? `+1 ${user.mobile}` : 'Not provided';
    document.getElementById('profile-location').textContent = user.location || 'New York, NY';
    
    // Update member since
    const joinDate = user.joinDate || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.querySelector('.member-since').textContent = `Member since: ${joinDate}`;
    
    // Update account details
    const detailItems = document.querySelectorAll('.detail-item span');
    if (detailItems.length >= 4) {
        detailItems[1].textContent = joinDate; // Member since date
    }
}

function clearProfileData() {
    // Reset to placeholder data
    document.getElementById('profile-name').textContent = 'Guest User';
    document.getElementById('profile-email').textContent = 'guest@example.com';
    document.getElementById('profile-fullname').textContent = 'Guest User';
    document.getElementById('profile-email-detail').textContent = 'guest@example.com';
    document.getElementById('profile-phone').textContent = '+1 (555) 123-4567';
    document.getElementById('profile-location').textContent = 'New York, NY';
    document.querySelector('.member-since').textContent = 'Member since: Jan 2023';
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user database
    initUserDatabase();
    
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUIForLoggedInState();
    }

    // Initialize 3D elements
    try {
        initHero3D();
        initCard3D();
        initTradingFloor3D();
        initGraph3D();

        // Initialize animations
        initAnimations();

        // Initialize navigation highlighting
        initNavHighlighting();

        // Initialize search functionality
        initSearch();

        // Initialize authentication animation
        initAuthAnimation();
    } catch (error) {
        console.error("Initialization error:", error);
    }
});

// 3D Hero Animation using Three.js - Enhanced and Bigger
function initHero3D() {
    const container = document.getElementById('hero-3d-container');
    if (!container) {
        console.warn('Hero 3D container not found');
        return;
    }

    try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = null;

        // Create camera with wider field of view
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 0, 0);

        // Create renderer with higher quality
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create a group to hold objects
        const group = new THREE.Group();
        scene.add(group);

        // Create larger stock chart visualization
        const chartGeometry = new THREE.BoxGeometry(6, 4, 0.3);
        const chartMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a52be,
            transparent: true,
            opacity: 0.9,
            shininess: 150,
            specular: 0xffffff
        });
        const chart = new THREE.Mesh(chartGeometry, chartMaterial);
        chart.castShadow = true;
        chart.receiveShadow = true;
        group.add(chart);

        // Create grid lines on the chart
        const gridGroup = new THREE.Group();
        for (let i = -2; i <= 2; i++) {
            const lineGeometry = new THREE.BoxGeometry(6, 0.02, 0.02);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.y = i;
            gridGroup.add(line);
        }
        for (let i = -3; i <= 3; i += 0.5) {
            const lineGeometry = new THREE.BoxGeometry(0.02, 4, 0.02);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.x = i;
            gridGroup.add(line);
        }
        gridGroup.position.z = 0.16;
        group.add(gridGroup);

        // Create rising bars for the chart - more bars and larger
        const barCount = 20;
        const bars = [];

        for (let i = 0; i < barCount; i++) {
            const height = Math.random() * 1.5 + 0.5;
            const barGeometry = new THREE.BoxGeometry(0.25, height, 0.25);
            const barMaterial = new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? 0xff6b6b : 0x4caf50,
                transparent: true,
                opacity: 0.95,
                shininess: 120,
                specular: 0xffffff
            });

            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.x = (i - barCount / 2) * 0.6 + 0.3;
            bar.position.y = height / 2 - 1;
            bar.position.z = 0.16;
            bar.castShadow = true;
            bar.receiveShadow = true;

            bars.push({
                mesh: bar,
                initialHeight: height,
                speed: Math.random() * 0.015 + 0.008,
                phase: Math.random() * Math.PI * 2
            });

            group.add(bar);
        }

        // Add floating stock symbols
        const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA'];
        const floatingSymbols = [];

        symbols.forEach((symbol, index) => {
            const textGeometry = new THREE.TextGeometry(symbol, {
                font: new THREE.Font(/* You would need to load a font here */),
                size: 0.3,
                height: 0.05
            });
            const textMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                emissive: 0x2a52be,
                emissiveIntensity: 0.3
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6 + 2,
                (Math.random() - 0.5) * 4 - 2
            );
            textMesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            scene.add(textMesh);
            floatingSymbols.push({
                mesh: textMesh,
                speed: Math.random() * 0.01 + 0.005,
                rotationSpeed: Math.random() * 0.02 + 0.01
            });
        });

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(8, 10, 6);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xff6b6b, 0.8, 20);
        pointLight.position.set(-5, 3, 2);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0x4caf50, 0.8, 20);
        pointLight2.position.set(5, 3, -2);
        scene.add(pointLight2);

        // Add fog for depth
        scene.fog = new THREE.Fog(0x000000, 5, 20);

        // Animation function
        function animate() {
            requestAnimationFrame(animate);

            // Rotate the entire group with smooth motion
            group.rotation.y += 0.003;
            group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;

            // Animate bars with more dynamic movement
            bars.forEach(bar => {
                const time = Date.now() * bar.speed + bar.phase;
                const scale = bar.initialHeight + Math.sin(time) * 0.4 + Math.cos(time * 0.7) * 0.2;
                bar.mesh.scale.y = scale;
                bar.mesh.position.y = (bar.initialHeight * scale) / 2 - 1;
                bar.mesh.material.opacity = 0.8 + Math.sin(time) * 0.2;
            });

            // Animate floating symbols
            floatingSymbols.forEach(symbol => {
                symbol.mesh.rotation.x += symbol.rotationSpeed * 0.1;
                symbol.mesh.rotation.y += symbol.rotationSpeed;
                symbol.mesh.position.y += Math.sin(Date.now() * symbol.speed) * 0.01;
            });

            renderer.render(scene, camera);
        }

        // Handle window resize
        const handleResize = function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        const cleanup = function() {
            window.removeEventListener('resize', handleResize);
            // Additional cleanup if needed
        };

        // Start animation
        animate();

        return cleanup;
    } catch (error) {
        console.error("Error initializing hero 3D:", error);
    }
}

// 3D Graph Animation - Real-time Stock Data Visualization
function initGraph3D() {
    const container = document.getElementById('graph-3d-container');
    if (!container) {
        console.warn('Graph 3D container not found');
        return;
    }

    try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = null;

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create graph base
        const baseGeometry = new THREE.BoxGeometry(4, 0.1, 2);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a52be,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.5;
        scene.add(base);

        // Create grid lines
        const gridGroup = new THREE.Group();
        
        // X-axis lines
        for (let x = -2; x <= 2; x += 0.5) {
            const lineGeometry = new THREE.BoxGeometry(0.02, 0.02, 2);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3 });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(x, -0.45, 0);
            gridGroup.add(line);
        }
        
        // Z-axis lines
        for (let z = -1; z <= 1; z += 0.25) {
            const lineGeometry = new THREE.BoxGeometry(4, 0.02, 0.02);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3 });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(0, -0.45, z);
            gridGroup.add(line);
        }
        
        scene.add(gridGroup);

        // Create data points and lines
        const dataPoints = [];
        const linePoints = [];
        const dataCount = 20;

        // Initial data
        for (let i = 0; i < dataCount; i++) {
            dataPoints.push({
                x: (i - dataCount / 2) * 0.4,
                y: Math.random() * 2,
                z: 0
            });
        }

        // Create line
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x4caf50,
            linewidth: 2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);

        // Create data point spheres
        const spheres = [];
        const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6b6b,
            emissive: 0xff6b6b,
            emissiveIntensity: 0.3
        });

        dataPoints.forEach((point, index) => {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(point.x, point.y, point.z);
            spheres.push(sphere);
            scene.add(sphere);
        });

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Animation function
        function animate() {
            requestAnimationFrame(animate);

            // Update data points with realistic stock-like movement
            dataPoints.forEach((point, index) => {
                // Simulate stock price movement with some randomness
                point.y += (Math.random() - 0.48) * 0.1;
                point.y = Math.max(0, Math.min(4, point.y)); // Clamp between 0 and 4
                
                // Update sphere positions
                spheres[index].position.y = point.y;
                
                // Add slight horizontal movement for realism
                spheres[index].position.x += (Math.random() - 0.5) * 0.01;
            });

            // Update line geometry
            const positions = [];
            dataPoints.forEach(point => {
                positions.push(point.x, point.y, point.z);
            });
            lineGeometry.setFromPoints(dataPoints.map(p => new THREE.Vector3(p.x, p.y, p.z)));
            lineGeometry.attributes.position.needsUpdate = true;

            // Rotate camera slightly for dynamic effect
            camera.position.x = Math.sin(Date.now() * 0.0003) * 2;
            camera.position.z = 5 + Math.cos(Date.now() * 0.0002) * 0.5;
            camera.lookAt(0, 1, 0);

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Start animation
        animate();
    } catch (error) {
        console.error("Error initializing graph 3D:", error);
    }
}

// Trading Floor 3D Animation - Stock Market Trading Visualization
function initTradingFloor3D() {
    const container = document.getElementById('trading-floor-container');
    if (!container) {
        console.warn('Trading floor container not found');
        return;
    }

    try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = null;

        // Create camera
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 3, 8);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create trading floor
        const floorGeometry = new THREE.PlaneGeometry(15, 10);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            shininess: 30,
            specular: 0x111111
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.5;
        scene.add(floor);

        // Create grid pattern on floor
        const gridGroup = new THREE.Group();
        for (let x = -7; x <= 7; x += 1) {
            const lineGeometry = new THREE.BoxGeometry(0.02, 0.02, 10);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x2a52be, opacity: 0.2 });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(x, -0.45, 0);
            gridGroup.add(line);
        }
        for (let z = -5; z <= 5; z += 1) {
            const lineGeometry = new THREE.BoxGeometry(15, 0.02, 0.02);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x2a52be, opacity: 0.2 });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(0, -0.45, z);
            gridGroup.add(line);
        }
        scene.add(gridGroup);

        // Create trading desks
        const desks = [];
        const deskGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
        const deskMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 12; i++) {
            const desk = new THREE.Mesh(deskGeometry, deskMaterial);
            const row = Math.floor(i / 4);
            const col = i % 4;
            desk.position.set((col - 1.5) * 2.5, 0, (row - 1) * 2.5);
            desk.rotation.y = Math.PI / 2;
            scene.add(desk);
            desks.push(desk);
        }

        // Create traders (simple representations)
        const traders = [];
        const traderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16);
        const buyMaterial = new THREE.MeshPhongMaterial({ color: 0x4caf50 });
        const sellMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
        
        desks.forEach((desk, index) => {
            const trader = new THREE.Mesh(traderGeometry, index % 2 === 0 ? buyMaterial : sellMaterial);
            trader.position.copy(desk.position);
            trader.position.y = 0.6;
            trader.userData = {
                action: index % 2 === 0 ? 'buy' : 'sell',
                intensity: Math.random() * 0.5 + 0.5,
                phase: Math.random() * Math.PI * 2
            };
            scene.add(trader);
            traders.push(trader);
        });

        // Create floating stock symbols and numbers
        const floatingElements = [];
        const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'NFLX'];
        
        for (let i = 0; i < 20; i++) {
            const isNumber = Math.random() > 0.5;
            const value = isNumber ? (Math.random() * 100 + 50).toFixed(2) : symbols[Math.floor(Math.random() * symbols.length)];
            
            // Simple text representation (would need font loading for real text)
            const elementGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.05);
            const elementMaterial = new THREE.MeshPhongMaterial({
                color: isNumber ? (value > 75 ? 0x4caf50 : 0xff6b6b) : 0x2a52be,
                emissive: isNumber ? (value > 75 ? 0x4caf50 : 0xff6b6b) : 0x2a52be,
                emissiveIntensity: 0.3
            });
            
            const element = new THREE.Mesh(elementGeometry, elementMaterial);
            element.position.set(
                (Math.random() - 0.5) * 12,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 8
            );
            element.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            element.userData = {
                speed: Math.random() * 0.02 + 0.01,
                rotationSpeed: Math.random() * 0.03 + 0.01,
                value: value,
                isNumber: isNumber
            };
            scene.add(element);
            floatingElements.push(element);
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x4caf50, 0.6, 15);
        pointLight.position.set(-5, 3, -3);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xff6b6b, 0.6, 15);
        pointLight2.position.set(5, 3, 3);
        scene.add(pointLight2);

        // Animation function
        function animate() {
            requestAnimationFrame(animate);

            // Animate traders (buy/sell actions)
            traders.forEach(trader => {
                const time = Date.now() * 0.001 * trader.userData.intensity + trader.userData.phase;
                const scale = 1 + Math.sin(time) * 0.1;
                trader.scale.y = scale;
                
                // Randomly change trader action
                if (Math.random() < 0.005) {
                    trader.userData.action = trader.userData.action === 'buy' ? 'sell' : 'buy';
                    trader.material = trader.userData.action === 'buy' ? buyMaterial : sellMaterial;
                }
            });

            // Animate floating elements
            floatingElements.forEach(element => {
                element.rotation.x += element.userData.rotationSpeed * 0.1;
                element.rotation.y += element.userData.rotationSpeed;
                element.position.y += Math.sin(Date.now() * element.userData.speed) * 0.01;
                
                // Randomly update values for numbers
                if (element.userData.isNumber && Math.random() < 0.01) {
                    const change = (Math.random() - 0.5) * 10;
                    let newValue = parseFloat(element.userData.value) + change;
                    newValue = Math.max(50, Math.min(150, newValue)).toFixed(2);
                    element.userData.value = newValue;
                    
                    // Update color based on value change
                    const wasGreen = parseFloat(element.userData.value) > 75;
                    const isGreen = newValue > 75;
                    if (wasGreen !== isGreen) {
                        element.material.color.set(isGreen ? 0x4caf50 : 0xff6b6b);
                        element.material.emissive.set(isGreen ? 0x4caf50 : 0xff6b6b);
                    }
                }
            });

            // Move camera around trading floor
            const time = Date.now() * 0.0005;
            camera.position.x = Math.sin(time) * 6;
            camera.position.z = 8 + Math.cos(time * 0.7) * 2;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Start animation
        animate();
    } catch (error) {
        console.error("Error initializing trading floor 3D:", error);
    }
}

// 3D Card Elements
function initCard3D() {
    const cards = document.querySelectorAll('.card-3d-element');
    if (cards.length === 0) {
        console.warn('No card 3D elements found');
        return;
    }

    try {
        cards.forEach((card, index) => {
            // Create scene
            const scene = new THREE.Scene();

            // Create camera
            const camera = new THREE.PerspectiveCamera(75, card.clientWidth / card.clientHeight, 0.1, 1000);
            camera.position.z = 5;

            // Create renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(card.clientWidth, card.clientHeight);
            card.appendChild(renderer.domElement);

            // Create geometry based on card index
            let geometry, material, mesh;

            switch (index % 3) {
                case 0: // Growth stocks - upward arrow
                    geometry = new THREE.ConeGeometry(1, 2, 32);
                    material = new THREE.MeshPhongMaterial({ color: 0x4caf50 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.z = Math.PI;
                    break;

                case 1: // Dividend stocks - coin stack
                    const coinGroup = new THREE.Group();

                    for (let i = 0; i < 5; i++) {
                        const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
                        const coinMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
                        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
                        coin.position.y = i * 0.25;
                        coinGroup.add(coin);
                    }

                    mesh = coinGroup;
                    break;

                case 2: // Tech innovations - sphere with rings
                    geometry = new THREE.SphereGeometry(1, 32, 32);
                    material = new THREE.MeshPhongMaterial({
                        color: 0x2a52be,
                        shininess: 100
                    });
                    mesh = new THREE.Mesh(geometry, material);

                    const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
                    const ringMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
                    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                    ring.rotation.x = Math.PI / 2;

                    const objectGroup = new THREE.Group();
                    objectGroup.add(mesh);
                    objectGroup.add(ring);

                    mesh = objectGroup;
                    break;
            }

            scene.add(mesh);

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // Animation function
            function animate() {
                requestAnimationFrame(animate);

                mesh.rotation.y += 0.01;

                renderer.render(scene, camera);
            }

            // Start animation
            animate();
        });
    } catch (error) {
        console.error("Error initializing card 3D:", error);
    }
}

// GSAP Animations
function initAnimations() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not found');
        return;
    }

    try {
        // Register ScrollTrigger plugin if available
        if (gsap.registerPlugin && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Animate sections on scroll
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const heading = section.querySelector('h2');
            if (heading) {
                gsap.fromTo(
                    heading, { opacity: 0, y: 50 }, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }

            const elements = section.querySelectorAll('.card, .expert-card, .news-card, .feature');
            if (elements.length > 0) {
                gsap.fromTo(
                    elements, { opacity: 0, y: 50 }, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 70%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        });
    } catch (error) {
        console.error("Error initializing animations:", error);
    }
}

// Panel Navigation and Highlighting
function initNavHighlighting() {
    const navLinks = document.querySelectorAll('.nav-links a[data-panel]');
    const panels = document.querySelectorAll('section');

    if (navLinks.length === 0 || panels.length === 0) {
        console.warn('Navigation links or panels not found');
        return;
    }

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPanel = this.getAttribute('data-panel');
            switchPanel(targetPanel);
            
            // Update URL hash
            window.location.hash = targetPanel;
        });
    });

    // Handle browser back/forward navigation
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash && isValidPanel(hash)) {
            switchPanel(hash);
        }
    });

    // Check initial hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash && isValidPanel(initialHash)) {
        switchPanel(initialHash);
    }
}

function isValidPanel(panelId) {
    const validPanels = ['home', 'ideas', 'experts', 'news', 'portfolio', 'profile', 'contact'];
    return validPanels.includes(panelId);
}

function switchPanel(panelId) {
    const panels = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a[data-panel]');
    
    // Hide all panels
    panels.forEach(panel => {
        panel.classList.remove('active-panel');
        panel.classList.add('panel');
    });
    
    // Show target panel
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.remove('panel');
        targetPanel.classList.add('active-panel');
        
        // Scroll to top for better user experience
        window.scrollTo(0, 0);
    }
    
    // Update navigation highlighting
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-panel') === panelId) {
            link.classList.add('active');
        }
    });
}

// Authentication Animation Functionality
function initAuthAnimation() {
    const ctaButton = document.querySelector('.cta-button');
    const authInterface = document.getElementById('auth-interface');
    const backToHero = document.getElementById('back-to-hero');
    const auth3dContainer = document.getElementById('auth-3d-container');
    const heroContent = document.querySelector('.hero-content');
    const hero3dContainer = document.querySelector('.hero-3d-container');

    if (!ctaButton || !authInterface || !backToHero) {
        console.warn('Auth animation elements not found');
        return;
    }

    // Handle Get Started button click
    ctaButton.addEventListener('click', function() {
        showAuthInterface();
    });

    // Handle back to hero button click
    backToHero.addEventListener('click', function() {
        hideAuthInterface();
    });

    // Add real-time password confirmation validation
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    if (passwordInput && confirmPasswordInput) {
        const validatePassword = function() {
            if (confirmPasswordInput.value === '') {
                confirmPasswordInput.setCustomValidity('');
            } else if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        };

        passwordInput.addEventListener('change', validatePassword);
        confirmPasswordInput.addEventListener('keyup', validatePassword);
    }

    // Handle form submissions
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(e);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration(e);
        });
    }

    // Initialize 3D auth animation if container exists
    if (auth3dContainer) {
        initAuth3DAnimation();
    }
}

function showAuthInterface() {
    const authInterface = document.getElementById('auth-interface');
    const heroContent = document.querySelector('.hero-content');
    const hero3dContainer = document.querySelector('.hero-3d-container');

    // Hide hero content with animation
    gsap.to(heroContent, {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: function() {
            heroContent.style.display = 'none';
        }
    });

    // Scale down hero 3D container
    gsap.to(hero3dContainer, {
        scale: 0.8,
        opacity: 0.3,
        duration: 1,
        ease: "power2.inOut"
    });

    // Show auth interface with animation
    authInterface.style.display = 'flex';
    gsap.fromTo(authInterface, 
        { opacity: 0, scale: 0.8 },
        {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "back.out(1.7)",
            onComplete: function() {
                authInterface.classList.add('active');
            }
        }
    );

    // Create floating particles for background
    createAuthParticles();
}

function hideAuthInterface() {
    const authInterface = document.getElementById('auth-interface');
    const heroContent = document.querySelector('.hero-content');
    const hero3dContainer = document.querySelector('.hero-3d-container');

    // Hide auth interface with animation
    gsap.to(authInterface, {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: "power2.in",
        onComplete: function() {
            authInterface.style.display = 'none';
            authInterface.classList.remove('active');
        }
    });

    // Show hero content with animation
    heroContent.style.display = 'block';
    gsap.to(heroContent, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.3
    });

    // Scale up hero 3D container
    gsap.to(hero3dContainer, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.3
    });

    // Remove particles
    removeAuthParticles();
}

function createAuthParticles() {
    const authInterface = document.getElementById('auth-interface');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'auth-particle';
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // Random size and animation delay
        const size = Math.random() * 8 + 4;
        const delay = Math.random() * 5;
        
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        
        // Random gradient colors
        const colors = [
            'linear-gradient(135deg, #2a52be, #ff6b6b)',
            'linear-gradient(135deg, #4caf50, #ffd700)',
            'linear-gradient(135deg, #ff6b6b, #2a52be)',
            'linear-gradient(135deg, #ffd700, #4caf50)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        authInterface.appendChild(particle);
    }
}

function removeAuthParticles() {
    const particles = document.querySelectorAll('.auth-particle');
    particles.forEach(particle => particle.remove());
}

function initAuth3DAnimation() {
    const container = document.getElementById('auth-3d-container');
    if (!container) return;

    try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = null;

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create floating stock symbols that transform into form elements
        const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA'];
        const floatingElements = [];

        symbols.forEach((symbol, index) => {
            // Create text geometry (simplified representation)
            const geometry = new THREE.BoxGeometry(0.8, 0.3, 0.1);
            const material = new THREE.MeshPhongMaterial({
                color: index % 2 === 0 ? 0x2a52be : 0xff6b6b,
                emissive: index % 2 === 0 ? 0x2a52be : 0xff6b6b,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });

            const mesh = new THREE.Mesh(geometry, material);
            
            // Position around the auth interface
            const angle = (index / symbols.length) * Math.PI * 2;
            const radius = 3;
            mesh.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 2
            );

            mesh.userData = {
                originalPosition: mesh.position.clone(),
                targetPosition: new THREE.Vector3(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 2
                ),
                speed: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2
            };

            scene.add(mesh);
            floatingElements.push(mesh);
        });

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Point lights for colorful effects
        const pointLight1 = new THREE.PointLight(0x2a52be, 0.6, 10);
        pointLight1.position.set(-3, 2, 2);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff6b6b, 0.6, 10);
        pointLight2.position.set(3, -2, -2);
        scene.add(pointLight2);

        // Animation function
        function animate() {
            requestAnimationFrame(animate);

            // Animate floating elements
            floatingElements.forEach((element, index) => {
                const time = Date.now() * element.userData.speed + element.userData.phase;
                
                // Floating motion
                element.position.y = element.userData.originalPosition.y + Math.sin(time) * 0.3;
                element.position.x = element.userData.originalPosition.x + Math.cos(time * 0.7) * 0.2;
                
                // Rotation
                element.rotation.x = Math.sin(time * 0.5) * 0.1;
                element.rotation.y = Math.cos(time * 0.3) * 0.1;
                
                // Pulsating opacity
                element.material.opacity = 0.6 + Math.sin(time) * 0.2;
            });

            // Rotate camera slightly for dynamic effect
            const cameraTime = Date.now() * 0.0003;
            camera.position.x = Math.sin(cameraTime) * 1;
            camera.position.y = Math.cos(cameraTime * 0.7) * 0.5;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Start animation
        animate();
    } catch (error) {
        console.error("Error initializing auth 3D animation:", error);
    }
}

function handleLogin(form) {
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');

    // Validate inputs
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    const loginBtn = form.querySelector('.auth-btn');
    const originalText = loginBtn.textContent;

    loginBtn.textContent = 'Signing in...';
    loginBtn.disabled = true;

    // Check if user exists
    const user = getUser(username);
    
    if (!user) {
        // User doesn't exist
        gsap.to(loginBtn, {
            background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
            duration: 0.5,
            onComplete: () => {
                alert('Username not found. Please check your credentials or sign up for a new account.');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        });
        return;
    }

    // Validate password
    if (user.password !== hashPassword(password)) {
        gsap.to(loginBtn, {
            background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
            duration: 0.5,
            onComplete: () => {
                alert('Invalid password. Please try again.');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        });
        return;
    }

    // Successful login
    gsap.to(loginBtn, {
        background: 'linear-gradient(135deg, #4caf50, #45a049)',
        duration: 0.5,
        onComplete: () => {
            // Set current user session
            setCurrentUser(username);
            
            alert(`Welcome back, ${user.name}! Login successful.`);
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
            form.reset();
            
            // Hide auth interface and show profile
            hideAuthInterface();
        }
    });
}

function handleSignup(form) {
    const formData = new FormData(form);
    const name = formData.get('name');
    const username = formData.get('username');
    const age = formData.get('age');
    const gender = formData.get('gender');
    const mobile = formData.get('mobile');
    const otp = formData.get('otp');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Validate OTP
    if (!validateOTP(otp)) {
        alert('Invalid OTP! Please enter the correct verification code.');
        return;
    }

    // Check if username already exists
    if (getUser(username)) {
        alert('Username already exists. Please choose a different username.');
        return;
    }

    const signupBtn = form.querySelector('.auth-btn');
    const originalText = signupBtn.textContent;

    signupBtn.textContent = 'Creating account...';
    signupBtn.disabled = true;

    // Create new user object
    const newUser = {
        username: username,
        password: hashPassword(password),
        name: name,
        age: parseInt(age),
        gender: gender,
        mobile: mobile,
        joinDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        status: "Premium Member",
        experience: "Intermediate",
        riskTolerance: "Moderate",
        preferredSectors: ["Technology", "Healthcare", "Renewable Energy"],
        investmentStyle: "Growth Investing",
        portfolioSize: "$50,000 - $100,000",
        portfolioValue: "$78,450",
        totalReturn: "+12.3%",
        holdingsCount: "18",
        diversificationScore: "85/100"
    };

    // Save user to database
    saveUser(newUser);

    // Show success animation
    gsap.to(signupBtn, {
        background: 'linear-gradient(135deg, #4caf50, #45a049)',
        duration: 0.5,
        onComplete: () => {
            // Set current user session
            setCurrentUser(username);
            
            alert(`Welcome ${name}! Your account has been created successfully.`);
            signupBtn.textContent = originalText;
            signupBtn.disabled = false;
            form.reset();
            resetOTPVerification();
            
            // Hide auth interface and show profile
            hideAuthInterface();
        }
    });
}

// Logout functionality
function handleLogout() {
    clearCurrentUser();
    alert('You have been logged out successfully.');
    switchPanel('home');
}

// OTP Verification System
let otpTimer;
let generatedOTP;
let otpExpirationTime;

function generateOTP() {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function startOTPTimer() {
    const timerElement = document.getElementById('otp-timer');
    const resendBtn = document.getElementById('resend-otp');
    let timeLeft = 120; // 2 minutes in seconds

    clearInterval(otpTimer);
    
    otpTimer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            timerElement.textContent = '00:00';
            timerElement.style.color = '#ff6b6b';
            resendBtn.disabled = false;
            generatedOTP = null;
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function validateOTP(enteredOTP) {
    if (!generatedOTP || !otpExpirationTime) {
        return false;
    }
    
    // Check if OTP is expired
    if (Date.now() > otpExpirationTime) {
        alert('OTP has expired! Please request a new one.');
        return false;
    }
    
    return enteredOTP === generatedOTP;
}

function resetOTPVerification() {
    const otpVerification = document.getElementById('otp-verification');
    const signupBtn = document.getElementById('signup-btn');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const mobileInput = document.querySelector('input[name="mobile"]');
    
    otpVerification.style.display = 'none';
    signupBtn.disabled = true;
    sendOtpBtn.disabled = false;
    mobileInput.disabled = false;
    
    clearInterval(otpTimer);
    generatedOTP = null;
    otpExpirationTime = null;
}

function initOTPVerification() {
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const resendOtpBtn = document.getElementById('resend-otp');
    const mobileInput = document.querySelector('input[name="mobile"]');
    const otpVerification = document.getElementById('otp-verification');
    const signupBtn = document.getElementById('signup-btn');

    if (!sendOtpBtn || !mobileInput) return;

    // Send OTP button click handler
    sendOtpBtn.addEventListener('click', function() {
        const mobileNumber = mobileInput.value.trim();
        
        // Validate mobile number
        if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        // Generate and send OTP (simulated)
        generatedOTP = generateOTP();
        otpExpirationTime = Date.now() + 120000; // 2 minutes from now
        
        // Show OTP verification section
        otpVerification.style.display = 'grid';
        sendOtpBtn.disabled = true;
        mobileInput.disabled = true;
        signupBtn.disabled = false;

        // Start timer
        startOTPTimer();

        // Simulate sending OTP (in real app, this would call an SMS service)
        alert(`OTP sent to ${mobileNumber}: ${generatedOTP}\n\n(This is a demo - in production, this would be sent via SMS)`);
    });

    // Resend OTP button click handler
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const mobileNumber = mobileInput.value.trim();
            generatedOTP = generateOTP();
            otpExpirationTime = Date.now() + 120000;
            
            // Restart timer
            startOTPTimer();
            this.disabled = true;

            // Simulate resending OTP
            alert(`New OTP sent to ${mobileNumber}: ${generatedOTP}\n\n(This is a demo - in production, this would be sent via SMS)`);
        });
    }

    // OTP input validation
    const otpInput = document.querySelector('input[name="otp"]');
    if (otpInput) {
        otpInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 6) {
                this.value = this.value.slice(0, 6);
            }
        });
    }

    // Password confirmation validation
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');

    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value && passwordInput.value !== this.value) {
                this.classList.add('password-mismatch');
            } else {
                this.classList.remove('password-mismatch');
            }
        });

        passwordInput.addEventListener('input', function() {
            if (confirmPasswordInput.value && this.value !== confirmPasswordInput.value) {
                confirmPasswordInput.classList.add('password-mismatch');
            } else {
                confirmPasswordInput.classList.remove('password-mismatch');
            }
        });
    }
}

// Mobile number validation
function initMobileValidation() {
    const mobileInput = document.querySelector('input[name="mobile"]');
    if (mobileInput) {
        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    }
}

// Search Functionality
function initSearch() {
    const searchForm = document.querySelector('.search-container form');

    if (!searchForm) {
        console.warn('Search form not found');
        return;
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const searchInput = this.querySelector('input');
        if (!searchInput) {
            console.warn('Search input not found');
            return;
        }

        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm) {
            // In a real application, this would connect to a backend API
            // For now, we'll just show an alert
            alert(`Searching for: ${searchTerm}`);

            // Clear the search input
            searchInput.value = '';
        }
    });
}

// Credit Score Panel Functionality
function initCreditScorePanel() {
    const creditScorePanel = document.querySelector('.credit-score-panel');
    
    if (!creditScorePanel) {
        console.warn('Credit score panel not found');
        return;
    }

    // Simulate credit score updates (in a real app, this would come from an API)
    function updateCreditScore() {
        const scoreValue = document.querySelector('.credit-score-value');
        const progressFill = document.querySelector('.progress-fill');
        const trendIcon = document.querySelector('.credit-score-trend i');
        const trendText = document.querySelector('.trend-text');
        
        if (!scoreValue || !progressFill || !trendIcon || !trendText) {
            return;
        }

        // Simulate small random changes to the credit score
        const currentScore = parseInt(scoreValue.textContent);
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 change
        const newScore = Math.max(300, Math.min(850, currentScore + change));
        
        // Update the score
        scoreValue.textContent = newScore;
        
        // Update progress bar
        const percentage = ((newScore - 300) / (850 - 300)) * 100;
        progressFill.style.width = `${percentage}%`;
        
        // Update trend indicator
        if (change > 0) {
            trendIcon.className = 'fas fa-arrow-up';
            trendIcon.style.color = '#4caf50';
            trendText.textContent = `+${change}`;
            trendText.style.color = '#4caf50';
        } else if (change < 0) {
            trendIcon.className = 'fas fa-arrow-down';
            trendIcon.style.color = '#ff6b6b';
            trendText.textContent = `${change}`;
            trendText.style.color = '#ff6b6b';
        } else {
            trendIcon.className = 'fas fa-minus';
            trendIcon.style.color = '#6c757d';
            trendText.textContent = '0';
            trendText.style.color = '#6c757d';
        }
    }

    // Add hover effect with tooltip
    creditScorePanel.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
        this.style.transform = 'scale(1.02)';
    });

    creditScorePanel.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    // Add click event for more details (could open a modal in a real app)
    creditScorePanel.addEventListener('click', function() {
        const score = document.querySelector('.credit-score-value').textContent;
        alert(`Your current credit score is ${score}. This is based on your financial health and credit history.`);
    });

    // Simulate periodic updates (every 30 seconds)
    setInterval(updateCreditScore, 30000);
}

// Profile Panel Functionality
function initProfilePanel() {
    const profilePanel = document.getElementById('profile');
    
    if (!profilePanel) {
        console.warn('Profile panel not found');
        return;
    }

    // Initialize profile 3D animation
    initProfile3DAnimation();

    // Set up profile interaction handlers
    setupProfileInteractions();

    // Load user data (simulated for demo)
    loadUserData();
}

function initProfile3DAnimation() {
    const container = document.getElementById('profile-3d-container');
    if (!container) {
        console.warn('Profile 3D container not found');
        return;
    }

    try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = null;

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create portfolio visualization - pie chart representation
        const portfolioData = [
            { value: 35, color: 0x2a52be, label: 'Tech' },
            { value: 25, color: 0x4caf50, label: 'Healthcare' },
            { value: 20, color: 0xff6b6b, label: 'Energy' },
            { value: 15, color: 0xffd700, label: 'Finance' },
            { value: 5, color: 0x9c27b0, label: 'Other' }
        ];

        const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
        const group = new THREE.Group();
        scene.add(group);

        let startAngle = 0;
        portfolioData.forEach((item, index) => {
            const angle = (item.value / totalValue) * Math.PI * 2;
            const radius = 1.5;
            
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.arc(0, 0, radius, startAngle, startAngle + angle, false);
            shape.lineTo(0, 0);
            
            const geometry = new THREE.ShapeGeometry(shape);
            const material = new THREE.MeshPhongMaterial({
                color: item.color,
                transparent: true,
                opacity: 0.9,
                shininess: 100
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.y = 0.1 * index;
            
            group.add(mesh);
            startAngle += angle;
        });

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Add floating percentage labels (simplified representation)
        const floatingLabels = [];
        startAngle = 0;
        
        portfolioData.forEach((item, index) => {
            const angle = (item.value / totalValue) * Math.PI * 2;
            const midAngle = startAngle + angle / 2;
            const radius = 2;
            
            const percentage = (item.value / totalValue) * 100;
            const labelGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const labelMaterial = new THREE.MeshPhongMaterial({
                color: item.color,
                emissive: item.color,
                emissiveIntensity: 0.3
            });
            
            const label = new THREE.Mesh(labelGeometry, labelMaterial);
            label.position.set(
                Math.cos(midAngle) * radius,
                0.1 * index,
                Math.sin(midAngle) * radius
            );
            
            scene.add(label);
            floatingLabels.push({
                mesh: label,
                percentage: percentage,
                speed: Math.random() * 0.02 + 0.01
            });
            
            startAngle += angle;
        });

        // Animation function
        function animate() {
            requestAnimationFrame(animate);

            // Rotate the entire portfolio visualization
            group.rotation.y += 0.005;

            // Animate floating labels
            floatingLabels.forEach((label, index) => {
                label.mesh.position.y += Math.sin(Date.now() * label.speed) * 0.01;
                label.mesh.rotation.y += 0.02;
            });

            // Move camera around the visualization
            const time = Date.now() * 0.0005;
            camera.position.x = Math.sin(time) * 3;
            camera.position.z = 5 + Math.cos(time * 0.7) * 1;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Start animation
        animate();
    } catch (error) {
        console.error("Error initializing profile 3D animation:", error);
    }
}

function setupProfileInteractions() {
    const editBtn = document.querySelector('.edit-profile-btn');
    const saveBtn = document.querySelector('.save-profile-btn');
    const settingsSwitches = document.querySelectorAll('.switch input');

    if (editBtn) {
        editBtn.addEventListener('click', function() {
            toggleProfileEditMode(true);
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            toggleProfileEditMode(false);
            saveProfileChanges();
        });
    }

    // Settings switches functionality
    settingsSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const settingName = this.parentElement.nextElementSibling.textContent;
            console.log(`${settingName} ${this.checked ? 'enabled' : 'disabled'}`);
            
            // Show feedback animation
            const slider = this.nextElementSibling;
            gsap.to(slider, {
                scale: 1.2,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        });
    });
}

function toggleProfileEditMode(editMode) {
    const infoItems = document.querySelectorAll('.info-item span');
    const editBtn = document.querySelector('.edit-profile-btn');
    const saveBtn = document.querySelector('.save-profile-btn');

    if (editMode) {
        // Switch to edit mode
        infoItems.forEach(item => {
            item.contentEditable = true;
            item.style.borderBottom = '2px dashed var(--primary-color)';
            item.style.padding = '2px 4px';
            item.style.minWidth = '100px';
        });
        
        editBtn.style.display = 'none';
        saveBtn.style.display = 'flex';
        
        // Show edit mode animation
        gsap.to('.profile-card', {
            y: -10,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });
    } else {
        // Switch to view mode
        infoItems.forEach(item => {
            item.contentEditable = false;
            item.style.borderBottom = 'none';
            item.style.padding = '0';
            item.style.minWidth = 'auto';
        });
        
        editBtn.style.display = 'flex';
        saveBtn.style.display = 'none';
        
        // Show save confirmation animation
        gsap.to('.profile-card', {
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });
        
        // Show save success indicator
        const saveIndicator = document.createElement('div');
        saveIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 1000;
            font-weight: 600;
        `;
        saveIndicator.textContent = 'Profile saved successfully!';
        document.body.appendChild(saveIndicator);
        
        setTimeout(() => {
            gsap.to(saveIndicator, {
                opacity: 0,
                y: -50,
                duration: 0.5,
                onComplete: () => saveIndicator.remove()
            });
        }, 2000);
    }
}

function saveProfileChanges() {
    // In a real application, this would send data to a backend API
    // For demo purposes, we'll just log the changes
    const userData = {
        fullName: document.getElementById('profile-fullname').textContent,
        email: document.getElementById('profile-email-detail').textContent,
        phone: document.getElementById('profile-phone').textContent,
        location: document.getElementById('profile-location').textContent
    };
    
    console.log('Profile changes saved:', userData);
}

function loadUserData() {
    // Simulated user data - in a real app, this would come from an API
    const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        fullName: "John Michael Doe",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        status: "Premium Member",
        memberSince: "Jan 2023",
        joinDate: "January 15, 2023",
        experience: "Intermediate",
        riskTolerance: "Moderate",
        preferredSectors: ["Technology", "Healthcare", "Renewable Energy"],
        investmentStyle: "Growth Investing",
        portfolioSize: "$50,000 - $100,000",
        portfolioValue: "$78,450",
        totalReturn: "+12.3%",
        holdingsCount: "18",
        diversificationScore: "85/100"
    };

    // Update profile elements with user data
    document.getElementById('profile-name').textContent = userData.name;
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-fullname').textContent = userData.fullName;
    document.getElementById('profile-email-detail').textContent = userData.email;
    document.getElementById('profile-phone').textContent = userData.phone;
    document.getElementById('profile-location').textContent = userData.location;
    
    // Update member since
    document.querySelector('.member-since').textContent = `Member since: ${userData.memberSince}`;
}

// Initialize credit score panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D elements
    try {
        initHero3D();
        initCard3D();
        initTradingFloor3D();
        initGraph3D();

        // Initialize animations
        initAnimations();

        // Initialize navigation highlighting
        initNavHighlighting();

        // Initialize search functionality
        initSearch();

        // Initialize authentication animation
        initAuthAnimation();

        // Initialize OTP verification system
        initOTPVerification();

        // Initialize mobile number validation
        initMobileValidation();

        // Initialize credit score panel
        initCreditScorePanel();

        // Initialize profile panel
        initProfilePanel();
    } catch (error) {
        console.error("Initialization error:", error);
    }
});
