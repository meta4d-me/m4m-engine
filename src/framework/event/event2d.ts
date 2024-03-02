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
namespace m4m.framework
{
    /**
     * @private
     * @language zh_CN
     * @classdesc
     * 2d事件对象
     * @version m4m 1.0
     */
    export class PointEvent
    {
        type: event.PointEventEnum;
        x: number;
        y: number;
        eated: boolean;//事件是否被吃掉
        selected: transform2D;//是否有谁被选中
        c_x : number; //canvas 坐标系 x
        c_y : number;  //canvas 坐标系 y
        multiTouch:boolean;
    }
}