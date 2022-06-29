/**
@license
Copyright 2022 meta4d.me Authors

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
     * 粒子节点
     */
    /**
     * @private
     */
    export class ParticleNode
    {
        x: ValueData = new ValueData();
        y: ValueData = new ValueData();
        z: ValueData = new ValueData();
        key: number;

        constructor()
        {

        }
        getValue(): m4m.math.vector3
        {
            return new m4m.math.vector3(this.x.getValue(), this.y.getValue(), this.z.getValue());
        }
        getValueRandom(): m4m.math.vector3
        {
            return new m4m.math.vector3(this.x.getValueRandom(), this.y.getValueRandom(), this.z.getValueRandom());
        }
        clone()
        {
            let node = new ParticleNode();
            if (this.x != undefined)
                node.x = this.x.clone();
            if (this.y != undefined)
                node.y = this.y.clone();
            if (this.z != undefined)
                node.z = this.z.clone();
            if (this.key != undefined)
                node.key = this.key;
            return node;
        }
    }

    /**
     * @private
     */
    export class AlphaNode
    {
        alpha: ValueData = new ValueData();
        key: number;

        getValue(): number
        {
            return this.alpha.getValue();
        }

    }
    /**
     * @private
     */
    export class UVSpeedNode
    {
        u: ValueData = new ValueData();
        v: ValueData = new ValueData();
        key: number;

        getValue(): m4m.math.vector2
        {
            return new m4m.math.vector2(this.u.getValue(), this.v.getValue());
        }
        getValueRandom(): m4m.math.vector2
        {
            return new m4m.math.vector2(this.u.getValueRandom(), this.v.getValueRandom());
        }
        clone()
        {
            let node = new UVSpeedNode();
            node.u = this.u.clone();
            node.v = this.v.clone();
            if (this.key != undefined)
                node.key = this.key;
            return node;
        }
    }

    /**
     * @private
     */
    export class ParticleNodeVec2
    {
        x: ValueData = new ValueData();
        y: ValueData = new ValueData();
        key: number;

        getValue(): m4m.math.vector2
        {
            return new m4m.math.vector2(this.x.getValue(), this.y.getValue());
        }
        getValueRandom(): m4m.math.vector2
        {
            return new m4m.math.vector2(this.x.getValueRandom(), this.y.getValueRandom());
        }
        clone()
        {
            let vec = new ParticleNodeVec2();
            vec.x = this.x.clone();
            vec.y = this.y.clone();
            if (this.key != undefined)
                vec.key = this.key;
            return vec;
        }
    }

    /**
     * @private
     */
    export class ParticleNodeNumber
    {
        num: ValueData = new ValueData();
        key: number;
        getValue(): number
        {
            return this.num.getValue();
        }
        getValueRandom(): number
        {
            return this.num.getValueRandom();
        }
        clone()
        {
            let num = new ParticleNodeNumber();
            num.num = this.num.clone();
            if (this.key != undefined)
            {
                num.key = this.key;
            }
            return num;
        }
    }
}

