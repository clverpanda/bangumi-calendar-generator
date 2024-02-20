const fs = require('fs');
const path = require('path');
const argv = require('process').argv;
const { writeFileSync } = fs;

const likeFilePath = path.join(__dirname, 'like.json');

(() => {
  console.log(argv[2]);
  writeFileSync(
    likeFilePath,
    JSON.stringify({ likeList: JSON.parse(argv[2]) }, null, 2)
  );
})();
