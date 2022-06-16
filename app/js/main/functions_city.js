let city_build_id = 0;

function renew_city_map() {
    let cityID = '';
    if (city_build_id) cityID = `?city_id=${city_build_id}`;

    let url = `/ajax?c=city&do=city_builds${cityID}`;
    if (dev) url = '/cache/map/city2.json';

    fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (res.ok) {
                res.json().then(res => map.buildings.update(res.build_list));
            } else {
                res.json().then(res => console.log(res));
            }
        });
}
