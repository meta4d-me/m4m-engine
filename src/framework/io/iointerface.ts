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
namespace m4m.io
{
    // export interface SaveInterface
    // {
    //     saveBlob(path:string,fun:(blob:Blob)=>void);
    //     saveText(path:string,fun:()=>string);
    //     saveMap(pathMap: { [id: string]: string }, fun:Function)
    // }
    
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * string转换为blob
     * @version m4m 1.0
     */
    export function stringToBlob(content:string)
    {
        var u8 = new Uint8Array(stringToUtf8Array(content));
        var blob = new Blob([u8]);
        return blob;
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * string转换为utf8数组
     * @version m4m 1.0
     */
    export function stringToUtf8Array(str: string): number[]
    {
        var bstr: number[] = [];
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            var cc = c.charCodeAt(0);
            if (cc > 0xFFFF) {
                throw new Error("InvalidCharacterError");
            }
            if (cc > 0x80) {
                if (cc < 0x07FF) {
                    var c1 = (cc >>> 6) | 0xC0;
                    var c2 = (cc & 0x3F) | 0x80;
                    bstr.push(c1, c2);
                }
                else {
                    var c1 = (cc >>> 12) | 0xE0;
                    var c2 = ((cc >>> 6) & 0x3F) | 0x80;
                    var c3 = (cc & 0x3F) | 0x80;
                    bstr.push(c1, c2, c3);
                }
            }
            else {
                bstr.push(cc);
            }
        }
        return bstr;
    }
}