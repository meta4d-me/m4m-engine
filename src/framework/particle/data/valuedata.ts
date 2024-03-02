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
﻿namespace m4m.framework
{
    /**
     * @private
     */
    export class ValueData
    {
        public isRandom: boolean = true;
        private _value: number = 0;
        private _valueLimitMin: number = 0;
        private _valueLimitMax: number = 0;
        private beInited: boolean = false;
        public set value(_v: number)
        {
            this._value = _v;
            this.isRandom = false;
        }
        public set valueLimitMin(_v: number)
        {
            this._valueLimitMin = _v;
            this.isRandom = true;
        }
        public set valueLimitMax(_v: number)
        {
            this._valueLimitMax = _v;
            this.isRandom = true;
        }
        /**
         * 克隆
         * @returns 
         */
        clone()
        {
            let valu = new ValueData();
            valu.isRandom = this.isRandom;
            valu._value = this._value;
            valu._valueLimitMin = this._valueLimitMin;
            valu._valueLimitMax = this._valueLimitMax;
            return valu;
        }
        /**
         * 针对随机类型，只要随机过一次就保持这个值不变
         * 
         * @returns 
         * 
         * @memberof ValueData
         */
        public getValue()
        {
            if (this.isRandom)
            {
                if (!this.beInited)
                {
                    this._value = ValueData.RandomRange(this._valueLimitMin, this._valueLimitMax);
                    this.beInited = true;
                }
            }
            return this._value;
        }

        /**
         * 针对随机类型，调用一次就随机一个值
         * 
         * @returns 
         * 
         * @memberof ValueData
         */
        public getValueRandom()
        {
            if (this.isRandom)
            {
                this._value = ValueData.RandomRange(this._valueLimitMin, this._valueLimitMax);
            }
            return this._value;
        }

        /**
         * 值数据
         */
        constructor()
        {

        }

        /**
         * 计算一个随机变量值
         * @param min 最小数
         * @param max 最大数
         * @param isInteger 是Int 类型
         * @returns 值
         */
        public static RandomRange(min: number, max: number, isInteger: boolean = false)
        {
            if (isInteger)
            {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }

            return Math.random() * (max - min) + min;
        }
    }
}
