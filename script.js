document.addEventListener("DOMContentLoaded", function() {
    try {
        // ==========================================
        // 1. 定義 WMTS 底圖圖層
        // ==========================================
        
        // [內政部國土測繪中心]
        const nlscUrl = 'https://wmts.nlsc.gov.tw/wmts/{id}/default/GoogleMapsCompatible/{z}/{y}/{x}';
        const photo_mix = L.tileLayer(nlscUrl, { id: 'PHOTO_MIX', maxZoom: 20, maxNativeZoom: 19, attribution: '© 內政部國土測繪中心' });
        const photo2 = L.tileLayer(nlscUrl, { id: 'PHOTO2', maxZoom: 20, maxNativeZoom: 19, attribution: '© 內政部國土測繪中心' });
        
        // [中央研究院] 使用官方 PHP API 介接 (file-exists.php)
        const sinicaPhpUrl = 'https://gis.sinica.edu.tw/tileserver/file-exists.php?img={id}-{ext}-{z}-{x}-{y}';
        const taiwanBounds = [[21.5, 119.5], [25.5, 122.5]];
        
        // 原有圖層
        const jm50k_1916 = L.tileLayer(sinicaPhpUrl, { id: 'JM50K_1916', ext: 'png', maxZoom: 20, maxNativeZoom: 15, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const landuse250k_1956 = L.tileLayer(sinicaPhpUrl, { id: '1956_Landuse_250K_1', ext: 'jpg', maxZoom: 20, maxNativeZoom: 12, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const tm250k_1963 = L.tileLayer(sinicaPhpUrl, { id: 'TM250K_1963', ext: 'jpg', maxZoom: 20, maxNativeZoom: 12, bounds: taiwanBounds, attribution: '© 中央研究院' });
        
        // 新增的 6 個歷史地圖圖層 (依比例尺與年代設定適當的 maxNativeZoom)
        const jm200k_1897 = L.tileLayer(sinicaPhpUrl, { id: 'JM200K_1897_new', ext: 'jpg', maxZoom: 20, maxNativeZoom: 11, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const jm300k_1939 = L.tileLayer(sinicaPhpUrl, { id: 'JM300K_1939', ext: 'jpg', maxZoom: 20, maxNativeZoom: 11, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const tm100k_1987 = L.tileLayer(sinicaPhpUrl, { id: 'TM100K_1987', ext: 'jpg', maxZoom: 20, maxNativeZoom: 13, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const tm25k_1989 = L.tileLayer(sinicaPhpUrl, { id: 'TM25K_1989', ext: 'png', maxZoom: 20, maxNativeZoom: 16, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const tm25k_1993 = L.tileLayer(sinicaPhpUrl, { id: 'TM25K_1993', ext: 'png', maxZoom: 20, maxNativeZoom: 16, bounds: taiwanBounds, attribution: '© 中央研究院' });
        const tm25k_2003 = L.tileLayer(sinicaPhpUrl, { id: 'TM25K_2003', ext: 'png', maxZoom: 20, maxNativeZoom: 16, bounds: taiwanBounds, attribution: '© 中央研究院' });
        
        // 定義底圖清單 (已包含新加入的圖層)
        const baseMaps = {
            "最新正射影像混合圖 (NLSC)": photo_mix,
            "最新正射影像 (NLSC)": photo2,
            "1897 假製二十萬分一圖": jm200k_1897,
            "1916 蕃地地形圖": jm50k_1916,
            "1939 臺灣全圖(第五版)": jm300k_1939,
            "1956 土地利用圖": landuse250k_1956,
            "1963 台灣省地形圖": tm250k_1963,
            "1987 臺灣地形圖 (1:100k)": tm100k_1987,
            "1989 經建1版地形圖": tm25k_1989,
            "1993 經建2版地形圖": tm25k_1993,
            "2003 經建4版地形圖": tm25k_2003
        };

        // ==========================================
        // 2. 初始化地圖與圖層控制器
        // ==========================================
        const map = L.map('map', {
            center: [23.5, 121.0],
            zoom: 7,
            layers: [photo_mix] 
        });

        const layerControl = L.control.layers(baseMaps, {}, { collapsed: false }).addTo(map);

        // ==========================================
        // 3. 安全載入 KML 檔案
        // ==========================================
        function loadKML(filePath, layerName) {
            const kmlLayer = omnivore.kml(filePath)
                .on('ready', function() {
                    map.fitBounds(kmlLayer.getBounds());
                    
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
                    console.error(`無法載入 KML: ${filePath}`, e);
                });
        }

        loadKML('data/Landmark.kml', '📍 調查地標 (Landmark)');
        loadKML('data/Tsou_Map.kml', '🗺️ 鄒族領域 (Tsou Map)');

    } catch (err) {
        document.getElementById('map').innerHTML = `<div style="padding: 20px; color: red;"><h2>地圖初始化失敗</h2><p>${err.message}</p></div>`;
        console.error("地圖錯誤:", err);
    }
});
