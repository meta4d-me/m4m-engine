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
﻿namespace m4m.framework {
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 射线
     * @version m4m 1.0
     */
    export class ray {
        private static readonly help_v3 = new math.vector3();
        private static readonly help_v3_1 = new math.vector3();
        private static readonly help_v3_2 = new math.vector3();

        public origin: math.vector3 = new math.vector3();
        public direction: math.vector3 = new math.vector3();
        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 构建射线
        * @param _origin 射线起点
        * @param _dir 射线方向
        * @version m4m 1.0
        * @platform Web,Native
        */
        constructor(_origin: m4m.math.vector3, _dir: m4m.math.vector3) {
            this.set(_origin, _dir);
        }

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 设置射线的属性
        * @param _origin 射线起点
        * @param _dir 射线方向
        * @version m4m 1.0
        * @platform Web,Native
        */
        set(_origin: m4m.math.vector3, _dir: m4m.math.vector3) {
            math.vec3Clone(_origin, this.origin);
            math.vec3Clone(_dir, this.direction);
        }

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 与aabb碰撞相交检测
        * @param _aabb 待检测aabb
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectAABB(_aabb: aabb): boolean {
            return this.intersectBoxMinMax(_aabb.minimum, _aabb.maximum);
        }

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 与transform表示的plane碰撞相交检测，主要用于2d检测
        * @param tran transform
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectPlaneTransform(tran: transform, outInfo: pickinfo): boolean {
            let ishided = false;
            var panelpoint = tran.getWorldTranslate();
            var forward = m4m.math.pool.new_vector3();
            tran.getForwardInWorld(forward);
            var hitposition = m4m.math.pool.new_vector3();
            ishided = this.intersectPlane(panelpoint, forward, hitposition);
            if (ishided) {
                m4m.math.vec3Clone(hitposition, outInfo.hitposition);
                outInfo.distance = m4m.math.vec3Distance(outInfo.hitposition, this.origin);
                outInfo.pickedtran = tran;
            }
            m4m.math.pool.delete_vector3(forward);
            m4m.math.pool.delete_vector3(hitposition);

            return ishided;
        }

        /**
         * 判断 与一个平面 是否相交
         * @param planePoint 平面上的点
         * @param planeNormal 平面法向量
         * @param outHitPoint 输出的碰撞点坐标
         * @returns 碰撞了？
         */
        public intersectPlane(planePoint: m4m.math.vector3, planeNormal: m4m.math.vector3, outHitPoint: m4m.math.vector3): boolean {
            var vp1 = planeNormal.x;
            var vp2 = planeNormal.y;
            var vp3 = planeNormal.z;
            var n1 = planePoint.x;
            var n2 = planePoint.y;
            var n3 = planePoint.z;
            var v1 = this.direction.x;
            var v2 = this.direction.y;
            var v3 = this.direction.z;
            var m1 = this.origin.x;
            var m2 = this.origin.y;
            var m3 = this.origin.z;
            var vpt = v1 * vp1 + v2 * vp2 + v3 * vp3;
            if (vpt === 0) {
                return false;
            }
            else {
                var t = ((n1 - m1) * vp1 + (n2 - m2) * vp2 + (n3 - m3) * vp3) / vpt;
                outHitPoint.x = m1 + v1 * t;
                outHitPoint.y = m2 + v2 * t;
                outHitPoint.z = m3 + v3 * t;
                //return new m4m.math.vector3(m1 + v1 * t, m2 + v2 * t, m3 + v3 * t);
                return true;
            }
        }

        private static tempMData: render.meshData;
        private static tempVecs: m4m.math.vector3[];

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 与碰撞盒相交检测
        * @param tran 待检测带碰撞盒的transform
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectCollider(tran: transform, outInfo: pickinfo): boolean {
            let ishided = false;
            let _collider: ICollider = tran.gameObject.collider;
            let lastDistance = Number.MAX_VALUE;
            if (_collider instanceof boxcollider) {
                let obb = _collider.getBound() as obb;
                if (!obb) return ishided;
                if (!ray.tempVecs) {
                    ray.tempVecs = [];
                    for (let i = 0; i < 8; i++) {
                        ray.tempVecs.push(new m4m.math.vector3());
                    }
                }
                let wVects = obb.vectorsWorld;
                for (let i = 0; i < 8; i++) {
                    math.vec3Clone(wVects[i], ray.tempVecs[i]);
                }

                // obb.caclWorldVecs(ray.tempVecs, _collider.gameObject.transform.getWorldMatrix());   
                if (!ray.tempMData) ray.tempMData = new render.meshData();
                m4m.render.meshData.genBoxByArray(ray.tempVecs, ray.tempMData);
                let data = ray.tempMData;
                const trisindexLen = data.getTriIndexCount();
                for (var index = 0; index < trisindexLen; index += 3) {
                    // var p0 = data.pos[data.trisindex[index]];
                    // var p1 = data.pos[data.trisindex[index + 1]];
                    // var p2 = data.pos[data.trisindex[index + 2]];
                    const triIdx0 = data.getTriIndex(index);
                    const triIdx1 = data.getTriIndex(index + 1);
                    const triIdx2 = data.getTriIndex(index + 2);
                    let p0 = ray.help_v3;
                    let p1 = ray.help_v3_1;
                    let p2 = ray.help_v3_2;
                    data.getPosition(triIdx0, p0);
                    data.getPosition(triIdx1, p1);
                    data.getPosition(triIdx2, p2);

                    let tempinfo = math.pool.new_pickInfo();
                    let bool = this.intersectsTriangle(p0, p1, p2, tempinfo);
                    if (bool) {
                        if (tempinfo.distance < 0) continue;
                        if (lastDistance > tempinfo.distance) {
                            ishided = true;
                            outInfo.cloneFrom(tempinfo);
                            outInfo.pickedtran = tran;
                            lastDistance = outInfo.distance;
                            var tdir = m4m.math.pool.new_vector3();
                            m4m.math.vec3ScaleByNum(this.direction, outInfo.distance, tdir);
                            m4m.math.vec3Add(this.origin, tdir, outInfo.hitposition);
                            m4m.math.pool.delete_vector3(tdir);
                        }
                    }
                    math.pool.delete_pickInfo(tempinfo);
                }
            }
            else if (_collider instanceof meshcollider) {
                let mesh = _collider.getBound();
                if (mesh != null) {
                    ishided = mesh.intersects(this, tran.getWorldMatrix(), outInfo);
                }
            }
            else if (_collider instanceof canvasRenderer) {
                ishided = this.intersectPlaneTransform(tran, outInfo);
            }
            return ishided;
        }

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 与最大最小点表示的box相交检测
        * @param minimum
        * @param maximum
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectBoxMinMax(minimum: m4m.math.vector3, maximum: m4m.math.vector3): boolean {
            var d = 0.0;
            var maxValue = Number.MAX_VALUE;
            var inv: number;
            var min: number;
            var max: number;
            var temp: number;
            if (Math.abs(this.direction.x) < 0.0000001) {
                if (this.origin.x < minimum.x || this.origin.x > maximum.x) {
                    return false;
                }
            }
            else {
                inv = 1.0 / this.direction.x;
                min = (minimum.x - this.origin.x) * inv;
                max = (maximum.x - this.origin.x) * inv;
                if (max === -Infinity) {
                    max = Infinity;
                }

                if (min > max) {
                    temp = min;
                    min = max;
                    max = temp;
                }

                d = Math.max(min, d);
                maxValue = Math.min(max, maxValue);

                if (d > maxValue) {
                    return false;
                }
            }

            if (Math.abs(this.direction.y) < 0.0000001) {
                if (this.origin.y < minimum.y || this.origin.y > maximum.y) {
                    return false;
                }
            }
            else {
                inv = 1.0 / this.direction.y;
                min = (minimum.y - this.origin.y) * inv;
                max = (maximum.y - this.origin.y) * inv;

                if (max === -Infinity) {
                    max = Infinity;
                }

                if (min > max) {
                    temp = min;
                    min = max;
                    max = temp;
                }

                d = Math.max(min, d);
                maxValue = Math.min(max, maxValue);

                if (d > maxValue) {
                    return false;
                }
            }

            if (Math.abs(this.direction.z) < 0.0000001) {
                if (this.origin.z < minimum.z || this.origin.z > maximum.z) {
                    return false;
                }
            }
            else {
                inv = 1.0 / this.direction.z;
                min = (minimum.z - this.origin.z) * inv;
                max = (maximum.z - this.origin.z) * inv;

                if (max === -Infinity) {
                    max = Infinity;
                }

                if (min > max) {
                    temp = min;
                    min = max;
                    max = temp;
                }

                d = Math.max(min, d);
                maxValue = Math.min(max, maxValue);

                if (d > maxValue) {
                    return false;
                }
            }
            return true;
        }
        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 与球相交检测
        * @param center 球圆心坐标
        * @param radius 球半径
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectsSphere(center: m4m.math.vector3, radius: number): boolean {
            var center_ori = m4m.math.pool.new_vector3();
            m4m.math.vec3Subtract(center, this.origin, center_ori);
            var raydist = m4m.math.vec3Dot(this.direction, center_ori);

            if (orilen2 < rad2) return true;//射线起点在球里

            if (raydist < 0) return false;//到圆心的向量在方向向量上的投影为负  夹角不在-90 90

            var orilen2 = m4m.math.vec3SqrLength(center_ori);
            m4m.math.pool.delete_vector3(center_ori);
            var rad2 = radius * radius;

            var d = rad2 - (orilen2 - raydist * raydist);
            if (d < 0) return false;

            return true;
        }
        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 与三角形相交检测
        * @param vertex0 
        * @param vertex1 
        * @param vertex2 
        * @param outInfo 
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectsTriangle(vertex0: m4m.math.vector3, vertex1: m4m.math.vector3, vertex2: m4m.math.vector3, outInfo: pickinfo): boolean {
            var _edge1 = m4m.math.pool.new_vector3();
            var _edge2 = m4m.math.pool.new_vector3();
            var _pvec = m4m.math.pool.new_vector3();
            var _tvec = m4m.math.pool.new_vector3();
            var _qvec = m4m.math.pool.new_vector3();


            m4m.math.vec3Subtract(vertex1, vertex0, _edge1);
            m4m.math.vec3Subtract(vertex2, vertex0, _edge2);
            m4m.math.vec3Cross(this.direction, _edge2, _pvec);
            var det = m4m.math.vec3Dot(_edge1, _pvec);

            if (det === 0) {
                return false;
            }

            var invdet = 1 / det;

            m4m.math.vec3Subtract(this.origin, vertex0, _tvec);

            var bu = m4m.math.vec3Dot(_tvec, _pvec) * invdet;

            if (bu < 0 || bu > 1.0) {
                return false;
            }

            m4m.math.vec3Cross(_tvec, _edge1, _qvec);

            var bv = m4m.math.vec3Dot(this.direction, _qvec) * invdet;

            if (bv < 0 || bu + bv > 1.0) {
                return false;
            }

            var distance = m4m.math.vec3Dot(_edge2, _qvec) * invdet;


            outInfo.init();
            outInfo.bu = bu;
            outInfo.bv = bv;
            outInfo.distance = distance;
            //return new pickinfo(bu, bv, distance);

            math.vec3Cross(_edge1, _edge2, outInfo.normal);
            math.vec3Normalize(outInfo.normal, outInfo.normal);

            m4m.math.pool.delete_vector3(_edge1);
            m4m.math.pool.delete_vector3(_edge2);
            m4m.math.pool.delete_vector3(_pvec);
            m4m.math.pool.delete_vector3(_tvec);
            m4m.math.pool.delete_vector3(_qvec);

            return true;
        }
    }
}