const moment = require('moment');
const { getNowOnAirBangumiData } = require('./utils/data-getter');
const { getEventsFromData, getBangumiName } = require('./utils/data-processor');
const bangumiData = require('bangumi-data');
const ics = require('ics');
const { writeFileSync } = require('fs');
const inquirer = require('inquirer');
const argv = require('yargs').array('like').argv;

(async () => {
  const timeNow = moment();
  let likeList = null;
  if (argv.show) {
    const data = getNowOnAirBangumiData(timeNow);
    // console.log(
    //   data.map(item => ({
    //     [item.title]: getBangumiName(item),
    //   }))
    // );
    console.log(
      '=============选择你喜欢的番剧的日文名，作为[--like]的参数以获取日历==============='
    );
    const selectedBangumi = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'result',
        message: '请选择你喜欢的番剧：',
        choices: data.map(item => ({
          name: getBangumiName(item),
          value: item.title,
        })),
      },
    ]);
    likeList = selectedBangumi.result;
    console.log('=================已生成选择的番剧的日历，下次可以用以下命令直接生成===================');
    console.log(`yarn generate --like${likeList.reduce((prev, next) => `${prev} "${next}"`, '')}`);
  }
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
      console.log(
        '=============由于没有输入喜欢的番剧，生成了当期正在播放的所有番剧的日历==============='
      );
    }
  });
})();
