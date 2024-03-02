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
namespace m4m.event
{
    export interface IUIEventer{
        /**
        * 添加事件监听者
        * @param eventEnum 事件类型
        * @param func 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
        * @param thisArg 回调方法执行者
        */
        addListener(eventEnum: UIEventEnum, func: (...args: Array<any>) => void , thisArg:any);
        /**
         * 移除事件监听者
         * @param eventEnum 事件类型
         * @param func 事件触发回调方法
         * @param thisArg 回调方法执行者
         */
        removeListener(eventEnum: UIEventEnum, func: (...args: Array<any>) => void , thisArg:any);
    }

    

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * ui事件
     * @version m4m 1.0
     */
    export class UIEvent extends AEvent
    {
        /**
         * 当接收事件
         * @param event UI事件类型
         * @param func 回调函数
         * @param thisArg this对象
         */
        OnEnum(event: UIEventEnum, func: (...args: Array<any>) => void , thisArg:any){
            this.On(UIEventEnum[event],func,thisArg);
        }

        /**
         * 发射事件
         * @param event UI事件类型
         * @param args 参数
         */
        EmitEnum(event: UIEventEnum, ...args: Array<any>){
            super.Emit(UIEventEnum[event],args);
        }
    }
}