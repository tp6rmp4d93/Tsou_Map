// ==========================================
// 1. 定義 WMTS 底圖圖層
// ==========================================

// [內政部國土測繪中心] RESTful WMTS 格式
const nlscUrl = 'https://wmts.nlsc.gov.tw/wmts/{id}/default/GoogleMapsCompatible/{z}/{y}/{x}';
const photo_mix = L.tileLayer(nlscUrl.replace('{id}', 'PHOTO_MIX'), { maxZoom: 20, attribution: '© 內政部國土測繪中心' });
const photo2 = L.tileLayer(nlscUrl.replace('{id}', 'PHOTO2'), { maxZoom: 20, attribution: '© 內政部國土測繪中心' });

// [中央研究院] KVP WMTS 格式 (使用 image/png 確保線條與透明度品質)
const sinicaUrl = 'https://gis.sinica.edu.tw/tileserver/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={id}&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png';
const jm50k_1916 = L.tileLayer(sinicaUrl.replace('{id}', 'JM50K_1916'), { maxZoom: 20, attribution: '© 中央研究院' });
const landuse250k_1956 = L.tileLayer(sinicaUrl.replace('{id}', '1956_Landuse_250K_1'), { maxZoom: 20, attribution: '© 中央研究院' });
const tm250k_1963 = L.tileLayer(sinicaUrl.replace('{id}', 'TM250K_1963'), { maxZoom: 20, attribution: '© 中央研究院' });
const tm25k_1993 = L.tileLayer(sinicaUrl.replace('{id}', 'TM25K_1993'), { maxZoom: 20, attribution: '© 中央研究院' });

// 定義底圖清單 (單選)
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

// 建立地圖，預設套用「正射影像混合圖」
const map = L.map('map', {
    center: [23.5, 121.0],
    zoom: 7,
    layers: [photo_mix] 
});

// 加入圖層控制器 (右上角)
const overlayMaps = {}; // KML 圖層將動態加入此處
const layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// ==========================================
// 3. 載入 KML 檔案與屬性綁定
// ==========================================

function loadKML(filePath, layerName) {
    const kmlLayer = omnivore.kml(filePath)
        .on('ready', function() {
            // 自動縮放至圖層邊界 (若同時載入多個，會以最後載入的圖層範圍為主)
            map.fitBounds(kmlLayer.getBounds());
            
            // 綁定屬性資料至 Popup
            kmlLayer.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties) {
                    let popupContent = `<div style="max-height: 200px; overflow-y: auto;">
                                        <h3 style="margin:0 0 8px 0; font-size:16px; border-bottom:1px solid #ccc;">${layerName}</h3>`;
                    
                    for (let key in layer.feature.properties) {
                        if (key !== 'styleUrl' && key !== 'styleHash') {
                            const val = layer.feature.properties[key];
                            // 若屬性值包含 HTML 或描述，直接渲染；若為純文字則加上標題
                            popupContent += `<div style="margin-bottom: 4px;"><b>${key}</b>: ${val}</div>`;
                        }
                    }
                    popupContent += '</div>';
                    layer.bindPopup(popupContent);
                }
            });
            
            // 將解析完畢的 KML 加入地圖與右上角控制器 (可複選)
            layerControl.addOverlay(kmlLayer, layerName);
            kmlLayer.addTo(map);
        })
        .on('error', function(e) {
            console.error(`無法載入 KML: ${filePath}`, e);
        });
}

// 執行載入 (請確保 KML 檔案位於 GitHub 專案的 data/ 目錄下)
loadKML('data/Landmark.kml', '📍 調查地標 (Landmark)');
loadKML('data/Tsou_Map.kml', '🗺️ 鄒族領域 (Tsou Map)');
