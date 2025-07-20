$(function () {
    let $volumeBar = $(".volume-bar");
    let getPic = false;
    let getLyric = false;
    let ii = 0;
    let currentTime = 0;
    let oLrc;
    let currentPlayingId = 0;
    let loop = window.localStorage.getItem("loop") || "true";
    let volume = window.localStorage.getItem("volume") || 1;
    let audio = new Audio();
    let ajaxing = false;
    let dataMusic = [];
    let myMusicList = JSON.parse(window.localStorage.getItem("myMusicList")) || [];
    let songUrl;
    let pic;
    let current = -1;
    let maxHisNum = 6;
    let page = 1;
    let source = window.localStorage.getItem("source") || "tencent";
    let content = "";
    let historySe = JSON.parse(window.localStorage.getItem("historySearch")) || [];
    let $lis = $(".menu li");
    let $set = $(".set");
    let $menu = $(".menu");
    let iShow = false;
    let flag = false;
    let $source = $(".source");
    let $sourceList = $(".source-list");
    let $sourceLis = $(".source-list li");
    let $go = $(".go");
    let $historySe = $(".search-history");
    let $input = $("input[type='search']");
    let $historyLis;
    let $musicList = $("#music-list");
    let $myMusicList = $("#myMusicList");
    let $player = $(".player");
    let $playModel = $(".play-model");
    let $myMusicLyric = $("#myMusicLyric");
    printDefault();

    function printDefault() {
        console.log("%c@description:言成的个人音乐站\n@author:言成言成啊\n@link:https://meethigher.top/\n@createDate:2019-11-11", "font-size:18px; font-weight:bold; color:#24a0f0;")
    }

    function showContent() {
        $lis.each(function (index, ele) {
            let $this = $(ele);
            if ($this.hasClass("active")) {
                $($this.find("a").attr("href")).show()
            } else {
                $($this.find("a").attr("href")).hide()
            }
        })
    }

    showContent();
    $lis.on("click", function () {
        let $this = $(this);
        $lis.each(function (index, ele) {
            if ($(ele).hasClass("active")) $(ele).removeClass("active")
        });
        $this.addClass("active");
        showContent();
        if (window.innerWidth < 768) {
            $set.removeClass("fa-window-close").addClass("fa-window-maximize");
            $menu.hide();
            iShow = false
        }
    });
    $set.on("click", function () {
        if (flag) return;
        flag = true;
        if (!iShow) {
            $set.removeClass("fa-window-maximize").addClass("fa-window-close");
            $menu.fadeIn(function () {
                flag = false
            });
            iShow = true
        } else {
            $set.removeClass("fa-window-close").addClass("fa-window-maximize");
            $menu.fadeOut(function () {
                flag = false
            });
            iShow = false
        }
    });
    $source.on("click", function (e) {
        e.stopPropagation();
        $sourceList.show()
    });
    $(document).on("click", function () {
        $sourceList.hide();
        $historySe.hide()
    });
    $sourceLis.on("click", function () {
        source = $(this).attr("class");
        window.localStorage.setItem("source", source);
        setSource(source)
    });
    window.localStorage.setItem("source", source);
    setSource(source);

    function setSource(source) {
        $source.find("span").css("backgroundImage", "url(\"https://meethigher.top/images/" + source + ".ico\")")
    }

    $input.on("keydown", function (e) {
        $historySe.show();
        keyDownEvent(e)
    });

    function keyDownEvent(e) {
        if (e.keyCode === 40 || e.which === 40) {
            if (current >= $historyLis.length - 1) {
                current = 0
            } else {
                current++
            }
            $historyLis.each(function (index, ele) {
                if (index === current) {
                    $(ele).addClass("active")
                } else {
                    $(ele).removeClass("active")
                }
            });
            $input.val($historySe.find("li.active").text())
        }
        if (e.keyCode === 38 || e.which === 38) {
            if (current <= 0) {
                current = $historyLis.length - 1
            } else {
                current--
            }
            $historyLis.each(function (index, ele) {
                if (index === current) {
                    $(ele).addClass("active")
                } else {
                    $(ele).removeClass("active")
                }
            });
            $input.val($historySe.find("li.active").text())
        }
        if (e.keyCode === 13 || e.which === 13) {
            $go.click();
            $historySe.hide();
            current = -1
        }
    }

    $historySe.on("click", "li", function () {
        $input.val($(this).text());
        $go.click();
        $historySe.hide()
    });
    let index;
    $go.on("click", function () {
        page = 1;
        $musicList.empty();
        dataMusic.length = 0;
        content = $.trim($input.val());
        if (content === "") {
            layer.msg("请输入要搜索的内容哦，亲❤~");
            return
        }
        setHistory(content);
        renderHistory();
        index = layer.load(1, {shade: [0.1, '#fff']});
        ajaxSearch(source, content, page)
    });
    $musicList.on("click", ".btn-more", function () {
        index = layer.load(1, {shade: [0.1, '#fff']});
        ajaxSearch(source, content, ++page)
    });

    function renderLi($ele) {
        let $temp = $ele.find("li");
        $temp.each(function (index, ele) {
            let $this = $(ele).find(".num");
            $this.text(index + 1)
        })
    }

    function pushData(obj) {
        for (let i = 0; i < myMusicList.length; i++) {
            let value = myMusicList[i].url_id;
            if (value === obj.url_id) {
                myMusicList.splice(i, 1);
                break
            }
        }
        myMusicList.push(obj)
    }

    $musicList.on("click", "li", function () {
        $this = $(this);
        if (dataMusic.length === 0) {
            layer.msg("曲库里没有收录你要的内容哦，亲❤~");
            return
        }
        let music = dataMusic[$this.find(".num").text() - 1];
        let song = $this.find(".song").text();
        let singer = $this.find(".singer").text();
        let string = "歌曲：" + song + "<br>" + "歌手：" + singer;
        ajaxUrl(music);
        ajaxLyric(music);
        ajaxPic(music);
        layer.confirm(string, {title: false, btn: ['播放', '分享'], closeBtn: true,}, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing && getLyric && getPic) {
                    clearInterval(time);
                    layer.close(index);
                    if (songUrl === "" || songUrl === null) {
                        playSong(null, songUrl)
                    } else {
                        pushData(music);
                        renderMusicList();
                        window.localStorage.setItem("myMusicList", JSON.stringify(myMusicList));
                        currentPlayingId = $myMusicList.find("li").length - 1;
                        let $last = $($myMusicList.find("li")[currentPlayingId]);
                        playSong($last, songUrl);
                        renderLyric(oLrc, pic, song, singer);
                    }
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~")
                }
            }, 200)
        }, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing) {
                    clearInterval(time);
                    layer.close(index);
                    shareSong(songUrl)
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~")
                }
            }, 200)
        })
    });

    function playSong($this, songUrl) {
        if (songUrl === null || songUrl === "") {
            layer.msg("失败，收费音乐请去音乐解析栏哦，亲❤~");
            return
        }
        layer.msg("已经加入播放器了哦，亲❤~");
        $myMusicList.find("li").each(function (index, ele) {
            $(ele).find(".num").removeClass("playing");
            $(ele).removeClass("playing")
        });
        $this.find(".num").addClass("playing");
        $this.addClass("playing");
        audio.src = songUrl;
        audio.volume = volume;
        audio.play();
        $player.removeClass("play").addClass("pause")
    }

    function shareSong(songUrl) {
        if (songUrl === "" || songUrl === null) {
            layer.msg("失败，收费音乐请去音乐解析栏哦，亲❤~");
            return
        }
        let $input = $("<input>");
        $input.val(songUrl);
        $(".layui-layer").append($input);
        $input.select();
        document.execCommand("Copy");
        $input.remove();
        layer.msg("歌曲真实链接已经复制到剪贴板了哦，亲❤~")
    }

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
                        btnMore.text("没有更多内容了哦，亲❤~~")
                    }
                    return
                }
                dataMusic = dataMusic.concat(jsonData);
                let data = {content: jsonData};
                let html = template("template", data);
                let btnMore = $("#music-list .btn-more");
                if (btnMore.length > 0) {
                    btnMore.before(html)
                } else {
                    let $temp = $musicList;
                    $temp.html("<div><span class=\"num\"></span><span class=\"song\">歌曲</span><span class=\"singer\">歌手</span></div>");
                    $temp.append(html);
                    $temp.append("<div class='btn-more'>加载更多</div>")
                }
                renderLi($musicList)
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                layer.msg("搜索失败，请发邮件到meethigher@qq.com，亲❤~")
            },
            complete: function (XMLHttpRequest, textStatus) {
                ajaxing = false;
                layer.close(index)
            },
        })
    }

    function ajaxUrl(music) {
        ajaxing = true;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=url&id=" + music.url_id + "&source=" + music.source,
            dataType: "jsonp",
            complete: function () {
                ajaxing = false
            },
            success: function (data) {
                if (data.url === "") songUrl = ""; else songUrl = data.url
            },
            error: function () {
                layer.msg("获取地址失败，请发邮件到meethigher@qq.com，亲❤~")
            }
        })
    }

    function ajaxPic(music) {
        getPic = false;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=pic&id=" + music.pic_id + "&source=" + music.source,
            dataType: "jsonp",
            success: function (data) {
                pic = data.url
            },
            error: function () {
                layer.msg("获取海报失败，请发邮件到meethigher@qq.com，亲❤~")
            },
            complete: function () {
                getPic = true
            }
        })
    }

    function ajaxLyric(music) {
        getLyric = false;
        $.ajax({
            type: "POST",
            url: "api.php",
            data: "types=lyric&id=" + music.lyric_id + "&source=" + music.source,
            dataType: "jsonp",
            success: function (data) {
                decLyric(data.lyric)
            },
            error: function () {
                layer.msg("获取歌词失败，请发邮件到meethigher@qq.com，亲❤~")
            },
            complete: function () {
                getLyric = true
            }
        })
    }

    renderHistory();

    function renderHistory() {
        $historySe.empty();
        for (let i = historySe.length - 1; i >= 0; i--) {
            let $li = $("<li></li>").text(historySe[i]);
            $historySe.append($li)
        }
        $historyLis = $(".search-history li")
    }

    function setHistory(item) {
        let index = historySe.indexOf(item);
        if (index > -1) {
            historySe.splice(index, 1)
        }
        if (historySe.length >= maxHisNum) {
            historySe.shift()
        }
        historySe.push(item);
        window.localStorage.setItem("historySearch", JSON.stringify(historySe))
    }

    function renderVolume() {
        $(".volume-progress .cur").css("width", volume * 100 + "%");
        $(".volume-progress .dot").css("left", volume * 100 + "%");
        window.localStorage.setItem("volume", volume);
        if (volume === 0) {
            $volumeBar.removeClass("on").addClass("off")
        } else {
            $volumeBar.removeClass("off").addClass("on")
        }
    }

    function renderModel() {
        if (loop === "true") {
            $playModel.removeClass("turn").addClass("loop");
            audio.loop = true
        } else {
            $playModel.removeClass("loop").addClass("turn");
            audio.loop = false
        }
    }

    renderVolume();
    renderModel();
    $playModel.on("click", function () {
        if ($(this).hasClass("loop")) {
            $(this).removeClass("loop").addClass("turn");
            loop = "false";
            layer.msg("已切换到顺序播放哦，亲❤~")
        } else {
            $(this).removeClass("turn").addClass("loop");
            loop = "true";
            layer.msg("已切换到单曲循环哦，亲❤~")
        }
        audio.loop = (loop === "true" ? true : false);
        window.localStorage.setItem("loop", loop)
    });
    $player.on("click", function () {
        if (audio.src === "" || audio.src === null) return;
        if ($player.hasClass("play")) {
            audio.play();
            $player.removeClass("play").addClass("pause");
            $($myMusicList.find("li")[currentPlayingId]).find(".num").addClass("playing")
        } else {
            audio.pause();
            $player.removeClass("pause").addClass("play");
            $($myMusicList.find("li")[currentPlayingId]).find(".num").removeClass("playing")
        }
    });
    $(document).on("keydown", function (e) {
        if (e.which === 32) {
            $player.click()
        }
    });
    audio.ontimeupdate = function () {
        let percent = (audio.currentTime / audio.duration) * 100;
        $(".progress .cur").css("width", percent + "%");
        currentTime = audio.currentTime + 1;
        for (let i = 0; i < oLrc["ms"].length; i++) {
            if (currentTime >= oLrc["ms"][oLrc["ms"].length - 1]["t"]) {
                renderLrcProcess(oLrc["ms"].length - 1);
                break
            }
            if (currentTime >= oLrc["ms"][i]["t"] && currentTime <= oLrc["ms"][i + 1]["t"]) {
                renderLrcProcess(i)
            }
        }
    };

    function renderLrcProcess(i) {
        let $lis = $myMusicLyric.find("li");
        $lis.each(function (index, ele) {
            if (index <= i) {
                if (!$(ele).hasClass("played")) $(ele).addClass("played")
            } else {
                if ($(ele).hasClass("played")) $(ele).removeClass("played")
            }
        })
    }

    audio.onended = function () {
        $(".progress .cur").css("width", 0);
        $(".progress .dot").css("left", 0);
        $player.removeClass("pause").addClass("play");
        if (loop === "true") return;
        if (myMusicList.length - 1 <= currentPlayingId) {
            currentPlayingId = -1
        }
        ++currentPlayingId;
        prevAndNext()
    };

    function prevAndNext() {
        index = layer.load(1, {shade: [0.1, '#fff']});
        let music = myMusicList[currentPlayingId];
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
                renderLyric(oLrc, pic)
            }
            if (count >= 15) {
                clearInterval(time);
                layer.close(index);
                layer.msg("超时，请检查网络哦，亲❤~")
            }
        }, 200)
    }

    audio.onpause = function () {
        $player.removeClass("pause").addClass("play")
    };
    audio.onplay = function () {
        $player.removeClass("play").addClass("pause")
    };
    $(".progress").on("click", function (e) {
        if (audio.src === "" || audio.src === null) return;
        let percent = e.offsetX / $(this).width();
        audio.currentTime = percent * (audio.duration)
    });
    $(".volume-progress").on("click", function (e) {
        if (audio.src === "" || audio.src === null) return;
        volume = e.offsetX / $(this).width();
        audio.volume = volume;
        renderVolume()
    });
    $volumeBar.on("click", function () {
        if ($(this).hasClass("on")) {
            $(this).removeClass("on").addClass("off");
            audio.volume = 0
        } else {
            $(this).removeClass("off").addClass("on");
            audio.volume = volume
        }
    });
    $(".btn-prev").on("click", function () {
        if (currentPlayingId <= 0) {
            currentPlayingId = myMusicList.length
        }
        --currentPlayingId;
        prevAndNext()
    });
    $(".btn-next").on("click", function () {
        if (myMusicList.length - 1 <= currentPlayingId) {
            currentPlayingId = -1
        }
        ++currentPlayingId;
        prevAndNext()
    });
    $myMusicList.on("click", ".btn-delete", function () {
        myMusicList = [];
        window.localStorage.setItem("myMusicList", JSON.stringify(myMusicList));
        renderMusicList()
    });
    $myMusicList.on("click", "li", function () {
        let $this = $(this);
        if (myMusicList.length === 0) {
            layer.msg("你的歌单里暂时没有东西哦，亲❤~");
            return
        }
        let song = $this.find(".song").text();
        let singer = $this.find(".singer").text();
        let string = "歌曲：" + song + "<br>" + "歌手：" + singer;
        currentPlayingId = $this.find(".num").text() - 1;
        let music = myMusicList[currentPlayingId];
        ajaxUrl(music);
        ajaxLyric(music);
        ajaxPic(music);
        layer.confirm(string, {title: false, btn: ['播放', '分享'], closeBtn: true}, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing) {
                    clearInterval(time);
                    layer.close(index);
                    playSong($this, songUrl);
                    renderLyric(oLrc, pic, song, singer)
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~")
                }
            }, 200)
        }, function () {
            index = layer.load(1, {shade: [0.1, '#fff']});
            let count = 1;
            let time = setInterval(function () {
                count++;
                if (!ajaxing) {
                    clearInterval(time);
                    layer.close(index);
                    shareSong(songUrl)
                }
                if (count >= 15) {
                    clearInterval(time);
                    layer.close(index);
                    layer.msg("超时，请检查网络哦，亲❤~")
                }
            }, 200)
        })
    });

    function renderMusicList() {
        $myMusicList.html("<div><span class=\"num\"></span><span class=\"song\">歌曲</span><span class=\"singer\">歌手</span></div>");
        if (myMusicList.length === 0) {
            $myMusicList.append("<div class='btn-more'>列表暂时没有东西，请去音乐搜索栏添加音乐哦，亲❤~</div>")
        } else {
            let data = {content: myMusicList};
            let html = template("template", data);
            $myMusicList.append(html);
            $myMusicList.append("<div class='btn-delete'>清除列表，谨慎点击哦，亲❤~</div>")
        }
        renderLi($myMusicList)
    }

    renderMusicList();

    function decLyric(lrc) {
        oLrc = {ti: "", ar: "", al: "", ms: []};
        if (lrc === "") return;
        let lrcs = lrc.split("\n");
        let lyrics = oLrc["ms"];
        for (let i in lrcs) {
            lrcs[i] = lrcs[i].trim();
            let t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));
            let s = t.split(":");
            if (isNaN(parseInt(s[0]))) {
                for (let i in oLrc) {
                    if (i !== "ms" && i === s[0].toLowerCase()) {
                        oLrc[i] = s[1]
                    }
                }
            } else {
                let arr = lrcs[i].match(/\[(\d+:.+?)\]/g);
                let start = 0;
                for (let k in arr) {
                    start += arr[k].length
                }
                let content = lrcs[i].substring(start);
                for (let k in arr) {
                    let t = arr[k].substring(1, arr[k].length - 1);
                    let s = t.split(":");
                    lyrics.push({t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(2), c: content})
                }
            }
        }
        lyrics.sort(function (a, b) {
            return a.t - b.t
        });
        let tempLyrics = [];
        for (let i in oLrc["ms"]) {
            if (oLrc["ms"][i]["c"] !== "") {
                tempLyrics.push(oLrc["ms"][i])
            }
        }
        oLrc["ms"] = tempLyrics
    }

    function renderLyric(obj, p, song, singer) {
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
        if (lyrics.length === 0) {
            $myMusicLyric.append($("<li></li>").text("这首歌没有歌词哦，亲❤~"))
        } else {
            for (let i = 0; i < lyrics.length; i++) {
                $myMusicLyric.append($("<li></li>").text(lyrics[i]["c"]))
            }
        }
        if (p) $pic.append($("<img>").attr("src", p));
        $songContent.text("歌曲：" + (song == "" ? (obj["ti"] == "" ? "未知" : obj["ti"]) : song));
        $singerContent.text("歌手：" + (singer == "" ? (obj["ar"] == "" ? "未知" : obj["ar"]) : singer));
        $albumContent.text("专辑：" + (obj["al"] == "" ? "未知" : obj["al"]));
    }
});