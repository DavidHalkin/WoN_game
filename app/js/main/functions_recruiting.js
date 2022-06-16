
let war_type; 
let template_hp_type; 
let current_type;


function $(selector)
{

    return document.querySelector(selector);

}

function resurs(id)
{
    var_resurs = $('#resurs'+id);
    if (var_resurs.classList.contains('selected')) {
        var_resurs.classList.remove('selected');
        var d ='del';
        $('#resurs_trade'+id).removeAttribute('checked');
    }
    else 
    {
        $('.resurs_panel .selected').classList.remove('selected');
        var_resurs.classList.add('selected');
        var d ='add';
    }
    new Generator({
        container: $('.army_block .grid_list'),
        init_url: `/ajax?c=recruiting&do=set_resurs&id=${war_type}&type=${current_type}&d=${d}&resurs=${id}`
    });
}

function resurs_trade(id)
{
    var_resurs = $('#resurs'+id); 

    if ($('#resurs_trade'+id).hasAttribute('checked')) {
        var_resurs.classList.remove('selected');
        var d ='del_trade'; 
    }
    else 
    {
        var_resurs.classList.add('selected');
        var d ='add_trade';
    }
    new Generator({
        container: $('.army_block .grid_list'),
        init_url: `/ajax?c=recruiting&do=set_resurs&id=${war_type}&type=${current_type}&d=${d}&resurs=${id}`
    });
}

function get_war_type_list()
{

    new Generator({
        container: $('.army_block .grid_list'),
        init_url: '/ajax?c=recruiting&do=get_war_type_list'
    });
    if (war_type>0) war_select(war_type);
}

function war_select(id)
{
    new Generator({
        container: $('.grid_list'),
        init_url: `/ajax?c=recruiting&do=war_select&id=${id}`
    });

    const thumbs = $('.army_block .grid_list').children;

    [...thumbs].forEach(thumb => {
        if (thumb.classList.contains('type_active')) thumb.classList.remove('type_active');
    });

    $(`#war_type${id}`).classList.add('type_active');

    war_type=id;
    set_max();

    $('#recruit_result').innerHTML='';
    enableRenaming();

}

function template_create(copy_id)
{
    fetch(`/ajax?c=recruiting&do=new_unit&copy_id=${copy_id}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json",
            // и/или другие заголовки если надо
        },
        // body: JSON.stringify(someObject) // раскоментировать эту строку если нужно отправляеть запрос с JSON-ом
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                get_war_type_list();
                if (data.hasOwnProperty('war_type'))
                      war_select(data.war_type);
                     
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });

}

function template_copy()
{
    return template_create(war_type);
}

function template_recruit_prepare()
{
    var amount = $('#amount').value;
    var city_id = $('#location').getAttribute('data-value');
    
    new Generator({
        container: $('#recruit_result'),
        init_url: `/ajax?c=recruiting&do=template_recruit_prepare&amount=${amount}&id=${war_type}&city_id=${city_id}`
    }); 
}

function set_max( )
{
    var value = $('#complect_amount'+$('#select_complect').dataset.value).innerHTML;
    $('#amount_range').max=value;
    if (value<$('#amount').value) $('#amount').value=value;
}


function template_recruit()
{
    var amount = $('#amount').value;
    var city_id = $('#location').getAttribute('data-value');
    
    new Generator({
        container: $('#recruit_result'),
        init_url: `/ajax?c=recruiting&do=template_recruit&amount=${amount}&id=${war_type}&city_id=${city_id}`
    });

    get_war_type_list();
}

function edit_template(war_type,type,filter='')
{
    current_type=type;
    new Generator({
        container: $('.resurs_panel'),
        init_url: `/ajax?c=recruiting&do=select_supply&type=${type}&id=${war_type}&filter=${filter}`
    });
    //open resurs panel 
    $(`#select_equip`).classList.remove('d-none');
    
}

function close_resurs_select()
{
    $(`#select_equip`).classList.add('d-none');
    war_select(war_type);
    get_war_type_list();
}

function war_delete(id)
{

    new Generator({
        container: $('.grid_list'),
        init_url: `/ajax?c=recruiting&do=war_delete&id=${id}`
    });
    const e = $("#war_type"+id);
    e.parentElement.removeChild(e);

    if (id==war_type)
    {
        $('#paneltitle').innerHTML = '';
        war_type=0;
    }
         
    
}

//вызов

get_war_type_list();

$('#select_complect').addEventListener('select:update', set_max);
