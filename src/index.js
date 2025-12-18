import ReportBro from './ReportBro';
import './main.css';
import {fetchTemplate, saveTemplate} from "./api";
import {baseURL} from "./api/config";

const initialize = (options, report = null) => {
    const rb = new ReportBro(document.getElementById('root'), options);
    if(report) {
        rb.load(report);
    }
    return rb;
}
(() => {
    fetchTemplate('purchase_order').then((response) => {
        let rb;
        if (response.data) {
            const report = response.data.report;
            const url = new URL(window.location.href);
            const project = url.searchParams.get('project');
            const user_id = url.searchParams.get('user_id');
            const lang = url.searchParams.get('lang');
            const reportBroOptions = {
                reportServerUrl: `${baseURL}/report/run`,
                menuShowButtonLabels: true,
                adminMode: true,
                // additionalFonts: [ { name: 'Tangerine', value: 'tangerine'}, { name: 'Lobster', value: 'lobster'} ],
                saveCallback: function (report) {
                    console.log('Saved report', project, user_id, rb.getReport());
                    saveTemplate({
                        key: 'purchase_order',
                        filter: {},
                        report: rb.getReport()
                    }).then((response) => {
                        if (response.data) {
                            alert(response.data.message);
                            return response.data;
                        }
                        throw new Error('Saving report failed');
                    }).then(() => {
                        rb.setModified(false);
                    }).catch((error) => {
                        console.log(error); //todo throw error
                    });
                },
                localeKey: lang === 'zh' ? 'zh_cn' : 'en_us',
            }
            rb = initialize(reportBroOptions, report);
        }
    }).catch(function () {
        alert('Error fetch init data');
        initialize({});
    });
})();

