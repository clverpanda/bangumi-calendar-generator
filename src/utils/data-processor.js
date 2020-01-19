const moment = require('moment');
const DEFAULT = require("../default.json");

const MAX_SEASON_EP_COUNT = DEFAULT.maxSeasonEpCount; // 默认每季集数.
const MAX_OLD_BANGUMI_MONTH = DEFAULT.maxOldBangumiMonth; // 未结束老番最大月数
const EP_LENGTH = DEFAULT.epLength; // 默认每集动画时长（分钟）
const PREFER_SITES = DEFAULT.preferSites; // 默认偏好站点

const NO_ON_AIR_MSG = '无';
const SITE_TYPE_ONAIR = 'onair';


const getInitialDateOfOldBangumi = (beginTime, timeNow) => {
  const newTime = timeNow.clone();
  newTime.hour(beginTime.hour());
  newTime.minute(beginTime.minute());
  if (timeNow.day() === beginTime.day()) {
    return newTime;
  }
  newTime.day(beginTime.day() + 7);
  return newTime;
};

const getBangumiName = bangumi => {
  if (bangumi.titleTranslate && bangumi.titleTranslate['zh-Hans']) {
    return bangumi.titleTranslate['zh-Hans'][0]; // 有中文翻译就获取第一个中文翻译
  }
  return bangumi.title; // 没有就直接取title
};

const getBangumiSiteList = (bangumi, siteMeta) => {
  const resultList = [];
  if (bangumi && bangumi.sites && Array.isArray(bangumi.sites)) {
    const {
      sites
    } = bangumi;
    sites.forEach(site => {
      const siteInfo = siteMeta[site.site];
      if (
        siteInfo &&
        siteInfo.title &&
        siteInfo.urlTemplate &&
        siteInfo.type &&
        siteInfo.type === SITE_TYPE_ONAIR
      ) {
        resultList.push({
          site: site.site,
          title: siteInfo.title,
          url: siteInfo.urlTemplate.replace('{{id}}', site.id),
        });
      }
    });
  }
  return resultList;
};

const getBangumiDescription = siteList => {
  if (siteList.length > 0) {
    return siteList
      .map(site => `${site.title}：${site.url}`)
      .reduce((prev, next) => `${prev}\n${next}`);
  }
  return NO_ON_AIR_MSG;
};

const getBangumiUrl = siteList => {
  if (siteList.length <= 0) return null;
  PREFER_SITES.forEach(prefer => {
    const foundSite = siteList.find(site => site.site === prefer);
    if (foundSite) {
      return foundSite.url;
    }
  });
  return siteList[0].url;
};

const getBangumiOnAirTimes = (bangumi, timeNow) => {
  const now = timeNow.clone();
  const resultList = [];
  const beginTime = moment(bangumi.begin);
  if (bangumi.isNew) {
    // 新番默认有MAX_SEASON_EP_COUNT集
    for (let i = 0; i < MAX_SEASON_EP_COUNT; i++) {
      if (beginTime.isAfter(now)) {
        resultList.push(beginTime.format('YYYY-M-D-H-m').split('-'));
      }
      beginTime.add(1, 'w');
    }
  } else {
    // 老番不知结束时间默认添加MAX_OLD_BANGUMI_MONTH个月
    const initialTime = getInitialDateOfOldBangumi(beginTime, now);
    const endTime = now.add(MAX_OLD_BANGUMI_MONTH, 'M');
    while (initialTime.isBefore(endTime)) {
      resultList.push(initialTime.format('YYYY-M-D-H-m').split('-'));
      initialTime.add(1, 'w');
    }
  }
  return resultList;
};

const getEventsFromData = (bangumiData, siteMeta, timeNow) => {
  const events = [];
  for (const item of bangumiData) {
    const siteList = getBangumiSiteList(item, siteMeta);
    const onAirTimes = getBangumiOnAirTimes(item, timeNow);
    for (const onAirTime of onAirTimes) {
      const newEvent = {
        start: onAirTime,
        duration: {
          minutes: EP_LENGTH,
        },
        description: getBangumiDescription(siteList),
        title: getBangumiName(item),
        url: getBangumiUrl(siteList),
      };
      events.push(newEvent);
    }
  }
  return events;
};

module.exports = {
  getBangumiName,
  getEventsFromData
};