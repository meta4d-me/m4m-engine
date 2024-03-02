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
    export class NumberData
    {
        isRandom:boolean = false;
        _value:number = 0;
        _valueLimitMin:number = 0;
        _valueLimitMax = 0;
        beInited:boolean = false;
        key:number;//random值（0--1）
        /**
         * 设置数据
         * @param value 数据 
         */
        public setValue(value:number)
        {
            this._value = value;
        }

        /**
         * 设置随机数
         * @param max 最大值 
         * @param min 最小值
         */
        public setRandomValue(max:number,min:number)
        {
            this._valueLimitMax = max;
            this._valueLimitMin = min;
            this.isRandom = true;
        }

        /**
         * 针对随机类型，只要随机过一次就返回值不变（rerandom=false），返回新的随机值（rerandom=true）
         */
        public getValue(reRandom:boolean = false):number
        {
            if (this.isRandom)
            {
                if (reRandom || !this.beInited)
                {
                    this.key=Math.random();
                    this._value = this.key * (this._valueLimitMax - this._valueLimitMin) + this._valueLimitMin;
                    this.beInited = true;
                }
            }
            return this._value;
        }
        /**
         * 标量值数据
         * @param value 数据 
         */
        public constructor(value:number = 0)
        {
            this._value = value;
        }

        /**
         * 拷贝数据
         * @param from 源数据 
         * @param to 拷贝到的
         */
        public static copyto(from:NumberData,to:NumberData)
        {
            to.isRandom = from.isRandom;
            to._value = from._value;
            to._valueLimitMin = from._valueLimitMin;
            to._valueLimitMax = from._valueLimitMax;
        }

        /**
         * 来自json
         * @param json  JSON字符串 
         * @param data  数据
         */
        public static FormJson(json:string,data:NumberData)
        {
            if(json.indexOf("~")<0)
            {
                data.setValue(Number(json));
            }else
            {
                let arr=json.split("~");
                data.setRandomValue(Number(arr[1]),Number(arr[0]));             
            }
        }
    }

    export class Vector3Data
    {
        x = new NumberData();
        y = new NumberData();
        z = new NumberData();
        /**
         * 三维向量数据
         * @param x x值
         * @param y y值
         * @param z z值
         */
        public constructor(x = 0,y = 0,z = 0)
        {
            this.x.setValue(x);
            this.y.setValue(y);
            this.z.setValue(z);
        }

        /**
         * 获取值
         * @param reRandom 是否再次随机
         * @returns 向量3
         */
        public getValue(reRandom = false):math.vector3
        {
            let _out = new math.vector3();
            _out.x = this.x.getValue(reRandom);
            _out.y = this.y.getValue(reRandom);
            _out.z = this.z.getValue(reRandom);
            return _out;
        }
        
        /**
         * 拷贝到
         * @param from  源 
         * @param to    拷贝到
         */
        public static copyto(from:Vector3Data,to:Vector3Data)
        {
            NumberData.copyto(from.x, to.x);
            NumberData.copyto(from.y, to.y);
            NumberData.copyto(from.z, to.z);
        }

        /**
         * 设置从json 
         * @param json  json数据 
         * @param data  数据
         */
        public static FormJson(json:string,data:Vector3Data)
        {
            let arr=json.split(",");
            NumberData.FormJson(arr[0],data.x);
            NumberData.FormJson(arr[1],data.y);
            NumberData.FormJson(arr[2],data.z);
        }
    }
    
    export class NumberKey
    {
        public key:number;
        public value:number;
        /**
         * 标量值
         * @param _key key 
         * @param _value 值
         */
        public constructor(_key:number,_value:number)
        {
            this.key = _key;
            this.value = _value;
        }
    }
    
    export class Vector3Key
    {
        public key:number;
        public value:math.vector3;
        /**
         * 三维向量 可以
         * @param _key key
         * @param _value 值
         */
        public constructor(_key:number,_value:math.vector3)
        {
            this.key = _key;
            this.value = _value;
        }
    }

    export class Vector2Key
    {
        public key:number;
        public value:math.vector2;
        /**
         * 二维向量 可以
         * @param _key key
         * @param _value 值
         */
        public constructor(_key:number,_value:math.vector2)
        {
            this.key = _key;
            this.value = _value;
        }
    }
}