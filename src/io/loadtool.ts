/**
@license
Copyright (c) 2022 meta4d.me Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
﻿namespace m4m.io
{
    // class loadRetryMgr
    // {
    //     public static urlCaseDic: { [url: string]: number };

    // }
    const urlCaseDic: { [url: string]: number } = {};
    const retryTime: number = 500;
    const retryCount: number = 9999;
    /**
     * 
     * @param url 加载路径
     * @param fun 加载结果回调函数
     * @param onprocess 加载进度
     * @param loadedFun 正常加载完成后回调
     */
    export function xhrLoad(url: string, fun: (ContentData: any, _err: Error, isloadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void = null, responseType: XMLHttpRequestResponseType, loadedFun: (req: XMLHttpRequest) => void)
    {
        let req = new XMLHttpRequest();
        let isLoaded = false;
        req.open("GET", url);
        req.responseType = responseType;
        req.onreadystatechange = () =>
        {
            if (req.readyState == 4)
            {
                if (req.status == 200)
                {
                    if (urlCaseDic[url])
                        delete urlCaseDic[url];
                    isLoaded = true;
                    loadedFun(req);
                } else
                {
                    switch (req.status)
                    {
                        case 404:
                            if (fun)
                                fun(null, new Error("got a 404:" + url));
                            console.error("got a 404:" + url);
                            urlCaseDic[url] = retryCount;//无法找到资源 不需要重试
                            break;
                    }
                }
            }
        };
        req.onprogress = (ev) =>
        {
            if (onprocess) onprocess(ev.loaded, ev.total);
        }
        req.onerror = (ev) =>
        {
            if (fun)
                fun(null, new Error(`URL : ${url} \n onerr on req: `));
            //因 onloadend 无论成功失败都会回调   这里的重试注掉 
            // loadFail(req, url, fun, onprocess, responseType, loadedFun);
        };
        req.onloadend = () =>
        {
            //console.error(" is onload");
            if (!isLoaded)
            {
                loadFail(req, url, fun, onprocess, responseType, loadedFun);
            }
        };

        // try
        // {
        req.send();
        // } catch (err)
        // {
        //     fun(null, err);
        // }
    }

    /**
     * 加载失败
     * @param xhr XMLHttpRequest对象
     * @param url 加载路径字符串
     * @param fun 加载结果回调函数
     * @param onprocess 进度中执行函数
     * @param responseType 响应类型
     * @param loadedFun 加载完毕函数
     */
    function loadFail(xhr: XMLHttpRequest, url, fun, onprocess, responseType, loadedFun)
    {
        console.error(`下载失败: ${url}  status:${xhr.status}, ${retryTime}/ms 后重试`);
        urlCaseDic[url] = urlCaseDic[url] || 0;
        if (urlCaseDic[url] >= retryCount)
        {
            urlCaseDic[url] = 0;
            if (fun)
                fun(null, new Error("load this url fail  ：" + url), true);  //throw error after retry some times
            console.error(`------ load this url fail URL:${url}  `);
        } else
        {
            setTimeout(() =>
            {
                urlCaseDic[url]++;
                m4m.io.xhrLoad(url, fun, onprocess, responseType, loadedFun);
            }, retryTime);
        }
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 加载text资源
     * @param url 加载路径
     * @param fun 加载结果回调函数
     * @param onprocess 加载进度
     * @version m4m 1.0
     */
    export function loadText(url: string, fun: (_txt: string, _err: Error, isloadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void = null): void 
    {
        // if (framework.assetMgr.useBinJs)
        // {
        //     url = framework.assetMgr.correctTxtFileName(url);
        // }
        m4m.io.xhrLoad(url, fun, onprocess, "text", (req) =>
        {
            fun(req.responseText, null);
        });
    }

    var cachedMap = {};
    var checkClsTime = 0;
    /**
     * 获取Json对象
     * @param url 加载路径
     * @param text 
     * @returns json 对象
     */
    function GetJSON(url: string, text: string = undefined)
    {
        return new Promise<any>((r) =>
        {
            let cached = cachedMap[url];
            cached.ready = true;
            cached.useTime = Date.now();

            if(cached.json){
                r(cached.json);
            }else{
                JSONParse(text || cached.text).then((json) =>
                {
                    //cachedMap[url] = json;
                    // cached.json = json;                
                    r(json);
                });
            }
        });
        // return JSONParse(text);
    }

    /**
     * 字符串信息 解析成 json 对象
     * @param text 字符串信息
     * @returns json 对象
     */
    export function JSONParse(text: string)
    {
        return new Promise<any>((resolve, resaon) =>
        {
            let json;
            try
            {
                json = JSON.parse(text);
            } catch (e)
            {
                resaon(e);
            }
            resolve(json);
        });
    }

    /**
     * 加载JSON 
     * @param url 加载路径
     * @param fun 加载完回调函数
     * @param onprocess 加载中进度回调函数
     * @returns Promise
     */
    export function loadJSON(url: string, fun: (_txt: any, _err: Error, isloadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void = null) 
    {

        return new Promise((r) =>
        {
            // if (framework.assetMgr.useBinJs)
            //     url = framework.assetMgr.correctTxtFileName(url);
            let now = Date.now();
            if (now - checkClsTime > 15000)//15秒检查缓存
            {
                // console.log("检查json缓存");
                checkClsTime = now;
                for (let k in cachedMap)
                {
                    let cached = cachedMap[k];
                    if (cached.ready && now - cachedMap[k].useTime >= 60000)//1分钟 未使用自动清除
                    {
                        // console.log(`json 超时 ${k} ${(now - cached.useTime) / 1000}/秒`);
                        delete cachedMap[k];
                    }
                }
            }
            let cached = cachedMap[url];
            if (!cached)
            {
                cached = cachedMap[url] = {
                    queue: [],
                    // ready: false,
                    init: true,
                    useTime: now
                };
            }

            if (!cached.ready)
                cached.queue.push(fun);

            if (cached.ready)
            {
                fun(cached.json, null);
                GetJSON(url).then((json) =>
                {
                    r(json);
                });
                return;
            }


            if (cached.init)
            {
                cached.init = false;

                m4m.io.xhrLoad(url, fun, onprocess, "text", (req) =>
                {
                    GetJSON(url, req.response).then((json) =>
                    {
                        let cached = cachedMap[url];
                        cached.text = req.responseText;
                        const slowOut = function ()
                        {
                            if (cached.queue.length > 0)
                                cached.queue.shift()(json, null);

                            if (cached.queue.length > 0)
                                setTimeout(slowOut, 10);
                        }
                        // while (cached.queue.length > 0)
                        if (cached.queue.length == 1)
                            cached.queue.shift()(json, null);
                        else
                            slowOut();

                        //缓存成josn
                        cached.json = json;
                        cached.text = "";
                    });
                });
            }

        });

    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 加载arraybuffer资源
     * @param url 加载路径
     * @param fun 加载结果回调函数
     * @param onprocess 加载进度
     * @version m4m 1.0
     */
    export function loadArrayBuffer(url: string, fun: (_bin: ArrayBuffer, _err: Error, isloadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void = null): void
    {
        // if (framework.assetMgr.useBinJs)
        // {
        //     url = framework.assetMgr.correctFileName(url);
        // }
        //req.responseType = "arraybuffer";//ie 一定要在open之后修改responseType
        m4m.io.xhrLoad(url, fun, onprocess, "arraybuffer", (req) =>
        {
            fun(req.response, null);
        });
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 加载二进制资源
     * @param url 加载路径
     * @param fun 加载结果回调函数
     * @param onprocess 加载进度
     * @version m4m 1.0
     */
    export function loadBlob(url: string, fun: (_blob: Blob, _err: Error, isloadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void = null): void
    {
        m4m.io.xhrLoad(url, fun, onprocess, "blob", (req) =>
        {
            fun(req.response, null);
        });
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 加载图片资源
     * @param url 加载路径
     * @param fun 加载结果回调函数
     * @param progress 加载进度
     * @version m4m 1.0
     */
    export function loadImg(url: string, fun: (_tex: HTMLImageElement, _err?: Error, loadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void = null): void
    {
        // let guid = framework.resID.next();
        framework.assetMgr.Instance["_loadImg"](url, (img , err ) =>
        {
            fun(img , err);
        });
        // m4m.io.xhrLoad(url, fun, onprocess, "blob", (req) =>
        // {
        //     var blob = req.response;
        //     var img = document.createElement("img");
        //     //img.crossOrigin = "anonymous";
        //     img.onload = function (e)
        //     {
        //         window.URL.revokeObjectURL(img.src);
        //         fun(img, null);
        //     };
        //     img.onerror = function (e)
        //     {
        //         fun(null, new Error("error when blob to img:" + url));
        //     }
        //     try
        //     {
        //         img.src = window.URL.createObjectURL(blob);
        //     } catch (e)
        //     {
        //         fun(null, e);
        //     }
        // });
    }
}