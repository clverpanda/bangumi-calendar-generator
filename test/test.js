const assert = require('assert');
const moment = require('moment');
const ics = require('ics');

const { getEventsFromData } = require('../src/utils/data-processor');

const siteMeta = {
  bangumi: {
    title: '番组计划',
    urlTemplate: 'https://bangumi.tv/subject/{{id}}',
    type: 'info',
  },
  bilibili: {
    title: '哔哩哔哩',
    urlTemplate: 'https://www.bilibili.com/bangumi/media/md{{id}}/',
    type: 'onair',
  },
};

const timeNow = moment('2026-04-17T00:00:00+08:00');

const bangumiData = [
  {
    title: 'new-original-title',
    titleTranslate: {
      'zh-Hans': ['新番标题'],
    },
    type: 'tv',
    lang: 'ja',
    begin: '2026-04-20T12:00:00.000Z',
    isNew: true,
    sites: [
      {
        site: 'bangumi',
        id: '123',
      },
      {
        site: 'bilibili',
        id: '456',
      },
    ],
  },
  {
    title: 'old-original-title',
    titleTranslate: {
      'zh-Hans': ['老番标题'],
    },
    type: 'tv',
    lang: 'ja',
    begin: '2026-03-06T12:00:00.000Z',
    sites: [],
  },
];

const createEvents = events =>
  new Promise((resolve, reject) => {
    ics.createEvents(events, (error, value) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(value);
    });
  });

(async () => {
  const events = getEventsFromData(bangumiData, siteMeta, timeNow);
  const newBangumiEvents = events.filter(event => event.title === '新番标题');
  const oldBangumiEvents = events.filter(event => event.title === '老番标题');

  assert.ok(newBangumiEvents.length > 0, '应生成新番事件');
  assert.ok(oldBangumiEvents.length > 0, '应生成老番事件');

  const firstNewEvent = newBangumiEvents[0];
  assert.strictEqual(firstNewEvent.title, '新番标题');
  assert.ok(!firstNewEvent.title.includes('本季新番'));
  assert.ok(!firstNewEvent.title.includes('上季旧番'));
  assert.ok(!firstNewEvent.title.includes('《'));
  assert.ok(firstNewEvent.description.startsWith('分类：本季新番'));
  assert.ok(firstNewEvent.description.includes('番组计划：https://bangumi.tv/subject/123'));
  assert.ok(firstNewEvent.description.includes('哔哩哔哩：https://www.bilibili.com/bangumi/media/md456/'));
  assert.strictEqual(firstNewEvent.location, '第1集');

  const firstOldEvent = oldBangumiEvents[0];
  assert.ok(firstOldEvent.description.startsWith('分类：上季旧番'));
  assert.ok(firstOldEvent.description.endsWith('\n无'));
  assert.strictEqual(firstOldEvent.location, '第7集');

  const icsContent = await createEvents([
    firstNewEvent,
    firstOldEvent,
  ]);
  assert.ok(icsContent.includes('SUMMARY:新番标题'));
  assert.ok(icsContent.includes('DESCRIPTION:分类：本季新番'));
  assert.ok(icsContent.includes('LOCATION:第1集'));
  assert.ok(icsContent.includes('LOCATION:第7集'));

  console.log('All tests passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
