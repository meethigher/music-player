/**
 * @description:音乐播放器
 * @author:言成言成啊
 * @link:https://meethigher.top/
 * @date:2019-11-11
 */
$(function () {
    let getPic = false;
    let getLyric = false;
    let ii = 0;//用来配合currentTime;
    let currentTime = 0;//当前音乐播放时间，用来控制歌词进度
    let oLrc;
    let currentPlayingId = 0;
    let loop = window.localStorage.getItem("loop") || "true";
    let volume = window.localStorage.getItem("volume") || 1;//音量大小
    let audio = new Audio();//用于接收要播放的音乐
    let ajaxing = false;//用于判断ajax是否加载中
    let dataMusic = [];//存储数据
    let myMusicList = JSON.parse(window.localStorage.getItem("myMusicList")) || [];//我的歌单
    let songUrl;//接收音乐的真实url
    let pic;//接收音乐的海报
    let current = -1;
    let maxHisNum = 6;//最多显示的历史记录数量
    let page = 1;//默认加载第一页内容
    let source = window.localStorage.getItem("source") || "tencent";//获取本地存储，有则获取无则默认
    let content = "";
    let historySe = JSON.parse(window.localStorage.getItem("historySearch")) || [];
    let $lis = $(".menu li");
    let $set = $(".set");
    let $menu = $(".menu");//功能选项
    let iShow = false;//用来判断是否展示
    let flag = false;//用来解决连续点击事件
    let $source = $(".source");//播放源
    let $sourceList = $(".source-list");//所有的播放源
    let $sourceLis = $(".source-list li");//所有播放源选项
    let $go = $(".go");//搜索按钮
    let $historySe = $(".search-history");
    let $input = $("input[type='search']");
    let $historyLis;
    let $musicList = $("#music-list");
    let $myMusicList = $("#myMusicList");
    let $player = $(".player");
    let $playModel = $(".play-model");
    let $myMusicLyric = $("#myMusicLyric");
    /*打开默认输出内容*/
    printDefault();


    function printDefault() {
        console.log("@description:音乐播放器\n@author:言成言成啊\n@link:https://meethigher.top/\n@date:2019-11-11");
    }

    /*展示与隐藏界面的方法*/
    function showContent() {
        $lis.each(function (index, ele) {
            let $this = $(ele);
            if ($this.hasClass("active")) {
                $($this.find("a").attr("href")).show();
            } else {
                $($this.find("a").attr("href")).hide();
            }
        });
    }

    showContent();
    /*给li标签注册事件*/
    $lis.on("click", function () {
        let $this = $(this);
        $lis.each(function (index, ele) {
            if ($(ele).hasClass("active"))
                $(ele).removeClass("active");
        });
        $this.addClass("active");
        showContent();
        //移动端的点击事件的逻辑
        if (window.innerWidth < 768) {
            $set.removeClass("fa-window-close").addClass("fa-window-maximize");
            $menu.hide();
            iShow = false;
        }
    });
    //移动端展示菜单栏
    $set.on("click", function () {
        if (flag) return;
        flag = true;
        if (!iShow) {
            $set.removeClass("fa-window-maximize").addClass("fa-window-close");
            $menu.fadeIn(function () {
                flag = false;
            });
            iShow = true;
        } else {
            $set.removeClass("fa-window-close").addClass("fa-window-maximize");
            $menu.fadeOut(function () {
                flag = false;
            });
            iShow = false;
        }
    });
    //播放源点击的逻辑
    $source.on("click", function (e) {
        e.stopPropagation();//阻止click事件冒泡到父元素
        $sourceList.show();
        // console.log("ul冒泡");
    });
    //点击播放源以外区域，选择项消失
    $(document).on("click", function () {
        $sourceList.hide();
        $historySe.hide();
        // console.log("dom冒泡");
    });
    //点击播放源以内区域，选择项消失，并。。自己看代码
    $sourceLis.on("click", function () {
        // console.log("li冒泡");
        source = $(this).attr("class");
        window.localStorage.setItem("source", source);
        setSource(source);
    });
    /*本地存储存储播放源*/
    /*播放源选择的逻辑*/
    window.localStorage.setItem("source", source);
    setSource(source);


    function setSource(source) {
        $source.find("span").css("backgroundImage", "url(\"images/" + source + ".ico\")");
    }

    /*绑定键盘按下按钮事件*/
    /*绑定两个回车按钮*/
    $input.on("keydown", function (e) {
        $historySe.show();
        keyDownEvent(e);
    });

    function keyDownEvent(e) {
        if (e.keyCode === 40 || e.which === 40) {
            if (current >= $historyLis.length - 1) {
                current = 0;
            } else {
                current++;
            }
            $historyLis.each(function (index, ele) {
                if (index === current) {
                    $(ele).addClass("active");
                } else {
                    $(ele).removeClass("active");
                }
            });
            $input.val($historySe.find("li.active").text());
        }
        if (e.keyCode === 38 || e.which === 38) {
            if (current <= 0) {
                current = $historyLis.length - 1;
            } else {
                current--;
            }
            $historyLis.each(function (index, ele) {
                if (index === current) {
                    $(ele).addClass("active");
                } else {
                    $(ele).removeClass("active");
                }
            });
            $input.val($historySe.find("li.active").text());
        }
        if (e.keyCode === 13 || e.which === 13) {
            $go.click();
            $historySe.hide();
            current = -1;
        }
    }

    $historySe.on("click", "li", function () {
        $input.val($(this).text());
        $go.click();
        $historySe.hide();
    });

    /*搜索按钮实现逻辑*/
    let index;
    $go.on("click", function () {
        //搜索前，先将原先有的内容清除，并将页面重置为1
        page = 1;
        $musicList.empty();
        dataMusic.length = 0;
        content = $.trim($input.val());
        if (content === "") {
            layer.msg("请输入要搜索的内容哦，亲❤~");
            return;
        }
        setHistory(content);
        renderHistory();

        index = layer.load(1, {shade: [0.1, '#fff']});
        ajaxSearch(source, content, page);
    });
    /*加载更多按钮实现逻辑*/
    $musicList.on("click", ".btn-more", function () {
        index = layer.load(1, {shade: [0.1, '#fff']});
        ajaxSearch(source, content, ++page);
    });

    /*渲染搜索结果的序号*/
    function renderLi($ele) {
        let $temp = $ele.find("li");
        $temp.each(function (index, ele) {
            let $this = $(ele).find(".num");
            $this.text(index + 1);
        });
    }

    /*点击音乐搜索结果的逻辑*/
    function pushData(obj) {
        for (let i = 0; i < myMusicList.length; i++) {
            let value = myMusicList[i].url_id;
            if (value === obj.url_id) {
                console.log("执行");
                myMusicList.splice(i, 1);
                break;
            }
        }
        myMusicList.push(obj);
    }

    $musicList.on("click", "li", function () {
        $this = $(this);
        if (dataMusic.length === 0) {
            layer.msg("曲库里没有收录你要的内容哦，亲❤~");
            return;
        }
        let music = dataMusic[$this.find(".num").text() - 1];
        let song = $this.find(".song").text();
        let singer = $this.find(".singer").text();
        let string = "歌曲：" + song + "<br>" + "歌手：" + singer;
        ajaxUrl(music);
        ajaxLyric(music);
        ajaxPic(music);
        layer.confirm(string, {
            title: false,
            btn: ['播放', '分享'], //按钮
            closeBtn: true,
        }, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing && getLyric && getPic) {
                    clearInterval(time);
                    layer.close(index);
                    if (songUrl === "" || songUrl === null) {
                        playSong(null, songUrl);
                    } else {
                        pushData(music);
                        renderMusicList();
                        window.localStorage.setItem("myMusicList", JSON.stringify(myMusicList));
                        currentPlayingId = $myMusicList.find("li").length - 1;
                        let $last = $($myMusicList.find("li")[currentPlayingId]);
                        playSong($last, songUrl);
                    }
                    renderLyric(oLrc, pic);
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~");
                }
            }, 200);
        }, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing) {
                    clearInterval(time);
                    layer.close(index);
                    shareSong(songUrl);
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~");
                }
            }, 200);
        });
    });

    /* 播放跟分享两个弹框的逻辑 */
    function playSong($this, songUrl) {
        if (songUrl === null || songUrl === "") {
            layer.msg("失败，收费音乐请去音乐解析栏哦，亲❤~");
            return;
        }
        layer.msg("已经加入播放器了哦，亲❤~");
        $myMusicList.find("li").each(function (index, ele) {
            $(ele).find(".num").removeClass("playing");
            $(ele).removeClass("playing");
        });
        $this.find(".num").addClass("playing");
        $this.addClass("playing");
        audio.src = songUrl;
        audio.volume = volume;
        audio.play();
        $player.removeClass("play").addClass("pause");
    }

    function shareSong(songUrl) {
        if (songUrl === "" || songUrl === null) {
            layer.msg("失败，收费音乐请去音乐解析栏哦，亲❤~");
            return;
        }
        let $input = $("<input>");
        $input.val(songUrl);
        $(".layui-layer").append($input);
        $input.select();
        document.execCommand("Copy");
        $input.remove();
        layer.msg("歌曲真实链接已经复制到剪贴板了哦，亲❤~");
    }

    /*异步请求获取数据*/

    /*异步获取 模糊搜索*/
    function ajaxSearch(source, content, page) {
        ajaxing = true;
        page = page || 1;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=search&count=10&source=" + source + "&pages=" + page + "&name=" + content,
            dataType: "jsonp",
            success: function (jsonData) {
                if (jsonData.length === 0) {
                    layer.msg("曲库里没有收录你要的内容哦，亲❤~~");
                    let btnMore = $("#music-list .btn-more");
                    if (btnMore.length > 0) {
                        btnMore.text("没有更多内容了哦，亲❤~~");
                    }
                    return;
                }
                dataMusic = dataMusic.concat(jsonData);
                let data = {
                    content: jsonData
                };
                let html = template("template", data);
                /*
                这个地方有个小逻辑
                如果没有加载更多按钮，则直接追加，并添加加载更多按钮
                如果有加载更多按钮，则在按钮前追加
                 */
                let btnMore = $("#music-list .btn-more");
                if (btnMore.length > 0) {
                    btnMore.before(html);
                } else {
                    let $temp = $musicList;
                    $temp.html("<div><span class=\"num\"></span><span class=\"song\">歌曲</span><span class=\"singer\">歌手</span></div>");
                    $temp.append(html);
                    $temp.append("<div class='btn-more'>加载更多</div>");
                }
                renderLi($musicList);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                layer.msg("搜索失败，请发邮件到meethigher@qq.com，亲❤~");
            },
            complete: function (XMLHttpRequest, textStatus) {
                ajaxing = false;
                layer.close(index);
            },
        });
    }

    /*异步获取 音乐真实链接*/
    function ajaxUrl(music) {
        ajaxing = true;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=url&id=" + music.url_id + "&source=" + music.source,
            dataType: "jsonp",
            complete: function () {
                ajaxing = false;
            },
            success: function (data) {
                if (data.url === "")
                    songUrl = "";
                else
                    songUrl = data.url;
            },
            error: function () {
                layer.msg("获取地址失败，请发邮件到meethigher@qq.com，亲❤~");
            }
        });
    }

    /*异步获取 海报真实链接*/
    function ajaxPic(music) {
        getPic = false;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=pic&id=" + music.pic_id + "&source=" + music.source,
            dataType: "jsonp",
            success: function (data) {
                pic = data.url;
            },
            error: function () {
                layer.msg("获取海报失败，请发邮件到meethigher@qq.com，亲❤~");
            },
            complete: function () {
                getPic = true;
            }

        });
    }

    /*异步获取 歌词真实链接*/
    function ajaxLyric(music) {
        getLyric = false;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=lyric&id=" + music.lyric_id + "&source=" + music.source,
            dataType: "jsonp",
            success: function (data) {
                decLyric(data.lyric);
            },
            error: function () {
                layer.msg("获取歌词失败，请发邮件到meethigher@qq.com，亲❤~");
            },
            complete: function () {
                getLyric = true;
            }
        });
    }

    /*历史搜索记录*/
    renderHistory();

    function renderHistory() {
        $historySe.empty();
        for (let i = historySe.length - 1; i >= 0; i--) {
            let $li = $("<li></li>").text(historySe[i]);
            $historySe.append($li);
        }
        $historyLis = $(".search-history li");
    }

    function setHistory(item) {
        let index = historySe.indexOf(item);
        if (index > -1) {
            historySe.splice(index, 1);
        }
        if (historySe.length >= maxHisNum) {
            historySe.shift();
        }
        historySe.push(item);
        window.localStorage.setItem("historySearch", JSON.stringify(historySe));
    }

    /*音乐播放的逻辑*/
    function renderVolume() {
        $(".volume-progress .cur").css("width", volume * 100 + "%");
        $(".volume-progress .dot").css("left", volume * 100 + "%");
        window.localStorage.setItem("volume", volume);
        if (volume === 0) {
            $(".volume-bar").removeClass("on").addClass("off");
        } else {
            $(".volume-bar").removeClass("off").addClass("on");
        }
    }

    function renderModel() {
        if (loop === "true") {
            $playModel.removeClass("turn").addClass("loop");
            audio.loop = true;
        } else {
            $playModel.removeClass("loop").addClass("turn");
            audio.loop = false;
        }
    }

    renderVolume();
    renderModel();
    $playModel.on("click", function () {
        if ($(this).hasClass("loop")) {
            $(this).removeClass("loop").addClass("turn");
            loop = "false";
            layer.msg("已切换到顺序播放哦，亲❤~");
        } else {
            $(this).removeClass("turn").addClass("loop");
            loop = "true";
            layer.msg("已切换到单曲循环哦，亲❤~");
        }
        audio.loop = (loop === "true" ? true : false);
        window.localStorage.setItem("loop", loop);
    });
    $player.on("click", function () {
        if (audio.src === "" || audio.src === null) return;
        if ($player.hasClass("play")) {
            audio.play();
            $player.removeClass("play").addClass("pause");
            $($myMusicList.find("li")[currentPlayingId]).find(".num").addClass("playing");
        } else {
            audio.pause();
            $player.removeClass("pause").addClass("play");
            $($myMusicList.find("li")[currentPlayingId]).find(".num").removeClass("playing");
        }
    });
    $(document).on("keydown", function (e) {
        if (e.which === 32) {
            $player.click();
        }
    });
    audio.ontimeupdate = function () {
        let percent = (audio.currentTime / audio.duration) * 100;
        $(".progress .cur").css("width", percent + "%");
        $(".progress .dot").css("left", percent + "%");
        /*/!*渲染歌词进度*!/
        currentTime=audio.currentTime+1;
        if(ii>=oLrc["ms"].length) return;
        if(currentTime>oLrc["ms"][ii]["t"]){
            renderLrcProcess(ii);
            ii++;
        }*/
    };
    audio.onended = function () {
        $(".progress .cur").css("width", 0);
        $(".progress .dot").css("left", 0);
        $player.removeClass("pause").addClass("play");
        if (loop === "true") return;

        //顺序播放逻辑
        if (myMusicList.length - 1 <= currentPlayingId) {
            currentPlayingId = -1;
        }
        ++currentPlayingId;
        prevAndNext();
    };

    //循环播放以及上一首下一首逻辑
    function prevAndNext() {
        index = layer.load(1, {shade: [0.1, '#fff']});
        let music = myMusicList[currentPlayingId];
        console.log(music);
        ajaxUrl(music);
        ajaxLyric(music);
        ajaxPic(music);
        let count = 1;
        let $this = $($myMusicList.find("li")[currentPlayingId]);
        let time = setInterval(function () {
            count++;
            if (!ajaxing && getLyric && getPic) {
                clearInterval(time);
                layer.close(index);
                playSong($this, songUrl);
                renderLyric(oLrc, pic);
            }
            if (count >= 15) {
                clearInterval(time);
                layer.close(index);
                layer.msg("超时，请检查网络哦，亲❤~");
            }
        }, 200);
    }

    audio.onpause = function () {
        $player.removeClass("pause").addClass("play");
    };
    audio.onplay = function () {
        $player.removeClass("play").addClass("pause");
    };
    $(".progress").on("click", function (e) {
        if (audio.src === "" || audio.src === null) return;
        let percent = e.offsetX / $(this).width();
        audio.currentTime = percent * (audio.duration);
    });
    $(".volume-progress").on("click", function (e) {
        if (audio.src === "" || audio.src === null) return;
        volume = e.offsetX / $(this).width();
        audio.volume = volume;
        renderVolume();
    });
    $(".btn-prev").on("click", function () {
        if (currentPlayingId <= 0) {
            currentPlayingId = myMusicList.length;
        }
        --currentPlayingId;
        prevAndNext();
    });
    $(".btn-next").on("click", function () {
        if (myMusicList.length - 1 <= currentPlayingId) {
            currentPlayingId = -1;
        }
        ++currentPlayingId;
        prevAndNext();
    });
    $myMusicList.on("click", ".btn-delete", function () {
        myMusicList = [];
        window.localStorage.setItem("myMusicList", JSON.stringify(myMusicList));
        renderMusicList();
    });
    $myMusicList.on("click", "li", function () {
        let $this = $(this);
        if (myMusicList.length === 0) {
            layer.msg("你的歌单里暂时没有东西哦，亲❤~");
            return;
        }
        let song = $this.find(".song").text();
        let singer = $this.find(".singer").text();
        let string = "歌曲：" + song + "<br>" + "歌手：" + singer;
        currentPlayingId = $this.find(".num").text() - 1;
        let music = myMusicList[currentPlayingId];
        ajaxUrl(music);
        ajaxLyric(music);//获取后的值给oLrc
        ajaxPic(music);//获取后的值给pic
        layer.confirm(string, {
            title: false,
            btn: ['播放', '分享'],
            closeBtn: true
        }, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing) {
                    clearInterval(time);
                    layer.close(index);
                    playSong($this, songUrl);
                    renderLyric(oLrc, pic);
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~");
                }
            }, 200);
        }, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing) {
                    clearInterval(time);
                    layer.close(index);
                    shareSong(songUrl);
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~");
                }
            }, 200);
        });


    });

    /*我的歌单*/
    function renderMusicList() {
        $myMusicList.html("<div><span class=\"num\"></span><span class=\"song\">歌曲</span><span class=\"singer\">歌手</span></div>");
        if (myMusicList.length === 0) {
            $myMusicList.append("<div class='btn-more'>列表暂时没有东西，请去音乐搜索栏添加音乐哦，亲❤~</div>");
        } else {
            let data = {
                content: myMusicList
            };
            let html = template("template", data);
            $myMusicList.append(html);
            $myMusicList.append("<div class='btn-delete'>清除列表，谨慎点击哦，亲❤~</div>");
        }
        renderLi($myMusicList);
    }

    renderMusicList();

    /*歌词部分*/

    /*解析歌词到oLrc*/
    function decLyric(lrc) {
        oLrc = {
            ti: "",//歌曲名
            ar: "",//歌手
            al: "",//专辑名
            ms: []//歌词数组 {t:时间，c:歌词}
        };
        if (lrc === "") return;
        let lrcs = lrc.split("\n");
        for (let i in lrcs) {
            lrcs[i] = lrcs[i].trim();
            let t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));
            let s = t.split(":");
            if (isNaN(parseInt(s[0]))) {
                for (let i in oLrc) {
                    if (i !== "ms" && i === s[0].toLowerCase()) {
                        oLrc[i] = s[1];
                    }
                }
            } else {
                let arr = lrcs[i].match(/\[(\d+:.+?)\]/g);//提取时间字段，类似于这样的[01:01.08][02:23.81][04:13.30]什么鬼魅传说
                let start = 0;
                for (let k in arr) {
                    start += arr[k].length;
                }
                let content = lrcs[i].substring(start);
                for (let k in arr) {
                    let t = arr[k].substring(1, arr[k].length - 1);
                    let s = t.split(":");
                    oLrc["ms"].push({
                        t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(2),
                        c: content
                    });
                }
            }
        }
        oLrc["ms"].sort(function (a, b) {
            return a.t - b.t;
        });
        /*for(let i in oLrc){
            console.log(i,":",oLrc[i]);
        }*/
    }

    function renderLyric(obj, p) {
        let lyrics = obj["ms"];
        let $pic = $(".pic");
        let $songContent = $(".songContent");
        let $singerContent = $(".singerContent");
        let $albumContent = $(".albumContent");
        $myMusicLyric.empty();
        $pic.empty();
        $songContent.empty();
        $singerContent.empty();
        $albumContent.empty();
        if(lyrics.length===0){
            $myMusicLyric.append($("<li></li>").text("这首歌没有歌词哦，亲❤~"));
        }else{
            for (let i = 0; i < lyrics.length; i++) {
                $myMusicLyric.append($("<li></li>").text(lyrics[i]["c"]));
            }
        }
        if(p)
        $pic.append($("<img>").attr("src", p));
        if(obj["ti"]!=="")
        $songContent.text("歌曲：" + obj["ti"]);
        if(obj["ar"]!=="")
        $singerContent.text("歌手：" + obj["ar"]);
        if(obj["al"]!=="")
        $albumContent.text("专辑：" + obj["al"]);
    }
});


