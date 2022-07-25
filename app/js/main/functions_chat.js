let chat_id=0;
let chat_status=0;
let accept_pact_id=0;

function $(selector)
{ 
    return document.querySelector(selector); 
}
 
function open_chat(id=-2,name='')
{
    if (id>-2) chat_id=id;
    $('#chat').classList.remove('d-none');
    chat_status=1;

    if (name!='' && id>-2)
    {
        $('#select_user').querySelector('span').innerHTML=name;
    }

    new Generator({
        container: $('#chat_user_list'),
        init_url: `/ajax?c=chat&do=user_list` 
    });
    chat_renew();
}


function close_chat()
{
    $('#chat').classList.add('d-none');
    chat_status=0;
}

function select_user()
{
    chat_id = $('#select_user').dataset.value;
    chat_renew();
}

function chat_renew(new_chat=0)
{
    if (!chat_status) return true;
    if (new_chat==0 || new_chat==chat_id)
    {
        new Generator({
            container: $('#chat_text'),
            init_url: `/ajax?c=chat&do=chat_renew&chat_id=${chat_id}`,
            not_init: true,
            scroll: true
        });

        
    } 
    
}

function chat_send()
{
    text = $('#chat_input').value;
    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=chat&do=send&chat_id=${chat_id}&text=${text}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    if (data.hasOwnProperty('status') && data.status)
                    {
                        $('#chat_input').value = '';
                        chat_renew();
                    }
                     
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
}




function accept_pact(id,quest)
{ 
    accept_pact_id=id; 

    ui.confirm.ask({
        question: quest,
        confirm: page_data.confirm.y,
        cancel: page_data.confirm.n
    }, accept_pact_pact);
    
}

function accept_pact_pact(result)
{
    if (!result) accept=0; else accept=1;

    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=diplomacy&do=accept_pact&id=${accept_pact_id}&accept=${accept}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status') && data.status )
                     {
                        $('#accept_pact'+accept_pact_id).classList.add('d-none');  
                     }
                        
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
}


enter= function(e) {

    if (  e.keyCode == 13) {
        chat_send();
    }

};


function open_bottom()
{
    var container = $('.panel_army');
    var button = $('#open_bottom');
    if (!container) return;

    if (container.classList.contains('panel_army_large'))
    {
        container.classList.remove('panel_army_large');        
        container.classList.add('panel_army_grid');
        button.style="-webkit-transform: rotate(90deg) scaleX(-1);  -ms-transform: rotate(90deg) scaleX(-1); transform: rotate(90deg) scaleX(-1);";
    }
    else 
    {
        container.classList.add('panel_army_large');
        container.classList.add('panel_army_grid');
        button.style="-webkit-transform: rotate(-90deg) scaleX(-1);  -ms-transform: rotate(-90deg) scaleX(-1); transform: rotate(-90deg) scaleX(-1);";
    }
}

function select_menu_city(id,img,name,sitizens)
{
    $('#menu_city_href').setAttribute('href','/city?id='+id);
    $('#menu_city_img').setAttribute('src',img);
    $('#selected_city_id').dataset.id=id;
    $('#selected_city_id').innerHTML = name;
    $('#selected_city_citizens').innerHTML = sitizens;
    
}

document.addEventListener('keydown',enter);



$('#select_user').addEventListener('select:update', select_user); 