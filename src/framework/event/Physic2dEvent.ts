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
    export class Physic2dEvent extends AEvent
    {
        /**
         * 当接收事件
         * @param event 物理2d事件类型
         * @param func 触发回调函数
         * @param thisArg this对象
         */
        OnEnum(event: Physic2dEventEnum, func: (...args: Array<any>) => void , thisArg:any){
            this.On(Physic2dEventEnum[event],func,thisArg);
        }

        /**
         * 发射事件
         * @param event 物理2d事件类型
         * @param args 参数数据
         */
        EmitEnum(event: Physic2dEventEnum, ...args: Array<any>){
            super.Emit(Physic2dEventEnum[event],args);
        }
    }
}