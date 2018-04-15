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
  const link = document.createElement( 'a' );
  link.href = window.URL.createObjectURL( new Blob( [content] ) );
  link.download = `pathdata.${format}`;
  link.click();
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
