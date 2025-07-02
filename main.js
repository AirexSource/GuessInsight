// ==UserScript==
// @name         OpenGuessr Location Viewer
// @namespace    https://openguessr.com/
// @version      1.0
// @description  Displays location from game in Google Maps (press 1). Auto-updates. Draggable and closable.
// @match        https://openguessr.com/*
// @grant        GM_addStyle
// @author       https://github.com/AirexSource
// @license      MIT
// ==/UserScript==

(function () {
    'use strict'; // Ensure the script runs in strict mode

    // Add CSS styles for the map window

    // Using GM_addStyle to inject styles for the map window
    // This allows for a draggable, closable window that displays Google Maps
    // The window will appear at the bottom left of the screen with a fixed size
    // It includes a header with a close button and an iframe to display the map
    GM_addStyle(`
        #mapWindow {
            position: fixed;
            bottom: 110px; /* spawn 100px higher */
            left: 10px;
            width: 500px;
            height: 370px;
            background: white;
            border: 1px solid #aaa;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 9999;
        }

        #mapHeader, #mapFooter {
            background: #f0f0f0;
            padding: 5px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            font-size: 16px;
        }

        #mapHeader {
            cursor: move;
        }

        #mapClose {
            background: red;
            color: white;
            border: none;
            padding: 3px 8px;
            border-radius: 3px;
            cursor: pointer;
        }

        #mapIframe {
            width: 100%;
            height: calc(100% - 60px);
            border: none;
        }

        #mapFooter a {
            color: #333;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
        }

        #mapFooter a:hover {
            text-decoration: underline;
        }
    `);

    // Main script logic
    // This script listens for the '1' key press to open a map window
    // It retrieves the location from the game iframe and updates the map accordingly
    // The map window can be dragged around and closed
    let mapWindow = null;
    let lastLocation = null;
    const zoom = 3;
    let dragging = false, offsetX = 0, offsetY = 0;

    // Function to get the location from the game iframe
    // It retrieves the 'location' parameter from the iframe's URL
    // If the iframe is not found or the URL is malformed, it returns null
    function getLocation() {
        try {
            const iframe = document.querySelector('#PanoramaIframe');
            if (!iframe) return null;
            const url = new URL(iframe.src);
            return url.searchParams.get('location');
        } catch {
            return null;
        }
    }

    // Function to create the map window
    // It checks if a location is provided, then creates a draggable window with an iframe
    // The iframe displays the Google Maps location based on the provided coordinates
    // The window can be closed and will update the map if the location changes
    function createMapWindow(location) {
        if (!location) return;

        if (mapWindow) {
            document.querySelector('#mapIframe').src = `https://www.google.com/maps?q=${location}&output=embed&z=${zoom}`;
            return;
        }

        mapWindow = document.createElement('div');
        mapWindow.id = 'mapWindow';

        const mapHeader = document.createElement('div');
        mapHeader.id = 'mapHeader';
        mapHeader.textContent = 'Google Maps Location';

        const mapClose = document.createElement('button');
        mapClose.id = 'mapClose';
        mapClose.textContent = 'Close';
        mapClose.onclick = () => {
            mapWindow.remove();
            mapWindow = null;
            lastLocation = null;
        };

        mapHeader.appendChild(mapClose);
        mapWindow.appendChild(mapHeader);

        const iframe = document.createElement('iframe');
        iframe.id = 'mapIframe';
        iframe.src = `https://www.google.com/maps?q=${location}&output=embed&z=${zoom}`;
        mapWindow.appendChild(iframe);

        const mapFooter = document.createElement('div');
        mapFooter.id = 'mapFooter';
        mapFooter.innerHTML = `<a href="https://github.com/AirexSource" target="_blank">Made by AirexSource</a>`;
        mapWindow.appendChild(mapFooter);

        document.body.appendChild(mapWindow);

        mapHeader.addEventListener('mousedown', (e) => {
            dragging = true;
            offsetX = e.clientX - mapWindow.offsetLeft;
            offsetY = e.clientY - mapWindow.offsetTop;
        });
        document.addEventListener('mouseup', () => dragging = false);
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            mapWindow.style.left = (e.clientX - offsetX) + 'px';
            mapWindow.style.top = (e.clientY - offsetY) + 'px';
            mapWindow.style.bottom = 'auto';
        });
    }

    // Event listener for keydown events
    // It listens for the '1' key to trigger the map window creation
    // If a location is found, it creates the map window and updates the last location
    // It also sets an interval to update the map if the location changes
    document.addEventListener('keydown', (e) => {
        if (e.key === '1') {
            const location = getLocation();
            if (location) {
                createMapWindow(location);
                lastLocation = location;
            }
        }
    });

    // Set an interval to check for location changes every second
    // If the location changes, it updates the map iframe source
    // This ensures that the map reflects the current game location
    // It also checks if the map window is open before updating
    setInterval(() => {
        const newLoc = getLocation();
        if (newLoc && newLoc !== lastLocation && mapWindow) {
            document.querySelector('#mapIframe').src = `https://www.google.com/maps?q=${newLoc}&output=embed&z=${zoom}`;
            lastLocation = newLoc;
        }
    }, 1000);
})();


// This script only operates on the OpenGuessr website. It does not interfere with other sites or applications.
// The script author does not take responsibility for any misuse or unintended consequences of this script.
// Use at your own risk. The script is provided as-is without any warranties.


// End of the file