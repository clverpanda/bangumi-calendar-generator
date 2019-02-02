// TODO
const moment = require('moment');
const {
  getNowOnAirBangumiData
} = require('../src/utils/data-getter');
const {
  getEventsFromData
} = require('../src/utils/data-processor');
const bangumiData = require('bangumi-data');
const ics = require('ics');
const {
  writeFileSync
} = require('fs');
const argv = require('yargs').argv;

(() => {
  const timeNow = moment();
  const likeList = ['3D彼女 リアルガール(第2シーズン)', 'デート・ア・ライブIII', '約束のネバーランド', 'かぐや様は告らせたい～天才たちの恋愛頭脳戦～', 'ドメスティックな彼女', 'ジョジョの奇妙な冒険 黄金の風', '転生したらスライムだった件'];
  const data = getNowOnAirBangumiData(timeNow, likeList);
  const sites = bangumiData.siteMeta;
  const events = getEventsFromData(data, sites, timeNow);
  ics.createEvents(events, (error, value) => {
    if (error) {
      console.log(error);
    }
    writeFileSync(`${__dirname}/event.ics`, value);
  });
})();