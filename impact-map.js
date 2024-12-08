// Impact Map Component
class ImpactMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        // Create the component structure
        this.container.innerHTML = `
            <div class="impact-map-container">
                <div class="impact-map-header">
                    <h2>SOuL IMPACT MAP</h2>
                    <p class="subtitle">Transparent forest growing on Solana</p>
                    <p class="description">Verifiable anytime. Creating real_biz impact.</p>
                    <div class="search-bar">
                        <input type="text" placeholder="Search your wallet and impact...">
                    </div>
                </div>

                <div class="impact-map-content">
                    <div class="sidebar-left">
                        <div class="action-buttons">
                            <button class="btn-free-data">Free Data</button>
                            <button class="btn-buy-data">Buy Data</button>
                            <button class="btn-publish">Publish Study</button>
                            <button class="btn-connect-wallet">Connect Solana Wallet</button>
                        </div>
                    </div>

                    <div id="map" class="map-container"></div>

                    <div class="sidebar-right">
                        <div class="filters">
                            <div class="filter-group">
                                <label>Country:</label>
                                <select id="country-select">
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Year Grown</label>
                                <div class="year-filter"></div>
                            </div>
                            <div class="filter-group">
                                <label>Forest Purpose</label>
                                <div class="forest-purpose-filter"></div>
                            </div>
                            <div class="filter-group">
                                <label>Fruit Tree</label>
                                <div class="fruit-tree-filter"></div>
                            </div>
                            <div class="filter-group">
                                <label>Agroindustrial Crops</label>
                                <div class="agro-crops-filter"></div>
                            </div>
                            <div class="filter-group">
                                <label>NT Forest Products</label>
                                <div class="nt-forest-filter"></div>
                            </div>
                        </div>
                        <div class="store-badges">
                            <span>Soon in</span>
                            <a href="#" class="app-store-badge"><img src="assets/app-store.png" alt="App Store"></a>
                            <a href="#" class="play-store-badge"><img src="assets/play-store.png" alt="Play Store"></a>
                        </div>
                        <div class="mobile-preview">
                            <img src="assets/mobile-preview.png" alt="Mobile App Preview">
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initMap();
        this.initEventListeners();
    }

    initMap() {
        // Initialize the map
        const map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 10,
            zoomControl: false
        });

        // Custom dark style for the map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Sample data for markers
        const markers = [
            { lat: 35.6762, lng: 139.6503, country: 'Japan' },
            { lat: 14.5995, lng: 120.9842, country: 'Philippines' },
            { lat: 6.5244, lng: 3.3792, country: 'Nigeria' }
        ];

        // Custom icon for markers
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #2A9D8F; border-radius: 50%; width: 20px; height: 20px;"></div>',
            iconSize: [20, 20]
        });

        // Add markers to the map
        markers.forEach(marker => {
            L.marker([marker.lat, marker.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(marker.country);
        });

        // Make the map responsive
        window.addEventListener('resize', () => {
            map.invalidateSize();
        });
    }

    initEventListeners() {
        // Connect Wallet Button
        const connectWalletBtn = this.container.querySelector('.btn-connect-wallet');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', async () => {
                console.log('Connecting to Solana wallet...');
            });
        }

        // Other button listeners can be added here
    }
}

// Export the component
window.ImpactMap = ImpactMap;
