class Components {
    html(obj) { 
        switch (obj.type) { 
            case 'law_cat': return `
            <div class="item">
                ${obj.name ? `<h3 class="fz_20 text-center">${obj.name}:</h3>` : ''}
                ${(() => {
                    let list = '';
                    for (const item of obj.components) {
                        list += `<div data-tooltip='${item.title}' class="item_law d-flex align-items-start">
                        <div class="square size_2 mt-5">
                            <em class="txt">${item.id}</em>
                        </div>
                        <div class="col pl-10">
                            <div  ${item.allow ? `OnClick="make_law( ${item.id}, '${obj.cat}')"` : ''} class="btn  btn-block panel  horizontal mb-10">
                                <div class="bg_image_panel" style="background-image: url(/images/map/panel/bg/aside.png);"></div>
                                <div class="panel_holder flex-row align-items-center py-14 px-20">
                                    <p class="m-0 font-weight-bold px-5">
                                       <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.05 14L1.95 14C1.43283 14 0.936838 13.7787 0.571142 13.3849C0.205446 12.9911 4.99766e-07 12.457 4.77422e-07 11.9L2.80836e-08 0.7C2.06354e-08 0.514348 0.0684819 0.336301 0.190381 0.205025C0.312279 0.0737498 0.477609 1.73145e-08 0.65 2.3564e-08L9.75 3.5346e-07C9.92239 3.5971e-07 10.0877 0.0737501 10.2096 0.205026C10.3315 0.336301 10.4 0.514349 10.4 0.7L10.4 9.1L13 9.1L13 11.9C13 12.457 12.7946 12.9911 12.4289 13.3849C12.0632 13.7787 11.5672 14 11.05 14ZM10.4 10.5L10.4 11.9C10.4 12.0857 10.4685 12.2637 10.5904 12.395C10.7123 12.5263 10.8776 12.6 11.05 12.6C11.2224 12.6 11.3877 12.5263 11.5096 12.395C11.6315 12.2637 11.7 12.0857 11.7 11.9L11.7 10.5L10.4 10.5ZM2.6 3.5L2.6 4.9L7.8 4.9L7.8 3.5L2.6 3.5ZM2.6 6.3L2.6 7.7L7.8 7.7L7.8 6.3L2.6 6.3ZM2.6 9.1L2.6 10.5L5.85 10.5L5.85 9.1L2.6 9.1Z" fill="#B8AFAA" />
                                        </svg>
                                      ${item.name}</p>

                                      ${item.proc ? `<div class="ml-auto d-flex align-items-center pl-10">
                                            <img src="images/map/icons/graph.svg" alt="">
                                            <span class="text-success pl-10">${item.proc}%</span>
                                        </div>` : ''}  
                                </div>
                                <div class="decor">
                                    <span class="corner"></span>
                                    <span class="corner right_top"></span>
                                    <span class="corner right_bottom"></span>
                                    <span class="corner left_bottom"></span>
                                </div>
                            </div>
                            ${item.error ? `<p class="alert text-danger mb-7">${item.error}</p>` : ''}
                            <div class="item_law_footer d-flex align-items-center">
                            
                                                          
                            </div>
                        </div>
                    </div> `;
                    }
                    return list;
                })()} 
            </div>`;
            case 'person':
                return `<div class="d-flex align-items-center pt-10 pb-22">
                    <div class="person silver">
                        <div class="img_person">
                            <a href="/character?id=${obj.id}" class="holder"><img src="${obj.img}" alt=""></a>
                        </div>
                        <div class="d-flex flex-column info_ico">
                            <button OnClick="open_chat(${obj.state_id},'${obj.state}');" class="circle size_2"><img src="/images/map/icons/mail.svg" alt=""></button>
                            <button class="circle size_2 emblem"><img src="${obj.gerb}" alt=""></button>
                            <button class="square size_2 emblem"><img src="${obj.relig_img}" alt=""></button>
                        </div>
                        <div class="d-flex flex-column info_ico_left">
                            <button class="square size_0 mb-10"><em class="txt text-light fz_14">${obj.age}</em></button>
                        </div>
                    </div>
                    <div class="holder_info d-flex align-items-center col pl-30">
                        <div class="col pr-10">
                            <h3 class="fz_20 mb-0">${obj.name}</h3>
                        </div>
                    </div>
                </div>`;
            case 'teh':
                return `<div class="teh has_checkbox has_btn has_select color_2 mx-auto has_timer">
                <div class="panel md decor_2 centered_corners_none"> 
                    <div class="panel_holder">
                        <div data-tooltip='${obj.text}' class="top_part mt-8">
                            <div class="holder_img">
                                <div class="icon_list d-flex flex-column"> 
                                     ${obj.bonus_tooltip  ?
                                    `<div data-tooltip="${obj.bonus_tooltip}"  class="square size_0"><img src="/images/teh/icons/x1/webp/bonus.webp" alt=""></div>`
                                    : '' }
                                    ${obj.debaf_tooltip  ?
                                        `<div data-tooltip="${obj.debaf_tooltip}"  class="square size_0"><img src="/images/teh/icons/x1/webp/debuf.webp" alt=""></div>`
                                        : '' }
                                </div>
                                <div class="square_img sm">
                                    <span class="square_img_cont">
                                        <img src="/game_files/img/teh/x2/webp/${obj.id}.webp" alt="" class="img-fluid">
                                    </span> 
                                </div>
                            </div>
                            <div class="frame_title md">
                                <span>${obj.name}</span>
                            </div>
                        </div>
                        <div class="bottom_part px-10 py-5">
                            <a href="#" OnClick="study(${obj.id});" class="btn my-5 sm btn-block"><span   >${obj.label}</span></a>

                            
                            ${obj.in_query==1  ?
                            `<div class="select my-5 select_100p query_teh" data-url="/ajax?c=teh&do=query&id=${obj.id}" data-value="${obj.query}" style="width: 80px;">
                                <div class="select_header">
                                    <div class="panel sm centered_corners_none">
                                        <button class="panel_holder"> 
                                            <span>${obj.query}</span>
                                        </button>
                                        <div class="decor ">
                                            <span class="corner"></span>
                                            <span class="corner right_top"></span>
                                            <span class="corner right_bottom"></span>
                                            <span class="corner left_bottom"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="drop_down">
                                    <div class="panel grid_column sm centered_corners_none">
                                        <div class="panel_holder p-0" style="max-height: 100px;">
                                            <div class="panel_content ">
                                                <div class="content_scroll">
                                                    <ul class="etc_drop list-unstyled m-0">
                                                    ${(() => {
                                                        let list = '';
                                                        for (var i=0;i<=obj.count;i++) {
                                                            list += `<li data-value="${i}"><strong class="select_item"><span>${i}</span></strong></li>`;
                                                        }
                                                        return list;
                                                    })()} 
                                                    </ul>
                                                </div>
                                                <div class="scrollbar">
                                                    <div class="btn_func arrow_prev"></div>
                                                    <div class="bar">
                                                        <div class="handler"></div>
                                                    </div>
                                                    <div class="btn_func arrow_next"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="decor">
                                            <span class="corner"></span>
                                            <span class="corner right_top"></span>
                                            <span class="corner right_bottom"></span>
                                            <span class="corner left_bottom"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ` : `<div ${obj.time_end ? `data-end="${obj.time_end}" ` : ''} class="timer   my-5" >${obj.time}</div>`}
                        </div>
                    </div>
                    <div class="decor">
                        <span class="corner"></span>
                        <span class="corner right_top"></span>
                        <span class="corner right_bottom"></span>
                        <span class="corner left_bottom"></span>
                    </div>
                </div>
            </div> `;
            case 'resurs':
                return `<div id="resurs${obj.id}" data-tooltip="${obj.tooltip}" class="panel sm  ${obj.selected  ? `selected` : ''} decor_2">
                <div class="bg_image_panel" style="background-image: url(/images/map/panel/bg/aside.png);"></div>
                <div  OnClick="resurs('${obj.id}');" class="panel_holder align-items-center flex-row p-10">
                    <a href="#" class="emblem circle size_5">
                        <img src="${obj.icon}" alt="">
                    </a>
                    <div class="etc_info pl-8 col">
                        ${obj.price  ? `<div class="etc_info pl-8 col text-center">
                            <span class="d-block  ">${obj.price}</span>
                            <span class="d-block ${obj.export  ? 'text-success' : ''} ">${obj.amount}</span>
                        </div>` : obj.amount} 
                    </div>
                </div>
                <div class="decor ">
                    <span class="corner"></span>
                    <span class="corner right_top"></span>
                    <span class="corner right_bottom"></span>
                    <span class="corner left_bottom"></span>
                </div> 
                ${obj.checkbox  ? `<div class="label_right_bottom">
                        <div class="checkbox checkbox_no_label">
                            <label>
                                <input OnClick="resurs_trade(${obj.id});" id="resurs_trade${obj.id}" ${obj.checked  ? `checked` : ''}  type="checkbox">
                                <i class="checkbox_item"></i>
                                <span class="checkbox_label">${obj.name}</span>
                            </label>
                        </div>
                    </div>` : ''}
                
            </div>`; 
            case 'td':
                return `<div class="tr ">
                    <div class="td">${obj.t1}</div>
                    <div class="td text-success">${obj.t2}</div>
                    <div class="td">${obj.t3}</div> 
                </div>`;
            case 'text':
                return obj.content;
            case 'button':
                return `<a href="#" OnClick="${obj.function}()" class="btn md btn-block mb-6"><span>${obj.name}</span></a>`;
            case 'mini_info':
                return `<div ${obj.style ? `style="${obj.style}"` : ''} class=" mini_info ${obj.label ? 'label' : ''} mb-20"    ${obj.tooltip ? `data-tooltip="${obj.tooltip}` : ''} " > 
                         ${obj.label ? `<label>${obj.label}</label>` : ''}
                         <a href="#" class=" emblem ${obj.class ? `${obj.class}` : 'item_ico size_1'}"><img src="${obj.icon}" alt=""></a>
                         <div class="mini_holder">
                        <input type="text" value="${obj.value}">
                    </div>
                </div>`;
            case 'war_type':
                return `
                    <div id="war_type${obj.id}" OnClick="war_select(${obj.id})" data-tooltip="${obj.tooltip}" class="slot   has_close has_top_alert has_bottom_alert has_bottom_right_alert">
                        <div class="figure_holder">
                            <button class="figure" type="button">
                                <div class="mask">
                                    <img src="${obj.icon}" alt="${obj.tooltip}">
                                </div>
                            </button>
                            ${obj.amount == 0 ? `<button OnClick="war_delete(${obj.id});event.stopPropagation();" type="button" class="close_btn"></button>` : ''}
                        </div>
                        <div class="text_holder">
                             ${obj.amount}
                        </div>
                    </div>`;
            case 'state_law':
                return `<li data-tooltip='${obj.tooltip}' class="d-flex align-items-start pb-15">
                <div class="mod_close position-relative">
                    <div class="square size_2"><em class="txt text-light">${obj.id}</em></div>
                    <a href="#" OnClick="delete_law('state','${obj.id}','0','${obj.val2}');" class="close_btn position-absolute pos_centered"></a>
                </div>
                <div class="col pl-10">
                    <p class="mb-5 fz_20">${obj.cat}: ${obj.name}</p>
                    ${obj.text ? `<p class="mb-0">${obj.text}</p>` : ''} 
                </div>
            </li>`;
            case 'strat':
                return `<div class="panel centered_corners_none grid_column sm mb-15 decor_2">
                            <div class="bg_image_panel" style="background-image: url(/images/map/panel/bg/aside.png);"></div>
                            <div class="panel_holder align-items-center p-20">
                                <h3 data-rename="strat" data-id="${obj.id}" class="fz_20 mb-0">${obj.name}</h3>
                                <div class="d-flex align-items-center mx-n11 py-5">
                                    <div class="col px-11">
                                        <div class="mini_info mini_info_square"> 
                                            <a href="#" class="item_ico size_1"><img src="/images/map/icons/man.svg" alt=""></a>
                                            <div class="mini_holder">
                                                <input type="text" value="${obj.kol}" disabled>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-auto px-11">
                                        <button  OnClick="change(${obj.id})"  class="btn md"><span>${obj.label_do}</span></button>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center mx-n11 py-5">
                                    <div class="col px-11">
                                        <div class="mini_info mini_info_square"> 
                                            <a href="#" class="item_ico size_1 emblem"><img src="/images/panel/x2/webp/build_count.webp" alt=""></a>
                                            <div class="mini_holder">
                                                <input type="text" value="${obj.production}" disabled>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-auto px-11">
                                        <button OnClick="build(${obj.id})" class="btn md"><span>${obj.label_build}</span></button>
                                    </div>
                                </div> 


                                <div class="d-grid gap-10 icon_list size_2 pt-5">
                                ${(() => {
                                    let list = '';
                                    for (const item of obj.laws) {
                                        list += `<div data-tooltip="${item.name}" class="col_item">
                                                    <div class="mod_close position-relative">
                                                        ${item.table=='' ?
                                                        `<div class="square"><em class="txt text-light">${item.val}</em></div>`
                                                        : `<div class="circle ${item.class} emblem"><img src="/game_files/img/resurs/x1/webp/${item.resurs_id}.webp" alt=""></div>`}

                                                        <a href="#" OnClick="delete_law('strat','${item.val}','${obj.id}','${item.val2}');" class="close_btn position-absolute pos_centered"></a>
                                                    </div>
                                                </div>`;
                                    }
                                    return list;
                                })()} 
                                </div>
                            </div>
                            <div class="decor">
                                <span class="corner"></span>
                                <span class="corner right_top"></span>
                                <span class="corner right_bottom"></span>
                                <span class="corner left_bottom"></span>
                            </div>
                        </div>`;
            case 'drop-list':
                return `<li data-value="${obj.id}">
                        <strong class="select_item">
                            ${obj.icon ? `<i class="ico"><img src="${obj.icon}" alt=""></i>` : ''}
                            <span>${obj.name}</span>
                        </strong>
                    </li>`;
            case 'char':
                return `<li class="d-flex align-items-center py-10">
                <div class="person prison silver">
                    <div class="img_person">
                        <a href="#" class="holder"><img src="${obj.icon}" alt=""></a>
                    </div>
                    <div class="d-flex flex-column info_ico">
                    ${obj.chat_id ? `<button OnClick="open_chat(${obj.chat_id},'${obj.state_name}');" class="circle size_2"><img src="/images/map/icons/mail.svg" alt=""></button>` : ''}
                        <button class="circle size_2 emblem"><img src="${obj.blazon}" alt=""></button>
                    </div>
                    ${obj.number ? `
                    <div class="d-flex flex-column info_ico_left">
                        <button class="square size_0 mb-10"><em class="txt text-light fz_14">${obj.number}</em></button>
                    </div>` : ''}
                </div>
                <div class="holder_info d-flex align-items-center col pl-30">
                    <div class="col pr-10">
                        <h3 class="fz_20 mb-5">${obj.name}</h3>
                        <p class="text-muted mb-0">${obj.state_name}</p>
                    </div>
                    ${obj.stat ? `
                    <div class="col-auto d-flex align-items-center">
                        <span class="pr-8">${obj.amount}</span>
                        <a href="#"><img src="/game_files/stat/x1/webp/${obj.stat}.webp" alt=""></a>
                    </div>` : ''}
                </div>
            </li>`;
            case 'chat_item':
                return `<div class="answer d-flex ${obj.user ? 'inverse' : ''}">
                        <div class="answer_info ">
                            <div class="holder_ico active">
                                <a class="circle emblem size_2" href="#2">
                                    <img src="${obj.icon}" alt="">
                                </a>
                               ${obj.online ? '<em class="status bg-info"></em>' :''}
                            </div>
                            <span class="date text-muted">${obj.time}</span>
                        </div>
                        <div class="answer_text col">
                            <h4><a href="/state?id=${obj.id}" class="text-info">${obj.name}: </a></h4>
                            <p>${obj.text}</p>
                        </div>
                    </div>`;
            case 'list':
                return `
                    <ul>
                    ${(() => {
                        let list = '';
                        for (const item of obj.list) {
                            list += `<li>${item}</li>`;
                        }
                        return list;
                    })()}
                    </ul>`;

            default:
                return false;

        }
    }
};
window.components = new Components();
