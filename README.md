#### 项目名称

[在线音乐播放器](https://github.com/meethigher/music-player)<本项目已开源>

#### 感谢大佬

* [孟坤](https://mkblog.cn/)
* [metowolf](https://i-meto.com/)

#### 项目环境

运行环境：php 7.2+（开启扩展 curl_exec, file_get_contents, json_decode, openssl_encrypt ）

#### 兼容性

最好是`chrome内核`的浏览器，ie浏览器没做兼容。edge浏览器也有一些不兼容

#### 项目功能

1. 搜索音乐

   * 支持选择播放源——基于[Meting](https://i-meto.com/)

   * 支持键盘事件——up、down、enter
* 支持搜索记录——回车选中直接搜索，鼠标点击直接搜索
   * 支持分页加载

2. 播放音乐

   * 暂停/播放
   * 上/下一首切换
   * 音量以及播放进度调整（有个bug）
   * 记忆音量——保存上一次音量的设置

3. 显示歌词

   * 歌词
   * 海报
   * 歌曲、歌手以及专辑文案显示

4. 自定义歌单

   * 添加音乐
   * 清空列表
   * 退出后保存上次的歌单

#### 项目演示

[演示地址](https://meethigher.top/music)