const moment = require('moment');
const {
  getNowOnAirBangumiData
} = require('./utils/data-getter');
const {
  getEventsFromData,
  getBangumiName
} = require('./utils/data-processor');
const bangumiData = require('bangumi-data');
const ics = require('ics');
const {
  writeFileSync
} = require('fs');
const argv = require('yargs').array('like').argv;

(() => {
  const timeNow = moment();
  if (argv.show) {
    const data = getNowOnAirBangumiData(timeNow);
    console.log(data.map(item => ({
      [item.title]: getBangumiName(item)
    })));
    console.log('=============选择你喜欢的番剧的日文名，作为[--like]的参数以获取日历===============');
    process.exit(0);
  }
  let likeList = null;
  if (argv.like) {
    likeList = argv.like;
  }
  const data = getNowOnAirBangumiData(timeNow, likeList);
  const sites = bangumiData.siteMeta;
  const events = getEventsFromData(data, sites, timeNow);
  ics.createEvents(events, (error, value) => {
    if (error) {
      console.log(error);
    }
    writeFileSync(`${__dirname}/bangumi.ics`, value);
    if (!likeList) {
      console.log('=============由于没有输入喜欢的番剧，生成了当期正在播放的所有番剧的日历===============');
    }
  });
})();