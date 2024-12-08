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

// Sample data for markers (replace with actual data)
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

// Initialize filters
const countrySelect = document.getElementById('country-select');
const countries = [...new Set(markers.map(marker => marker.country))].sort();

// Populate country dropdown
countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
});

// Handle country filter
countrySelect.addEventListener('change', (e) => {
    const selectedCountry = e.target.value;
    // Add filter logic here
});

// Connect Wallet Button
document.querySelector('.btn-connect-wallet').addEventListener('click', async () => {
    // Add wallet connection logic here
    console.log('Connecting to Solana wallet...');
});

// Make the map responsive
window.addEventListener('resize', () => {
    map.invalidateSize();
});
