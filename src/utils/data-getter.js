const bangumiData = require('bangumi-data');
const moment = require('moment');

const getNearestSeason = timeNow => {
  switch (timeNow.month()) {
    case 0:
    case 1:
    case 2:
      return moment({
        y: timeNow.year(),
        M: 0,
        d: 1,
      });
    case 3:
    case 4:
    case 5:
      return moment({
        y: timeNow.year(),
        M: 3,
        d: 1,
      });
    case 6:
    case 7:
    case 8:
      return moment({
        y: timeNow.year(),
        M: 6,
        d: 1,
      });
    case 9:
    case 10:
    case 11:
      return moment({
        y: timeNow.year(),
        M: 9,
        d: 1,
      });
    default:
      return null;
  }
};

module.exports.getNowOnAirBangumiData = (timeNow, likeList) =>
  bangumiData.items
  .filter(item => {
    const beginTime = moment(item.begin);
    const minTime = timeNow.clone().subtract(2, 'y');
    const isNowOn = (
      !item.end &&
      item.type === 'tv' &&
      item.lang === 'ja' &&
      beginTime.isAfter(minTime, 'second')
    );;
    if (!isNowOn || !likeList) return isNowOn;
    return isNowOn && likeList.includes(item.title);
  })
  .map(item => {
    const beginTime = moment(item.begin);
    if (beginTime.isAfter(getNearestSeason(timeNow), 'second')) {
      return {
        ...item,
        isNew: true,
      };
    }
    return item;
  });