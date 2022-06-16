
let resurs_id;  
let current_cat;
let myPieChart=null;

function $(selector)
{ 
    return document.querySelector(selector); 
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

        if ($('#add_trade').classList.contains('active')) load_resurs(id);
        else if ($('#trade_stat').classList.contains('active')) tab_stat();
        else if ($('#trade_log').classList.contains('active')) tab_log();
    }

    
    
}

function load_resurs(id)
{
    $('#trade_result').innerHTML=''; 

    $('#cancel_button').classList.add('d-none');
     
    var city = $('#selected_city_id').dataset.id;
    new Generator({
        container: $('#resurs_list'),
        init_url: `/ajax?c=trade&city=${city}&do=resurs&resurs=${id}`
    });

    
}

function tab_trade()
{ 
    

    load_resurs(resurs_id); 
}

function tab_stat()
{
   
    fetch(`/ajax?c=trade&do=stat&id=${resurs_id}`, {
        method: 'GET', // POST, PUT, ...
         headers: {
             "Content-Type": "application/json", 
         }, 
     })
     .then(res => {
         if (res.ok) {
             res.json().then(data => {  
                if (data.hasOwnProperty('stat'))
                { 
                    const labels = data.stat.labels;
                    const datachart = {
                    labels: labels,
                    datasets: [
                        {
                        label: data.stat.label1,
                        data: data.stat.data1, 
                        borderColor: '#ffce06',
                        yAxisID: 'y',
                        },
                        {
                        label: data.stat.label2,
                        data: data.stat.data2, 
                        borderColor: '#4dff46',
                        yAxisID: 'y1',
                        }
                    ]
                    };
                   
                    if (myPieChart==null)
                    {
                        const config = {
                            type: 'line',
                            data: datachart,
                            options: {
                            responsive: true,
                            interaction: {
                                mode: 'index',
                                intersect: false,
                            },
                            stacked: false, 
                            scales: {
                                y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                },
                                y1: {
                                type: 'linear',
                                display: true,
                                position: 'right', 
                                grid: {
                                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                                },
                                },
                            }
                            },
                        };

                        ctx = document.getElementById("chart");
                        myPieChart = new Chart(ctx,config);
                    } 
                    else myPieChart.data=datachart;
                    myPieChart.update();
                }
                      
             });
         } else {
             console.log('Ответ от сервера не OK (отличный от 200).');
         }
     });
    
       

}

function tab_log()
{
    const thumbs = $('.right_tabs').children; 
    [...thumbs].forEach(thumb => {
        if (thumb.classList.contains('active')) thumb.classList.remove('active');
    });
    $('#trade_log').classList.add('active');

    new Generator({
        container: $('#trade_log_list'),
        init_url: `/ajax?c=trade&do=log&resurs=${id}`
    }); 
    
}


function get_resurs_list(cat_id=0)
{
    if (cat_id==0) cat_id=$('#resurs_category_select').dataset.value;
   // else $('#resurs_category_select').dataset.value=cat_id;

    var city = $('#selected_city_id').dataset.id;

    new Generator({
        container: $('#resurs_list'),
        init_url: `/ajax?c=trade&city=${city}&do=resurs_list&cat_id=${cat_id}`
    });
    if (resurs_id>0) resurs(resurs_id);
    current_cat=cat_id;
    
}


function cancel(id)
{
    $('#trade_result').innerHTML=''; 
    $('#cancel_button').classList.add('d-none');

    fetch(`/ajax?c=trade&do=cancel&id=${id}`, {
       method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json", 
        }, 
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                get_resurs_list();
                if (data.hasOwnProperty('resurs_id'))
                      resurs(data.resurs_id);
                     
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });

}

function sell()
{
    $('#trade_result').innerHTML='';
    var trade_min = $('#trade_min').value;
    var trade_max = $('#trade_max').value;
    var trade_amount = $('#trade_amount').value;
    if ($('#check_autotrade').checked) autotrade=1; else autotrade=0;
    if ($('#check_inside').checked) inside=1; else inside=0;
    var city = $('#selected_city_id').dataset.id;
    $('#cancel_button').classList.add('d-none');

    fetch(`/ajax?c=trade&do=sell&city=${city}&id=${resurs_id}&inside=${inside}&autotrade=${autotrade}&price=${trade_min}&max=${trade_max}&amount=${trade_amount}`, {
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
                get_resurs_list();
                if (data.hasOwnProperty('resurs_id'))
                      resurs(data.resurs_id);
                     
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });

}


function buy()
{
    $('#trade_result').innerHTML='';
    var trade_min = $('#trade_min').value;
    var trade_max = $('#trade_max').value;
    var trade_amount = $('#trade_amount').value;
    if ($('#check_autotrade').checked) autotrade=1; else autotrade=0;
    if ($('#check_inside').checked) inside=1; else inside=0;
    var city = $('#selected_city_id').dataset.id;
    $('#cancel_button').classList.add('d-none');

    fetch(`/ajax?c=trade&do=buy&city=${city}&id=${resurs_id}&inside=${inside}&autotrade=${autotrade}&price=${trade_min}&max=${trade_max}&amount=${trade_amount}`, {
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
               
                $('#trade_result').innerHTML=data.text;
                if (data.hasOwnProperty('trade_id'))
                {
                    $('#cancel_button').setAttribute('OnClick',`cancel(${data.trade_id})`);
                    $('#cancel_button').classList.remove('d-none');
                }
                get_resurs_list(); 
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });

}
function nav_responsive()
{
    if ($('#nav_tabs').offsetWidth+10>=$('#nav_tabs').parentElement.offsetWidth)
    {
        $('#nav_tabs').classList.add('d-none');
    }
    else 
        $('#nav_select').classList.add('d-none');
}
   

//вызов

get_resurs_list(1);
nav_responsive();

$('#resurs_category_select').addEventListener('select:update', get_resurs_list);
