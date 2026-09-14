document.addEventListener("DOMContentLoaded", function() {
    try {
        // ==========================================
        // 1. 定義 WMTS 底圖圖層
        // ==========================================
        
        // [內政部國土測繪中心]
        const nlscUrl = 'https://wmts.nlsc.gov.tw/wmts/{id}/default/GoogleMapsCompatible/{z}/{y}/{x}';
        const photo_mix = L.tileLayer(nlscUrl, { id: 'PHOTO_MIX', maxZoom: 20, maxNativeZoom: 19, attribution: '© 內政部國土測繪中心' });
        const photo2 = L.tileLayer(nlscUrl, { id: 'PHOTO2', maxZoom: 20, maxNativeZoom: 19, attribution: '© 內政部國土測繪中心' });
        
        // [中央研究院] 改用官方底層 PHP API (file-exists.php) 徹底解決 500 錯誤
        const sinicaPhpUrl = 'https://gis.sinica.edu.tw/tileserver/file-exists.php?img={id}-{ext}-{z}-{x}-{y}';
        
        const jm50k_1916 = L.tileLayer(sinicaPhpUrl, { 
            id: 'JM50K_1916', 
            ext: 'png', // 若破圖可改為 jpg
            maxZoom: 20, 
            maxNativeZoom: 15, 
            attribution: '© 中央研究院' 
        });
        
        const landuse250k_1956 = L.tileLayer(sinicaPhpUrl, { 
            id: '1956_Landuse_250K_1', 
            ext: 'jpg', // 土地利用圖通常為 jpg
            maxZoom: 20, 
            maxNativeZoom: 12, 
            attribution: '© 中央研究院' 
        });
        
        const tm250k_1963 = L.tileLayer(sinicaPhpUrl, { 
            id: 'TM250K_1963', 
            ext: 'jpg', 
            maxZoom: 20, 
            maxNativeZoom: 12, 
            attribution: '© 中央研究院' 
        });
        
        const tm25k_1993 = L.tileLayer(sinicaPhpUrl, { 
            id: 'TM25K_1993', 
            ext: 'png', 
            maxZoom: 20, 
            maxNativeZoom: 16, 
            attribution: '© 中央研究院' 
        });
        
        // 定義底圖清單
        const baseMaps = {
            "最新正射影像混合圖 (NLSC)": photo_mix,
            "最新正射影像 (NLSC)": photo2,
            "1916年 蕃地地形圖 (中研院)": jm50k_1916,
            "1956年 土地利用圖 (中研院)": landuse250k_1956,
            "1963年 台灣省地形圖 (中研院)": tm250k_1963,
            "1993年 經建版地形圖 (中研院)": tm25k_1993
        };

        const baseMaps = {
            "最新正射影像混合圖 (NLSC)": photo_mix,
            "最新正射影像 (NLSC)": photo2,
            "1916年 蕃地地形圖 (中研院)": jm50k_1916,
            "1956年 土地利用圖 (中研院)": landuse250k_1956,
            "1963年 台灣省地形圖 (中研院)": tm250k_1963,
            "1993年 經建版地形圖 (中研院)": tm25k_1993
        };

        // ==========================================
        // 2. 初始化地圖與圖層控制器
        // ==========================================
        const map = L.map('map', {
            center: [23.5, 121.0],
            zoom: 7,
            layers: [photo_mix] // 預設底圖
        });

        const layerControl = L.control.layers(baseMaps, {}, { collapsed: false }).addTo(map);

        // ==========================================
        // 3. 安全載入 KML 檔案
        // ==========================================
        function loadKML(filePath, layerName) {
            const kmlLayer = omnivore.kml(filePath)
                .on('ready', function() {
                    map.fitBounds(kmlLayer.getBounds());
                    
                    // 綁定屬性資料至 Popup
                    kmlLayer.eachLayer(function(layer) {
                        if (layer.feature && layer.feature.properties) {
                            let popupContent = `<div style="max-height: 200px; overflow-y: auto;"><b>${layerName}</b><br><hr>`;
                            for (let key in layer.feature.properties) {
                                if (key !== 'styleUrl' && key !== 'styleHash') {
                                    popupContent += `<b>${key}</b>: ${layer.feature.properties[key]}<br>`;
                                }
                            }
                            popupContent += '</div>';
                            layer.bindPopup(popupContent);
                        }
                    });
                    
                    layerControl.addOverlay(kmlLayer, layerName);
                    kmlLayer.addTo(map);
                })
                .on('error', function(e) {
                    console.error(`無法載入 KML: ${filePath}，請檢查檔案是否存在或路徑大小寫是否正確。`, e);
                    alert(`KML 載入失敗: ${filePath}\n請按 F12 查看主控台詳細錯誤。`);
                });
        }

        // 執行載入
        loadKML('data/Landmark.kml', '📍 調查地標 (Landmark)');
        loadKML('data/Tsou_Map.kml', '🗺️ 鄒族領域 (Tsou Map)');

    } catch (err) {
        // 如果連 Leaflet 初始化都失敗，將錯誤直接印在網頁畫面上
        document.getElementById('map').innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
            <h2>地圖初始化失敗</h2>
            <p>${err.message}</p>
        </div>`;
        console.error("地圖嚴重錯誤:", err);
    }
});
