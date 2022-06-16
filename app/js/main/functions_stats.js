
let myPieChart=null;
 let tab='trade';

function $(selector)
{ 
    return document.querySelector(selector); 
}
 
function select_tab(name,title='')
{
    if (title) $('#stats_title').innerHTML=title;
    tab=name;

    new Generator({
        container: $('#item_list'),
        init_url: `/ajax?c=stats&do=select_tab&tab=${name}`
    }); 
}

function select_item()
{
    resurs_id=$('#item_select').dataset.value;

    fetch(`/ajax?c=stats&do=stat&id=${resurs_id}&tab=${tab}`, {
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
                        borderColor: '#ff0e06',
                        yAxisID: 'y',
                        },
                        {
                        label: data.stat.label2,
                        data: data.stat.data2, 
                        borderColor: '#2dff46',
                        yAxisID: 'y',
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
                                }  
                            }
                            },
                        };

                        ctx = document.getElementById("chart");
                        ctx.style="width: 100%; height: "+$('#panel_id').clientHeight+"px;";
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



$('#item_select').addEventListener('select:update', select_item);


select_tab(tab);