let current_law=0;
let current_strat=0;
 
function $(selector)
{

    return document.querySelector(selector);

}

function panel(cat,label='')
{
    if (label) $('#tab_label').innerHTML=label;
    new Generator({
        container: $('#list_'+cat),
        init_url: `/ajax?c=legislation&do=get_laws&type=${cat}`
    });

    right_panel(cat);
}

function new_strat()
{
    
    strat=$('#strat_select').dataset.value;
    if ($('#table2_select')==null)  val2=0;
    else val2=$('#table2_select').dataset.value;
    proc=$('#strat_range').value;
    strat_name=$('#new_strat_name').value;

    fetch(`/ajax?c=legislation&do=make_law&id=${current_law}&type=strat&name=${strat_name}&proc=${proc}&strat=${strat}&val2=${val2}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json", 
        }, 
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                panel('strat');
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });
}


function new_law()
{
    strat=$('#strat_select').dataset.value;
    if ($('#table2_select')==null)  val2=0;
    else val2=$('#table2_select').dataset.value;

    fetch(`/ajax?c=legislation&do=make_law&id=${current_law}&type=strat&strat=${strat}&val2=${val2}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json", 
        }, 
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                panel('strat');
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });
}

function right_panel(cat)
{
    const thumbs = $('.col_right').children; 
    [...thumbs].forEach(thumb => {
        if (!thumb.classList.contains('d-none')) thumb.classList.add('d-none');
    });

    if ($('#right_'+cat)!=null)
        $('#right_'+cat).classList.remove('d-none');

    if (cat=='law')
    {
        new Generator({
            container: $('#strat_list'),
            init_url: `/ajax?c=legislation&do=strat_list&type=${cat}&id=${current_law}`
        });

        new Generator({
            container: $('#table2_list'),
            init_url: `/ajax?c=legislation&do=table2_list&id=${current_law}`
        }); 
    }
    else if (cat=='strat')
    {
        new Generator({
            container: $('#panel_strat_list'),
            init_url: `/ajax?c=legislation&do=panel_strat_list`
        }); 
        
    }
    else if (cat=='state')
    {
        new Generator({
            container: $('#state_law_list'),
            init_url: `/ajax?c=legislation&do=state_law_list`
        }); 
    }
    else if (cat=='build')
    {
        new Generator({
            container: $('#agl_list'),
            init_url: `/ajax?c=legislation&do=agl_list&id=${current_strat}`
        }); 
    }
    else if (cat=='change')
    {
        new Generator({
            container: $('#agl_from_list'),
            init_url: `/ajax?c=legislation&do=agl_list&id=${current_strat}`
        });
        new Generator({
            container: $('#agl_to_list'),
            init_url: `/ajax?c=legislation&do=city_list&id=${current_strat}`
        });
        new Generator({
            container: $('#change_strat_list'),
            init_url: `/ajax?c=legislation&do=strat_list&id=${current_strat}`
        });
 
    }
}



function set_max()
{
    var city = $('#agl_from_select').dataset.value;
    fetch(`/ajax?c=legislation&do=max_strat&id=${city}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json", 
        }, 
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                if (data.max)
                {
                    $('#strat_change_amount').max=data.max;
                    $('#strat_change_slider').max=data.max;
                    $('#strat_change_amount').value=1;
                    $('#strat_change_slider').value=1;
                    $('#strat_change_slider').style="--min: 0; --max: ${data.max}; --val: 1";
                }
                
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });
}


function change(strat_id)
{
    current_strat=strat_id; 
    right_panel('change');
}

function build(strat_id)
{
    current_strat=strat_id;
    $('#build_do').classList.add('d-none');
    right_panel('build');
}

function strat_change()
{
    var id = $('#agl_from_select').dataset.value;
    var to = $('#agl_to_select').dataset.value;
    var strat = $('#change_strat_select').dataset.value;

    
    var amount = $('#strat_change_amount').value;
    
    
    new Generator({
        container: $('#strat_change_result'),
        init_url: `/ajax?c=legislation&do=strat_change&id=${id}&amount=${amount}&to=${to}&strat=${strat}`
    });
    
    new Generator({
        container: $('#agl_from_list'),
        init_url: `/ajax?c=legislation&do=agl_list&id=${current_strat}`
    });
 

}

function build_do()
{ 
    $('#build_do').classList.add('d-none');
    var id = $('#agl_select').dataset.value;
    var amount = $('#build_amount').value;
    
    
    new Generator({
        container: $('#build_result'),
        init_url: `/ajax?c=legislation&do=build_do&id=${id}&amount=${amount}`
    });
}

function build_price()
{  
    var id = $('#agl_select').dataset.value;
    var amount = $('#build_amount').value;
    
    
    new Generator({
        container: $('#build_result'),
        init_url: `/ajax?c=legislation&do=build_price&id=${id}&amount=${amount}`
    });
}

function delete_law(cat,id,strat=0,val2='')
{
    fetch(`/ajax?c=legislation&do=delete_law&id=${id}&strat=${strat}&type=${cat}&val2=${val2}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json", 
        }, 
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                panel(cat);    
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });
}

function make_law(id,cat)
{
    if (cat=='strat')
    {
        current_law=id;
        right_panel('law');
        
    }
    else 
    {
        fetch(`/ajax?c=legislation&do=make_law&id=${id}&type=${cat}`, {
            method: 'GET', // POST, PUT, ...
            headers: {
                "Content-Type": "application/json", 
            }, 
        })
        .then(res => {
            if (res.ok) {
                res.json().then(data => { 
                    panel(cat);    
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
    }
    

    
}
 

panel('state'); 

$('#agl_from_select').addEventListener('select:update', set_max);


////////
 