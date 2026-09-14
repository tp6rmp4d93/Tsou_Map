// ==========================================
// 1. 定義 WMTS 底圖圖層
// ==========================================

// [內政部國土測繪中心] RESTful WMTS 格式
const nlscUrl = 'https://wmts.nlsc.gov.tw/wmts/{id}/default/GoogleMapsCompatible/{z}/{y}/{x}';
const photo_mix = L.tileLayer(nlscUrl.replace('{id}', 'PHOTO_MIX'), { maxZoom: 20, maxNativeZoom: 19, attribution: '© 內政部國土測繪中心' });
const photo2 = L.tileLayer(nlscUrl.replace('{id}', 'PHOTO2'), { maxZoom: 20, maxNativeZoom: 19, attribution: '© 內政部國土測繪中心' });

// [中央研究院] KVP WMTS 格式 
// 修正：FORMAT 必須改為 image/jpeg，因為中研院的底圖多半是 JPG 格式
const sinicaUrl = 'https://gis.sinica.edu.tw/tileserver/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={id}&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg';

// 修正：加入 maxNativeZoom，歷史地圖比例尺較小，超過最大層級時改用影像拉伸
const jm50k_1916 = L.tileLayer(sinicaUrl.replace('{id}', 'JM50K_1916'), { 
    maxZoom: 20, 
    maxNativeZoom: 15, // 1:50,000 圖資約支援至 z15
    attribution: '© 中央研究院' 
});

const landuse250k_1956 = L.tileLayer(sinicaUrl.replace('{id}', '1956_Landuse_250K_1'), { 
    maxZoom: 20, 
    maxNativeZoom: 12, // 1:250,000 圖資約支援至 z12
    attribution: '© 中央研究院' 
});

const tm250k_1963 = L.tileLayer(sinicaUrl.replace('{id}', 'TM250K_1963'), { 
    maxZoom: 20, 
    maxNativeZoom: 12, // 1:250,000 圖資約支援至 z12
    attribution: '© 中央研究院' 
});

const tm25k_1993 = L.tileLayer(sinicaUrl.replace('{id}', 'TM25K_1993'), { 
    maxZoom: 20, 
    maxNativeZoom: 16, // 1:25,000 圖資約支援至 z16
    attribution: '© 中央研究院' 
});

// 定義底圖清單 (單選)
const baseMaps = {
    "最新正射影像混合圖 (NLSC)": photo_mix,
    "最新正射影像 (NLSC)": photo2,
    "1916年 蕃地地形圖 (中研院)": jm50k_1916,
    "1956年 土地利用圖 (中研院)": landuse250k_1956,
    "1963年 台灣省地形圖 (中研院)": tm250k_1963,
    "1993年 經建版地形圖 (中研院)": tm25k_1993
};
