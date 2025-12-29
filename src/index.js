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
};
const emptyOptions = {styles: [], parameters: [], docElements: [], watermarks: []};
const loadFromApi = (lang, project, user_id) => {
    fetchTemplate('purchase_order').then((response) => {
        let rb;
        if (response.data) {
            const report = response.data.report;
            const reportBroOptions = {
                reportServerUrl: `${baseURL}/report/run`,
                menuShowButtonLabels: true,
                adminMode: true,
                additionalFonts: [
                    { name: '微软雅黑', value: 'MicrosoftYaHei'},
                ],
                // additionalFonts: [ { name: 'Tangerine', value: 'tangerine'}, { name: 'Lobster', value: 'lobster'} ],
                saveCallback: function () {
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
    }).catch(function (err) {
        console.log(err);
        alert('Error fetch init data');
        initialize({});
    });
};
const loadFromStorage = (lang) => {
    const localData = localStorage.getItem('__localReport');
    const report = localData ? JSON.parse(localData) : emptyOptions;
    let rb;
    let reportBroOptions = {};
    try {
        reportBroOptions = {
            reportServerUrl: `${baseURL}/report/run`,
            menuShowButtonLabels: true,
            adminMode: true,
            additionalFonts: [
                { name: '微软雅黑', value: 'MicrosoftYaHei'},
            ],
            // additionalFonts: [ { name: 'Tangerine', value: 'tangerine'}, { name: 'Lobster', value: 'lobster'} ],
            saveCallback: function () {
                console.log('Saved report', rb.getReport());
                localStorage.setItem('__localReport', JSON.stringify(rb.getReport()));
                rb.setModified(false);
            },
            localeKey: lang === 'zh' ? 'zh_cn' : 'en_us',
        }

    } catch (err) {
        console.log(err);
    }
    rb = initialize(reportBroOptions, report);
};
(() => {
    const url = new URL(window.location.href);
    const project = url.searchParams.get('project');
    const user_id = url.searchParams.get('user_id');
    const lang = url.searchParams.get('lang');
    if (project && user_id) {
        loadFromApi(lang, project, user_id);
    } else {
        loadFromStorage(lang);
    }

})();

