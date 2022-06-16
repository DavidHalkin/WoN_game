class Components {
    html(obj) {

        switch (obj.type) {
            case 'war_type':
            return `
                <div OnClick="war_select(${obj.id})" data-tooltip="${obj.tooltip}" class="slot type_danger has_close has_top_alert has_bottom_alert has_bottom_right_alert">
                    <div class="figure_holder">
                        <button class="figure" type="button">
                            <div class="mask">
                                <img src="${obj.icon}" alt="${obj.tooltip}">
                            </div>
                        </button>
                        ${!obj.amount == 0 ? '<button OnClick="war_delete(${obj.id})" type="button" class="close_btn"></button>' : ''}
                    </div>
                    <div class="text_holder">
                         ${obj.amount}
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
