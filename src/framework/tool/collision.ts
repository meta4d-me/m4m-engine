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
     * @public
     * @language zh_CN
     * @classdesc
     * 碰撞检测Tool
     * @version m4m 1.0
     */
    export class collision{ 
        private static helpv3 = new math.vector3();
        private static helpv3_1 = new math.vector3();

        //obb-mesh  obb-obb  mesh-mesh
        
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * obb 碰 obb
        * @version m4m 1.0
        */
        static obbVsObb(a:obb,b:obb):boolean{
            if (!a || !b) return false;
            let box0 = a;
            let box1 = b;

            let box0_dirs = box0.directions;
            let box1_dirs = box1.directions;

            if (!this.obbOverLap(box0_dirs[0], box0, box1)) return false;
            if (!this.obbOverLap(box0_dirs[1], box0, box1)) return false;
            if (!this.obbOverLap(box0_dirs[2], box0, box1)) return false;
            if (!this.obbOverLap(box1_dirs[0], box0, box1)) return false;
            if (!this.obbOverLap(box1_dirs[1], box0, box1)) return false;
            if (!this.obbOverLap(box1_dirs[2], box0, box1)) return false;

            let tv3 = collision.helpv3;
            m4m.math.vec3Cross(box0_dirs[0], box1_dirs[0], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[0], box1_dirs[1], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[0], box1_dirs[2], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[1], box1_dirs[0], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[1], box1_dirs[1], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[1], box1_dirs[2], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[2], box1_dirs[0], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[2], box1_dirs[1], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;
            m4m.math.vec3Cross(box0_dirs[2], box1_dirs[2], tv3);
            if (!this.obbOverLap(tv3, box0, box1)) return false;

            return true;
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * sphere 碰 sphere
        * @version m4m 1.0
        */
        static sphereVsSphere(a:spherestruct,b:spherestruct){
            if(!a || !b)    return false;
            let dis = math.vec3Distance(a.center, b.center);
            return dis <= a.radius + b.radius;
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * obb 碰 sphere
        * @version m4m 1.0
        */
        static obbVsSphere(a:obb,b:spherestruct):boolean{
            if(!a || !b)    return false;
            let a_dirs = a.directions;

            if (!this.obb_SphereOverLap(a_dirs[0], a, b)) return false;
            if (!this.obb_SphereOverLap(a_dirs[1], a, b)) return false;
            if (!this.obb_SphereOverLap(a_dirs[2], a, b)) return false;

            let axis = collision.helpv3;
            m4m.math.vec3Subtract(a.worldCenter,b.center,axis); //obb 上 到圆心最近点 的轴
            m4m.math.vec3Normalize(axis,axis);
            if (!this.obb_SphereOverLap(axis, a, b)) return false;
            let tv3_1 = collision.helpv3_1;
            m4m.math.vec3Cross(a_dirs[0], axis, tv3_1);
            if (!this.obb_SphereOverLap(tv3_1, a, b)) return false;
            m4m.math.vec3Cross(a_dirs[1], axis, tv3_1);
            if (!this.obb_SphereOverLap(tv3_1, a, b)) return false;
            m4m.math.vec3Cross(a_dirs[2], axis, tv3_1);
            if (!this.obb_SphereOverLap(tv3_1, a, b)) return false;

            return true;
        }

        //MeshVsMesh

        //obbVsMesh

        //SphereVsMesh

        //tool fun
        private static helpv2 = new m4m.math.vector2();
        private static helpv2_1 = new m4m.math.vector2();
        /**
         * 判断 obb 与 球的重叠
         * @param axis 轴
         * @param box0 obb
         * @param sphere 球
         * @returns 重叠了？
         */
        private static obb_SphereOverLap(axis: m4m.math.vector3, box0: obb, sphere: spherestruct){
            let tv2 = this.helpv2;
            let tv2_1 = this.helpv2_1;
            box0.computeExtentsByAxis(axis,tv2);
            sphere.computeExtentsByAxis(axis,tv2_1);
            return this.extentsOverlap(tv2,tv2_1);
        }

        /**
         * 判断 obb 与 另一obb重叠
         * @param axis 轴
         * @param box0 obb
         * @param box1 另一obb
         * @returns 重叠了？
         */
        private static obbOverLap(axis: m4m.math.vector3, box0: obb, box1: obb){
            let tv2 = this.helpv2;
            let tv2_1 = this.helpv2_1;
            box0.computeExtentsByAxis(axis,tv2);
            box1.computeExtentsByAxis(axis,tv2_1);
            return this.extentsOverlap(tv2,tv2_1);
        }

        /**
         * 判断两标量区间 重叠
         * @param a 标量区间a
         * @param b 标量区间b
         * @returns 重叠了？
         */
        private static extentsOverlap(a:math.vector2,b:math.vector2): boolean
        {
            return !(a.x > b.y || b.x > a.y);
        }
    }
}