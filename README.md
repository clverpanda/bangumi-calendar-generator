# 新番日历生成器

## 生成的日历示例地址

https://raw.githubusercontent.com/clverpanda/bangumi-ics/master/bangumi.ics

## 使用方法(CLI)

### 安装依赖
```shell
yarn install
```

### 获取正在播放的新番列表
```shell
yarn generate --show
```

### 生成新番日历
```shell
yarn generate # 生成所有新番的日历
yarn generate --show # 选择喜欢的新番，然后生成对应的日历
yarn generate --like [新番1] [新番2] [新番3] # 生成你所需要的新番的日历
```

