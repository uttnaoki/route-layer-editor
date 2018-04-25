const map = L.map('map').setView(
  [34.80501, 133.755],
  9
);
// マップタイルの設定
L.tileLayer(
  'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(map);

let latlngs = [];
let pre_latlngs;
map.on('click', (e) => {
    const latitude = (Math.round(e.latlng.lat * 10000)) /10000;
    const longitude = (Math.round(e.latlng.lng * 10000)) /10000;
    const this_latlngs = [latitude, longitude];

    latlngs.push(this_latlngs)

    // 1回目のクリック時(pre_latlngs == undifined)にパス描画処理をしない．
    if (pre_latlngs) {
      this_path = [pre_latlngs, this_latlngs]
      // パス描画処理
      L.polyline(this_path, {color: 'red'}).addTo(map);
    }
    pre_latlngs = this_latlngs;
});

// content の内容でファイルを作成し，ダウンロードする．
const download_file = (content, format) => {
  const mimeType = 'text/plain';
  const download_file_name = `pathdata.${format}`;

  // BOMは文字化け対策
  const bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, content], {type : mimeType});

  const a_tag = document.createElement('a');
  a_tag.download = download_file_name;
  a_tag.target   = '_blank';

  // 各ブラウザに対応したダウンロード処理
  if (window.navigator.msSaveBlob) {
    // for IE
    window.navigator.msSaveBlob(blob, download_file_name)
  }
  else if (window.URL && window.URL.createObjectURL) {
    // for Firefox
    a_tag.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a_tag);
    a_tag.click();
    document.body.removeChild(a_tag);
  }
  else if (window.webkitURL && window.webkitURL.createObject) {
    // for Chrome
    a_tag.href = window.webkitURL.createObjectURL(blob);
    a_tag.click();
  }
  else {
    // for Safari
    window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
  }
}

// csv形式で座標データを作成し，ダウンロードする．
$( '#download-button_csv' ).click( () => {
	let content = '';
  for (const latlng of latlngs) {
    const lat = latlng[0];
    const lng = latlng[1];
    content += `${lat}, ${lng}\n`;
  }
  download_file(content, 'csv')
} );

// kml形式で座標データを作成し，ダウンロードする．
$( '#download-button_kml' ).click( () => {
	let content = '';
  for (const latlng of latlngs) {
    const lat = latlng[0];
    const lng = latlng[1];
    content += `${lng}, ${lat}, 0\n`;
  }

  const kml_s = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://earth.google.com/kml/2.0"> <Document><Placemark><LineString><coordinates>'
  const kml_f = '</coordinates></LineString></Placemark></Document></kml>'

  const kml_content = kml_s + content + kml_f;
  download_file(kml_content, 'kml')
} );
