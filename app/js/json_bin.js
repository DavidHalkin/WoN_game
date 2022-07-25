new WoN();

function WoN() {

    const container = document.querySelector('.canvas_container');
    const BASE = '/ajax?c=map&do=';
    const RANGE = '&min_x=1&min_y=1&max_x=2182&max_y=1048';

    const API = [
        { name: 'terrain', url: `${BASE}get_map_terrain${RANGE}` },
        { name: 'nature', url: `${BASE}get_map_terra_objects${RANGE}` },
        { name: 'cities', url: `${BASE}get_map_objects${RANGE}` },
        { name: 'climate', url: `${BASE}get_map_colors&mode=climate${RANGE}` },
        { name: 'geo', url: `${BASE}get_map_resurs&mode=geo${RANGE}` },
        { name: 'animals', url: `${BASE}get_map_resurs&mode=nature${RANGE}` },
        { name: 'ethnic', url: `${BASE}get_map_resurs&mode=ethnic${RANGE}` },
        { name: 'religion', url: `${BASE}get_map_resurs&mode=religion${RANGE}` },
        { name: 'polytics', url: `${BASE}get_map_resurs&mode=polytics${RANGE}` },
        { name: 'vassals', url: `${BASE}get_map_resurs&mode=vassals${RANGE}` },
        { name: 'trade', url: `${BASE}get_map_resurs&mode=trade${RANGE}` }
    ];

    API.forEach(endpoint => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = function() {
            loadMap(endpoint);
        };
        btn.innerText = endpoint.name;
        container.insertAdjacentElement('beforeend', btn);
    });

    function loadMap(endpoint) {

        console.log(endpoint.url);
        console.log('loading...');

        fetch(endpoint.url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (res.ok) {
                    res.json().then(res => {

                        console.log('done');
                        console.log('============');

                        saveDataAsBinaryFile(res, endpoint.name);

                    });
                } else {
                    res.json().then(res => {
                        console.log(res);
                    });
                }
            });

    }

    function saveDataAsBinaryFile(data, name) {

        const bytes = msgpack.serialize(data);
        downloadBlob(bytes, `${name}.bin`, 'application/octet-stream');

        function downloadBlob(data, fileName, mimeType) {

            var blob, url;
            blob = new Blob([data], {
                type: mimeType
            });
            url = window.URL.createObjectURL(blob);
            downloadURL(url, fileName);
            setTimeout(function() {
                return window.URL.revokeObjectURL(url);
            }, 1000);

        };

        function downloadURL(data, fileName) {

            const a = document.createElement('a');
            a.href = data;
            a.download = fileName;
            document.body.appendChild(a);
            a.style = 'display: none';
            a.click();
            a.remove();

        };

    }

}
