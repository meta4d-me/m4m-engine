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
    * 粒子初始方向类型
    */
    /**
     * @private
     */
    export enum ParticleSystemShape 
    {
        NORMAL,
        BOX,
        SPHERE,
        HEMISPHERE,
        CONE,
        EDGE,
        CIRCLE
    }

    /**
     *  粒子初始数据
     */
    /**
     * @private
     */
    export class ParticleStartData 
    {

        public shapeType: ParticleSystemShape = ParticleSystemShape.NORMAL;

        private _position: m4m.math.vector3 = new m4m.math.vector3(0, 0, 0);
        public set position(_pos: m4m.math.vector3) 
        {
            m4m.math.vec3Clone(_pos, this._position);
        }

        public get position() 
        {
            return this._position;
        }

        private _direction: m4m.math.vector3 = new m4m.math.vector3(0, 1, 0);
        public set direction(_dir: m4m.math.vector3)
        {
            m4m.math.vec3Clone(_dir,this._direction);
        }

        public get direction()
        {
            return this._direction;
        }

        private _width: number = 0;
        public set width(_w: number)
        {
            this._width = _w;
        }

        public get width()
        {
            return this._width;
        }


        private _height: number = 0;
        public set height(_h: number) 
        {
            this._height = _h;
        }

        public get height()
        {
            return this._height;
        }

        public depth: number = 0;

        private _radius: number = 0;
        public set radius(_r: number) 
        {
            this._radius = _r;
        }

        public get radius() 
        {
            return this._radius;
        }

        private _angle: number = 0;
        public set angle(_a: number) 
        {
            this._angle = _a;
        }

        public get angle()
        {
            return this._angle;
        }



        public get randomDirection(): m4m.math.vector3
        {
            switch (this.shapeType)
            {
                case ParticleSystemShape.BOX:
                    return  this.boxDirection;
                case ParticleSystemShape.SPHERE:
                    return this.sphereDirection;
                case ParticleSystemShape.HEMISPHERE:
                    return this.hemisphereDirection;
                case ParticleSystemShape.CONE:
                    return this.coneDirection;
                case ParticleSystemShape.CIRCLE://todo
                    return this.circleDirection;
                case ParticleSystemShape.EDGE://todo
                    return this.edgeDirection;
                default:
                    return this.direction
            }
        }
        public get boxDirection(): m4m.math.vector3
        {
            this.position.x = ValueData.RandomRange(-this.width / 2, this.width / 2);
            this.position.y = ValueData.RandomRange(-this.height / 2, this.height / 2);
            this.position.z = ValueData.RandomRange(-this.depth / 2, this.depth / 2);

            m4m.math.vec3Normalize(this.position,this.direction);
            return this.direction;
        }

        public get sphereDirection(): m4m.math.vector3
        {
            let o = Math.random()*Math.PI*2;
            let o1 = Math.random()*Math.PI;
            let radius=Math.random()*this.radius;
            this.direction.x=Math.sin(o1)*Math.cos(o);
            this.direction.y=Math.cos(o1);         
            this.direction.z=Math.sin(o1)*Math.sin(o);
            
            m4m.math.vec3ScaleByNum(this.direction,radius,this.position);
            return this.direction;
        }

        public get hemisphereDirection(): m4m.math.vector3
        {
            let o = Math.random()*Math.PI*2;
            let o1 = Math.random()*Math.PI*0.5;
            let radius=Math.random()*this.radius;
            this.direction.x=Math.sin(o1)*Math.cos(o);
            this.direction.y=Math.cos(o1);         
            this.direction.z=Math.sin(o1)*Math.sin(o);
            
            m4m.math.vec3ScaleByNum(this.direction,radius,this.position);
            return this.direction;
        }
        public emitFrom:emitfromenum=emitfromenum.base;
        public get coneDirection(): m4m.math.vector3
        {

            var randomAngle=Math.random()*Math.PI*2;//弧度
            var randomHeight=Math.random()*this.height;
            var upradius=randomHeight*Math.tan(this.angle*Math.PI/180)+this.radius;
            var radomRadius=Math.random()*upradius;

            var bottompos=m4m.math.pool.new_vector3();
            bottompos.x=this.radius*Math.cos(randomAngle);
            bottompos.y=0;
            bottompos.z=this.radius*Math.sin(randomAngle);

            if(this.emitFrom==emitfromenum.base)
            {
               m4m.math.vec3Clone(bottompos,this.position);
            }
            else if(this.emitFrom==emitfromenum.volume)
            {
                
                this.position.x=radomRadius*Math.cos(randomAngle);
                this.position.z=radomRadius*Math.sin(randomAngle);
                this.position.y=randomHeight;
            }
            this.direction.x=Math.cos(randomAngle)*Math.sin(this.angle*Math.PI/180);
            this.direction.z=Math.sin(randomAngle)*Math.sin(this.angle*Math.PI/180);
            this.direction.y=Math.cos(this.angle*Math.PI/180);
            return this.direction;
        }

        public get circleDirection(): m4m.math.vector3
        {
            let _arc = this.angle * (Math.PI / 180);
            let a = ValueData.RandomRange(-_arc / 2, _arc / 2);
            let _radius = ValueData.RandomRange(0, this.radius);
            this.direction.x = _radius * Math.cos(a);
            this.direction.z = _radius * Math.sin(a);
            this.direction.y = 0;

            let length = math.vec3Length(this.direction);

            math.vec3Normalize(this.direction, this.direction);
            EffectUtil.RotateVector3(this.direction, this.direction, this.direction);

            this.getposition(this.direction, length);
            return this.direction;
        }

        public get edgeDirection()
        {

            let edgePos = new m4m.math.vector3(0, 0, 0);
            edgePos.y += ValueData.RandomRange(-this.radius / 2, this.radius / 2);

            let lenght = math.vec3Length(edgePos);
            EffectUtil.RotateVector3(edgePos, this.direction, edgePos);
            math.vec3Clone(this.direction, this.direction);
            this.getposition(edgePos, length);

            return this.direction;
        }

        /**
         * 获取位置坐标
         * @param dir 方向向量
         * @param length    长度 
         */
        private getposition(dir: m4m.math.vector3, length: number)
        {
            math.vec3ScaleByNum(dir, length, dir);
            this.position.x = dir.x;
            this.position.y = dir.y;
            this.position.z = dir.z;
        }
        /**
         * 克隆
         * @returns 
         */
        clone()
        {
            let data = new ParticleStartData();
            data.shapeType = this.shapeType;
            data._position = new m4m.math.vector3();
            m4m.math.vec3Clone(this._position, data._position);

            data._direction = new m4m.math.vector3();
            m4m.math.vec3Clone(this._direction, data._direction);
            data._width = this._width;

            data._height = this._height;

            data.depth = this.depth;
            data._radius = this._radius;

            data._angle = this._angle;

            data.position = new m4m.math.vector3();
            m4m.math.vec3Clone(this.position, data.position);

            data.direction = new m4m.math.vector3();
            m4m.math.vec3Clone(this.direction, data.direction);

            return data;
        }
    }
    /**
     * @private
     */
    export enum emitfromenum
    {
        base,
        volume
    }
}

