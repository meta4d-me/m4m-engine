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
    export interface IAttributeData
    {
        uiState: AttributeUIState;
        data: { [frameIndex: number]: FrameKeyPointData };
        frameIndexs: number[];
        attributeValType: AttributeValType;
        attributeType: AttributeType;
        actions: { [frameIndex: number]: IEffectAction[] };
        /** 初始化 */
        init();
    }
    @m4m.reflect.SerializeType
    export class Vector3AttributeData implements IAttributeData, ILerpAttributeInterface
    {
        public uiState: AttributeUIState;
        public attributeValType: AttributeValType;
        attributeType: AttributeType;
        public data: { [frameIndex: number]: FrameKeyPointData };
        public frameIndexs: number[];
        public actions: { [frameIndex: number]: IEffectAction[] }
        /**
         * 三维向量属性数据
         */
        constructor()
        {
            this.init();
        }
        /** 初始化 */
        init()
        {
            this.data = {};
            this.frameIndexs = [];
            let keyPoint: FrameKeyPointData = new FrameKeyPointData(0, new m4m.math.vector3());
            this.addFramePoint(keyPoint);
        }
        addFramePoint(data: FrameKeyPointData, func?: Function)
        {
            this.data[data.frameIndex] = data;
            if (data.actions != undefined)
            {
                if (this.actions == undefined)
                    this.actions = {};
                this.actions[data.frameIndex] = data.actions;
            }
            AttributeUtil.addFrameIndex(this.frameIndexs, data.frameIndex);
            if (func != null)
                func();
        }
        removeFramePoint(frameId: number, data: any, func?: Function)
        {
            if (this.data[frameId] == undefined)
            {
                console.warn("当前时间线中没有记录这一帧：" + frameId);
                return;
            } else
                delete this.data[frameId];
            if (this.actions != undefined && this.actions[frameId] != undefined)
                delete this.actions[frameId];
            if (this.frameIndexs[frameId] != undefined)
                this.frameIndexs.splice(this.frameIndexs.indexOf(this.frameIndexs[frameId]), 1);
            if (func != null)
                func();
        }
        updateFramePoint(data: any, func?: Function)
        {
            if (this.data[data.frameIndex] == undefined)
            {
                if (func != null)
                    func();
                return;
            }
            this.data[data.frameIndex] = data;
            if (data.actions != undefined)
                this.actions[data.frameIndex] = data.actions;
            if (func != null)
                func();
        }
    }
    @m4m.reflect.SerializeType
    export class Vector2AttributeData implements IAttributeData, ILerpAttributeInterface
    {
        public uiState: AttributeUIState;
        public attributeValType: AttributeValType;
        attributeType: AttributeType;
        public frameIndexs: number[];
        public data: { [frameIndex: number]: FrameKeyPointData };
        public actions: { [frameIndex: number]: IEffectAction[] }
        /**
         * 二维向量属性数据
         */
        constructor()
        {
            this.init();
        }
        /** 初始化 */
        init()
        {
            this.data = {};
            this.frameIndexs = [];
            let keyPoint: FrameKeyPointData = new FrameKeyPointData(0, new m4m.math.vector2());
            this.addFramePoint(keyPoint);
        }
        addFramePoint(data: FrameKeyPointData, func?: Function)
        {
            this.data[data.frameIndex] = data;
            if (data.actions != undefined)
            {
                if (this.actions == undefined)
                    this.actions = {};
                this.actions[data.frameIndex] = data.actions;
            }
            AttributeUtil.addFrameIndex(this.frameIndexs, data.frameIndex);
            if (func != null)
                func();
        }
        removeFramePoint(frameId: number, data: m4m.math.vector2, func?: Function)
        {
            if (this.data[frameId] == undefined)
            {
                console.warn("当前时间线中没有记录这一帧：" + frameId);
                return;
            } else
                delete this.data[frameId];
            if (this.actions != undefined && this.actions[frameId] != undefined)
                delete this.actions[frameId];
            if (this.frameIndexs[frameId] != undefined)
                this.frameIndexs.splice(this.frameIndexs.indexOf(this.frameIndexs[frameId]), 1);
            if (func != null)
                func();
        }
        updateFramePoint(data: any, func?: Function)
        {
            if (this.data[data.frameIndex] == undefined)
            {
                if (func != null)
                    func();
                return;
            }
            this.data[data.frameIndex] = data;
            if (data.actions != undefined)
                this.actions[data.frameIndex] = data.actions;
            if (func != null)
                func();
        }
    }
    @m4m.reflect.SerializeType
    export class NumberAttributeData implements IAttributeData, ILerpAttributeInterface
    {
        public uiState: AttributeUIState;
        public attributeValType: AttributeValType;
        attributeType: AttributeType;
        public data: { [frameIndex: number]: FrameKeyPointData };
        public frameIndexs: number[];
        public timeLine: { [frameIndex: number]: number };
        public actions: { [frameIndex: number]: IEffectAction[] };
        /**
         * 标量属性数据
         */
        constructor()
        {
            this.init();
        }
        /** 初始化 */
        init()
        {
            this.data = {};
            this.frameIndexs = [];
            let keyPoint: FrameKeyPointData = new FrameKeyPointData(0, 0);
            this.addFramePoint(keyPoint, null);
        }
        addFramePoint(data: any, func?: Function)
        {
            this.data[data.frameIndex] = data;
            if (data.actions != undefined)
            {
                if (this.actions == undefined)
                    this.actions = {};
                this.actions[data.frameIndex] = data.actions;
            }
            AttributeUtil.addFrameIndex(this.frameIndexs, data.frameIndex);
            if (func != null)
                func();
        }
        removeFramePoint(frameId: number, data: number, func?: Function)
        {
            if (this.data[frameId] == undefined)
            {
                console.warn("当前时间线中没有记录这一帧：" + frameId);
                return;
            } else
                delete this.data[frameId];
            if (this.actions != undefined && this.actions[frameId] != undefined)
                delete this.actions[frameId];
            if (this.frameIndexs[frameId] != undefined)
                this.frameIndexs.splice(this.frameIndexs.indexOf(this.frameIndexs[frameId]), 1);
            if (func != null)
                func();
        }
        updateFramePoint(data: any, func?: Function)
        {
            if (this.data[data.frameIndex] == undefined)
            {
                if (func != null)
                    func();
                return;
            }
            this.data[data.frameIndex] = data;
            if (data.actions != undefined)
                this.actions[data.frameIndex] = data.actions;
            if (func != null)
                func();
        }
    }

    export interface ILerpAttributeInterface
    {
        /**
         * 添加帧数据
         * @param data  帧点数据 
         * @param func 回调函数
         */
        addFramePoint(data: any, func?: Function);
        /**
         * 移除帧数据
         * @param frameId 帧ID 
         * @param data 数据
         * @param func 回调函数
         */
        removeFramePoint(frameId: number, data: any, func?: Function);
        /**
         * 更新帧数据
         * @param data 数据
         * @param func 回调函数
         */
        updateFramePoint(data: any, func?: Function);
    }

    export enum AttributeUIState
    {
        None,
        Show,
        Hide,
    }

    export enum AttributeUIType
    {
        Number,
        Vector2,
        Vector3,
        Vector4,
    }

    export enum AttributeValType
    {
        FixedValType = 0,
        LerpType = 1
    }

    export class FrameKeyPointData
    {
        public frameIndex: number;
        public val: any;
        public actions: IEffectAction[]
        /**
         * 关键帧数据
         * @param frameIndex 帧索引
         * @param val 值
         */
        constructor(frameIndex: number, val: any)
        {
            this.frameIndex = frameIndex;
            this.val = val;
        }
    }

    export class AttributeUtil
    {
        /**
         * 添加指定帧数据
         * @param datas 数据 
         * @param index 帧索引
         */
        public static addFrameIndex(datas: number[], index: number)
        {
            for (let i = 0; i < datas.length - 1; i++)
            {
                if (index > datas[i] && index <= datas[i + 1])
                {
                    datas.splice(i, 0, index);
                    return;
                }
            }
            datas.push(index);
        }
    }

    // export class VectorLerpAttribute implements LerpAttributeInterface
    // {
    //     timeLine: { [frameId: number]: any };
    //     addFramePoint(frameId: number, data: any)
    //     {
    //         if (this.timeLine == undefined)
    //             this.timeLine = {};
    //         this.timeLine[frameId] = data;
    //     }
    //     removeKeyPoint(frameId: number, data: any)
    //     {
    //         if (this.timeLine == undefined || this.timeLine[frameId] == undefined)
    //         {
    //             console.warn("当前时间线中没有记录这一帧：" + frameId);
    //             return;
    //         }
    //         delete this.timeLine[frameId];
    //     }
    // }

    // export class ColorLerpAttribute implements LerpAttributeInterface
    // {
    //     timeLine: { [frameId: number]: m4m.math.color };
    //     addFramePoint(frameId: number, data: any)
    //     {
    //         if (this.timeLine == undefined)
    //             this.timeLine = {};
    //         if (this.timeLine[frameId] == undefined)
    //             this.timeLine[frameId] = new m4m.math.color();
    //         if (typeof (data) === 'number')
    //         {
    //             this.timeLine[frameId].a = data;
    //         } else if (data instanceof m4m.math.vector3)
    //         {
    //             let c = data as m4m.math.vector3;
    //             this.timeLine[frameId].r = c.x;
    //             this.timeLine[frameId].g = c.y;
    //             this.timeLine[frameId].b = c.z;
    //         }
    //     }
    //     removeKeyPoint(frameId: number, data: any)
    //     {
    //         if (this.timeLine == undefined || this.timeLine[frameId] == undefined)
    //         {
    //             console.warn("当前时间线中没有记录这一帧：" + frameId);
    //             return;
    //         }
    //         if (typeof (data) === 'number')
    //         {
    //             this.timeLine[frameId].a = -1;
    //         } else if (data instanceof m4m.math.vector3)
    //         {
    //             this.timeLine[frameId].r = -1;
    //             this.timeLine[frameId].g = -1;
    //             this.timeLine[frameId].b = -1;
    //         }

    //         if (this.timeLine[frameId].r == -1 && this.timeLine[frameId].a == -1)
    //             delete this.timeLine[frameId];
    //     }
    // }
}
