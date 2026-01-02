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
const loadFromApi = (lang, project, key, id) => {
    fetchTemplate(id).then((response) => {
        let rb;
        if (response.data) {
            const report = response.data.report;
            const reportBroOptions = {
                reportServerUrl: `${baseURL}/report/run`,
                menuShowButtonLabels: true,
                adminMode: false,
                additionalFonts: [
                    { name: '微软雅黑', value: 'MicrosoftYaHei'},
                ],
                // additionalFonts: [ { name: 'Tangerine', value: 'tangerine'}, { name: 'Lobster', value: 'lobster'} ],
                saveCallback: function () {
                    console.log('Saved report', project, id, rb.getReport());
                    saveTemplate({
                        id: id,
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
        } else {
            initialize({});
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
    const id = url.searchParams.get('id');
    const key = url.searchParams.get('key');
    const lang = url.searchParams.get('lang');
    if (project && (key || id)) {
        loadFromApi(lang, project, key, id);
    } else {
        loadFromStorage(lang);
    }

})();

