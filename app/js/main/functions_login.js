 


function $(selector)
{

    return document.querySelector(selector);

}
 
function open_form(el)
{
    $('.area_form.active').classList.remove('active');
    $(el).classList.add('active');
}

function close_modal(el)
{
    $(el).classList.add('d-none'); 
}

function open_modal(el)
{
    $(el).classList.remove('d-none'); 
}

function open_map(subdomain)
{
    open_modal('.map_prev');
    close_modal('.server_prev');
    $('#map').setAttribute('src',`https://${subdomain}.wealthofnations.uk/chache/map/polytics.png`);
}

function show_pass(el)
{
    var pas_el = el.parentElement.querySelector('input');
    if (pas_el.Attribute('type')=='password') pas_el.setAttribute('type','text');
    else pas_el.setAttribute('type','password');

}

function login()
{
    var input_login = $('#input_login').value;
    var password = $('#input_password').value;

    
    
    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=login&do=login&login=${input_login}&password=${password}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                    if (data.hasOwnProperty('error'))
                        $('#login_error').innerHTML=data.error;
                    else if (data.hasOwnProperty('status') )
                      open_form('#server_select');
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
 
}

function recovery()
{
    open_form('#recovery_end');
    var input_email = $('#rec_email').value; 
    
    fetch(`/ajax?c=login&do=recovery&email=${input_login}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json",
            // и/или другие заголовки если надо
        },
        // body: JSON.stringify(someObject) // раскоментировать эту строку если нужно отправляеть запрос с JSON-ом
    });
 
}