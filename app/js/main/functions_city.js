
let city_build_id=0;

console.log(1);

function renew_city_map()
{
    let cityID = '';
    if (city_build_id)    cityID = `?city_id=${city_build_id}`;

    let url = `/ajax?c=city&do=city_builds${cityID}`;
    if (dev) url = '/cache/map/city.json';

    fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (res.ok) {
                res.json().then(res => window.map = new Map(res));
            } else {
                res.json().then(res => console.log(res));
            }
        });
}
