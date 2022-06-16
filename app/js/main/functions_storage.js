let city_id=0;
let current_cat=1;
let resurs_id=0;

function $(selector)
{ 
    return document.querySelector(selector); 
}

function city_to_null()
{
    city_to(0);
}

function renew_owners()
{
    x = $('#send_x').value;
    y = $('#send_y').value;

    new Generator({
        container: $('#owner_list'),
        init_url: `/ajax?c=storage&do=owner_list&x=${x}&y=${y}`
    });

     
}

function send_resurs()
{
    x = $('#send_x').value;
    y = $('#send_y').value;
    state = $('#owner_select').dataset.value;
    amount = $('#send_amount').value;
    
    fetch(`/ajax?c=storage&do=send&resurs=${resurs_id}&amount=${amount}&state_to=${state}&x=${x}&y=${y}&city_from=${city_id}`, {
        method: 'GET', // POST, PUT, ...
         headers: {
             "Content-Type": "application/json", 
         }, 
     })
     .then(res => {
         if (res.ok) {
             res.json().then(data => { 
                 open_modal();
                 $('#modal_content').innerHTML=data.text;
                 $('#modal_title').innerHTML=data.title;
                 get_resurs_list();                       
             });
         } else {
             console.log('Ответ от сервера не OK (отличный от 200).');
         }
     });

}

function open_map()
{
    var x = $('#send_x').value;
    var y = $('#send_y').value;
    
    window.location.href=`/map?x=${x}&y=${y}`;
}
 
function city_to(city=0)
{  
    const thumbs = $('.city_to_list').children; 
    [...thumbs].forEach(thumb => {
        if (thumb.classList.contains('selected')) thumb.classList.remove('selected');
    });
    h_city = $('#city_to_'+city);

    if (h_city!=null)
    {
        h_city.classList.add('selected');
        $('#send_x').value=h_city.dataset.x;
        $('#send_y').value=h_city.dataset.y;
    }
         
    renew_owners();
    
}

function get_resurs_list(cat_id=0,city=-1)
{ 
    if (cat_id>0) current_cat=cat_id;
    if (city>-1) 
    {
        city_id=city;
        const thumbs = $('.city_from_list').children; 
        [...thumbs].forEach(thumb => {
            if (thumb.classList.contains('selected')) thumb.classList.remove('selected');
        });
        $('#city_from_0').classList.remove('selected');
        $('#city_from_'+city_id).classList.add('selected');
    }

    new Generator({
        container: $('#resurs_list'),
        init_url: `/ajax?c=storage&city=${city_id}&do=resurs_list&cat_id=${current_cat}`
    });
    if (resurs_id>0) resurs(resurs_id);
    
    
}


function resurs(id)
{
    resurs_id = id;

    
    const thumbs = $('#resurs_list').children; 
    [...thumbs].forEach(thumb => {
        if (thumb.classList.contains('selected')) thumb.classList.remove('selected');
    });
    if ($(`#resurs${id}`)!=null)
    {
        $(`#resurs${id}`).classList.add('selected'); 
    }

    
    
}

get_resurs_list(1,0);
 