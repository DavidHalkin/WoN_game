let chat_id=0;
let chat_status=0;

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




enter= function(e) {

    if (  e.keyCode == 13) {
        chat_send();
    }

};

document.addEventListener('keydown',enter);



$('#select_user').addEventListener('select:update', select_user); 