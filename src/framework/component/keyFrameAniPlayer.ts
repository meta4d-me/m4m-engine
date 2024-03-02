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
/// <reference path="../../io/reflect.ts" />

namespace m4m.framework {
    export enum AnimationCullingType {
        /** Animation culling is disabled - object is animated even when offscreen. */
        AlwaysAnimate = 0,
        /** Animation is disabled when renderers are not visible. */
        BasedOnRenderers = 1,
        BasedOnClipBounds = 2,
        BasedOnUserBounds = 3
    }

    @reflect.nodeComponent
    export class keyFrameAniPlayer implements INodeComponent {
        static readonly ClassName: string = "keyFrameAniPlayer";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 关键帧动画数组
         * @version m4m 1.0
         */
        @reflect.Field("keyFrameAniClip[]")
        clips: keyFrameAniClip[];

        private clipMap: { [name: string]: keyFrameAniClip } = {};
        //当前播放的clip
        private _nowClip: keyFrameAniClip;
        //当前播放到的帧
        private get nowFrame() {
            if (!this._nowClip) return 0;
            return Math.floor(this._nowClip.fps * this._nowTime);
        };
        //当前播放到的时间
        private _nowTime: number = 0;
        /** 当前播放到的时间 */
        public get nowTime() { return this._nowTime; };

        //对象路径map
        private pathPropertyMap = {};

        gameObject: gameObject;

        private playEndDic: { [aniName: string]: () => void } = {};

        private _currClipName: string = "";
        /** 获得当前片段的名字 */
        get currClipName() { return this._currClipName; }

        private _speed: number = 1;
        /** 播放速度 */
        get speed() { return this._speed; }
        set speed(v: number) { this._speed = v; }

        private _animateOnlyIfVisible = true;
        /** 动画是否仅仅可显示时 有效播放 */
        get animateOnlyIfVisible() { return this._animateOnlyIfVisible; }
        set animateOnlyIfVisible(v: boolean) { this._animateOnlyIfVisible = v; }

        private _cullingType: AnimationCullingType = AnimationCullingType.AlwaysAnimate;
        /** 动画的剔除类型 */
        get cullingType() { return this._cullingType; }
        set cullingType(v) { this._cullingType = v; }

        private _localBounds: aabb;
        /** 动画的剔除类型 */
        get localBounds() { return this._localBounds; }
        set localBounds(v) { this._localBounds = v; }
        /** 播放结束的归一化时间点 范围 0 ~ 1 */
        private endNormalizedTime: number = 1;

        start() {
            this.init();
        }

        onPlay() {

        }

        update(delta: number) {
            if (this._animateOnlyIfVisible && !this.gameObject.visible) return;
            let clip = this._nowClip;
            if (!clip) return;
            this._nowTime += delta * this._speed;
            let raelTime = this._nowTime;
            let clipTime = clip.time;
            //    
            //是否播完
            if (this.checkPlayEnd(clip)) {
                this.OnClipPlayEnd();
            }
            this._nowTime = raelTime % clipTime;
            let playTime = this._nowClip == null ? clipTime : this._nowTime;  //当前播放时间
            this.displayByTime(clip, playTime);
        }

        /**
         * 获取指定名称的clip 资源 
         * @param clipName 
         */
        getClip(clipName: string) {
            if (!this.clips || this.clips.length < 1) return;
            if (this.clipMap[clipName]) return this.clipMap[clipName];
            let len = this.clips.length;
            for (var i = 0; i < len; i++) {
                let clip = this.clips[i];
                if (clip && clip.getName() == clipName) return clip;
            }
        }

        /**
         * 播放到指定时间状态
         * @param clip 关键帧动画片段对象
         * @param playTime 播放到指定时间
         */
        private displayByTime(clip: keyFrameAniClip, playTime: number) {
            let curves = this.timeFilterCurves(clip, playTime);
            if (!curves || curves.length < 1) return;
            //修改属性值
            for (var i = 0; i < curves.length; i++) {
                let tempc = curves[i];
                this.refrasCurveProperty(tempc, playTime);
            }
        }

        //通过时间计算curve 值
        // 插值函数
        private static lhvec = new m4m.math.vector3();
        private static rhvec = new m4m.math.vector3();
        private static lhquat = new m4m.math.quaternion();
        private static rhquat = new m4m.math.quaternion();
        private static resvec = new m4m.math.vector3();
        private static resquat = new m4m.math.quaternion();
        /**
         * 计算vec3 差值函数
         */
        private static vec3lerp(a: m4m.math.vector3, b: m4m.math.vector3, t: number, out: m4m.math.vector3) {
            out.x = a.x + t * (b.x - a.x);
            out.y = a.y + t * (b.y - a.y);
            out.z = a.z + t * (b.z - a.z);
            return out;
        }
        /**
         * 计算四元数 球形差值函数
         */
        private static quatSlerp(a: m4m.math.quaternion, b: m4m.math.quaternion, t: number, out: m4m.math.quaternion) {
            let omega, cosom, sinom, scale0, scale1;

            cosom = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
            if (cosom < 0.0) {
                cosom = -cosom;
                b.x = - b.x;
                b.y = - b.y;
                b.z = - b.z;
                b.w = - b.w;
            }
            if ((1.0 - cosom) > 0.000001) {
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1.0 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            } else {
                scale0 = 1.0 - t;
                scale1 = t;
            }
            out.x = scale0 * a.x + scale1 * b.x;
            out.y = scale0 * a.y + scale1 * b.y;
            out.z = scale0 * a.z + scale1 * b.z;
            out.w = scale0 * a.w + scale1 * b.w;

            return out;
        }
        /**
         * 通过时间轴在曲线上计算数值
         * @param curve 曲线
         * @param playTime 时间轴上的时间
         * @returns 返回的数据值
         */
        private calcValueByTime(curve: AnimationCurve, playTime: number) {
            let kfs = curve.keyFrames;
            if (!kfs || kfs.length < 1) return 0;
            if (kfs.length == 1 && kfs[0]) return kfs[0].value;
            //找到目标关键帧
            let leftKf: keyFrame;
            let rightKf: keyFrame;
            for (var i = 0; i < kfs.length; i++) {
                rightKf = kfs[i];
                if (kfs[i].time > playTime) {
                    if (i > 0) leftKf = kfs[i - 1];
                    break;
                }
            }
            // NOTE: Using LINEAR instead of bezier
            const progress = leftKf
                ? (playTime - leftKf.time) / (rightKf.time - leftKf.time)
                : 1;
            switch (curve.propertyName) {
                case 'localScale':
                case 'localTranslate':
                    keyFrameAniPlayer.rhvec.x = rightKf.value[0];
                    keyFrameAniPlayer.rhvec.y = rightKf.value[1];
                    keyFrameAniPlayer.rhvec.z = rightKf.value[2];
                    if (!leftKf) {
                        return keyFrameAniPlayer.rhvec;
                    }
                    keyFrameAniPlayer.lhvec.x = leftKf.value[0];
                    keyFrameAniPlayer.lhvec.y = leftKf.value[1];
                    keyFrameAniPlayer.lhvec.z = leftKf.value[2];

                    return keyFrameAniPlayer.vec3lerp(keyFrameAniPlayer.lhvec, keyFrameAniPlayer.rhvec, progress, keyFrameAniPlayer.resvec); break;
                case 'localRotate':
                    keyFrameAniPlayer.rhquat.x = rightKf.value[0];
                    keyFrameAniPlayer.rhquat.y = rightKf.value[1];
                    keyFrameAniPlayer.rhquat.z = rightKf.value[2];
                    keyFrameAniPlayer.rhquat.w = rightKf.value[3];
                    if (!leftKf) {
                        return keyFrameAniPlayer.rhquat;
                    }
                    keyFrameAniPlayer.lhquat.x = leftKf.value[0];
                    keyFrameAniPlayer.lhquat.y = leftKf.value[1];
                    keyFrameAniPlayer.lhquat.z = leftKf.value[2];
                    keyFrameAniPlayer.lhquat.w = leftKf.value[3];

                    return keyFrameAniPlayer.quatSlerp(keyFrameAniPlayer.lhquat, keyFrameAniPlayer.rhquat, progress, keyFrameAniPlayer.resquat);
            }

            return null;
            //贝塞尔算值
            return bezierCurveTool.calcValue(leftKf, rightKf, playTime);
        }

        private eulerStatusMap = {};
        private eulerMap = {};
        /**
         * 刷新curve 的属性
         * @param curve 曲线
         * @param playTime 时间轴上的时间
         */
        private refrasCurveProperty(curve: AnimationCurve, playTime: number) {
            if (playTime < 0 || !curve || curve.keyFrames.length < 2 || StringUtil.isNullOrEmptyObject(curve.propertyName)) return;
            let path = curve.path;
            let key = `${path}_${curve.type}`;
            let obj = this.pathPropertyMap[key];
            if (!obj) return;
            let sub = obj;
            let strs = curve.propertyName.split(".");
            let prop_type = "";
            while (strs.length > 0) {
                if (strs.length == 1) {
                    let str_p = strs[0];
                    const target = this.calcValueByTime(curve, playTime);
                    // const target = 0;
                    if (curve.type == transform["name"]) {
                        if (obj instanceof transform) {
                            if (target) {
                                switch (curve.propertyName) {
                                    case 'localScale':
                                        obj.localScale.x = target['x'];
                                        obj.localScale.y = target['y'];
                                        obj.localScale.z = target['z'];
                                        break;
                                    case 'localTranslate':
                                        obj.localTranslate.x = target['x'];
                                        obj.localTranslate.y = target['y'];
                                        obj.localTranslate.z = target['z'];
                                        break;
                                    case 'localRotate':
                                        obj.localRotate.x = target['x'];
                                        obj.localRotate.y = target['y'];
                                        obj.localRotate.z = target['z'];
                                        obj.localRotate.w = target['w'];
                                        break;
                                }
                            }

                            // if(prop_type == "localEulerAngles"){
                            //     if(!this.eulerStatusMap[path]) this.eulerStatusMap[path] = 0;
                            //     let p_val = 0;
                            //     switch(str_p){
                            //         case "x" : p_val = 0;  break;
                            //         case "y" : p_val = 1;  break;
                            //         case "z" : p_val = 2;  break;
                            //     }

                            //     this.eulerStatusMap[path] |= 1 << p_val;
                            //     this.eulerMap[path+str_p] = target;

                            //     if(this.eulerStatusMap[path] == 7){
                            //         this.eulerStatusMap[path] = 0;
                            //         sub.x = this.eulerMap[path+'x'];
                            //         sub.y = this.eulerMap[path+'y'];
                            //         sub.z = this.eulerMap[path+'z'];
                            //         obj.localEulerAngles = sub;
                            //         // m4m.math.quatNormalize(obj.localRotate,obj.localRotate);
                            //         // obj.localRotate = obj.localRotate;
                            //     }
                            // } else {
                            //     sub[str_p] = target;
                            // }

                            // obj.markDirty();
                            // obj["dirtyLocal"] = true;
                            obj["dirtify"](true);
                            // dirtify


                        }
                    }
                    return;
                }
                let str = strs.shift();
                prop_type = str;
                sub = sub[str];
                if (!sub)
                    return;
            }
        }

        /**
         * 按时间筛选需要播放的 curve
         * @param clip 动画片段
         * @param nowTime 时间
         * @returns 曲线列表
         */
        private timeFilterCurves(clip: keyFrameAniClip, nowTime: number) {
            if (!clip || clip.curves.length < 1) return;
            let result: AnimationCurve[] = [];
            for (var i = 0; i < clip.curves.length; i++) {
                let curve = clip.curves[i];
                let kfs = curve.keyFrames;
                if (kfs.length < 1 || !kfs[kfs.length - 1] || kfs[kfs.length - 1].time < nowTime) continue;
                result.push(curve);
            }
            return result;
        }

        /**
         * 检查播放是否完毕
         * @param clip 动画片段
         * @returns 是播放结束了？
         */
        private checkPlayEnd(clip: keyFrameAniClip) {
            if (!clip) return true;
            if (clip._wrapMode == WrapMode.Loop || clip._wrapMode == WrapMode.PingPong) return false;
            if (this._nowTime >= clip.time * this.endNormalizedTime) return true;
        }

        /**
         * 初始化
         */
        private init() {
            if (this.clips) {
                let len = this.clips.length;
                for (let i = 0; i < len; i++) {
                    let clip = this.clips[i];
                    if (i == 0) this._currClipName = clip.getName();
                    this.clipMap[clip.getName()] = clip;
                }
            }
        }

        /**
         * 动画是否在播放
         * @param ClipName 指定片段名 ，不指定仅判断当前是否在执行
         */
        isPlaying(ClipName: string = "") {
            if (!this._nowClip) return false;
            if (ClipName) return this._nowClip.getName() == ClipName;
            return true;
        }

        // /**
        //  * @public
        //  * @language zh_CN
        //  * @classdesc
        //  * 播放指定动画
        //  * @version m4m 1.0
        //  */
        // playByName(ClipName: string, onPlayEnd: () => void = null)
        // {
        //     let clip = this.getClip(ClipName);
        //     this.playByClip(clip, onPlayEnd);
        // }

        /**
         * 播放动画
         * @param ClipName 指定播放的动画 片段名（为空状态播放队列第一个）
         * @param onPlayEnd 播放结束后回调函数
         * @param normalizedTime 播放结束时间点归一化时间（范围：0~1）
         */
        play(ClipName: string = "", onPlayEnd: () => void = null, normalizedTime: number = 1) {
            if (!this.clips) return;
            if (!isNaN(normalizedTime) && normalizedTime != null) {
                this.endNormalizedTime = math.floatClamp(normalizedTime, 0, 1);
            }
            let clip = this.getClip(ClipName);
            this.playByClip(clip, onPlayEnd);
        }

        /**
         * 播放动画 通过 clip
         * @param clip 
         */
        private playByClip(clip: keyFrameAniClip, onPlayEnd: () => void = null) {
            if (this._nowClip) {
                this.OnClipPlayEnd();
            }

            if (!clip) return;
            let clipName = clip.getName();
            this.playEndDic[clipName] = onPlayEnd;
            this._nowTime = 0;
            this._nowClip = clip;
            this._currClipName = clipName;
            this.collectPathPropertyObj(this._nowClip, this.pathPropertyMap);
        }

        /** clip 播放完毕 */
        private OnClipPlayEnd() {
            if (!this._nowClip) return;
            let clipName = this._nowClip.getName();
            this._nowClip = null;
            this._nowTime = 0;
            this.endNormalizedTime = 1;
            let endFunc = this.playEndDic[clipName];
            if (endFunc) endFunc();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 停止默认动画
         * @version m4m 1.0
         */
        stop() {
            this._nowClip = null;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 倒带默认动画
         * @version m4m 1.0
         */
        rewind() {
            if (!this._nowClip) return;
            this.displayByTime(this._nowClip, 0);  //到第一帧
            this._nowTime = 0;
        }

        /**
         * 添加片段
         * @param clip 动画片段
         */
        addClip(clip: keyFrameAniClip) {
            if (!this.clips) this.clips = [];
            this.clips.push(clip);
            this.clipMap[clip.getName()] = clip;
        }

        /**
         * 收集动画片段的属性
         * @param clip 动画片段
         */
        private collectPropertyObj(clip: keyFrameAniClip) {
            if (!clip) return;
            for (var i = 0; i < clip.curves.length; i++) {  //"gameobj_0/gameobj_1"
                let curve = clip.curves[i];
                let tran = this.gameObject.transform;
                if (!StringUtil.isNullOrEmptyObject(curve.path)) {
                    tran = this.pathPropertyMap[curve.path];
                }
                let comp: any = tran;
                if (curve.type != transform.prototype.name) {
                    comp = tran.gameObject.getComponent(curve.type);
                }
                if (!comp) continue;

            }
        }

        /**
         * children对象收集路径
         * @param clip 动画片段
         * @param pathMap 路径字典容器
         */
        private collectPathPropertyObj(clip: keyFrameAniClip, pathMap) {
            if (!clip || !pathMap) return;
            for (var i = 0; i < clip.curves.length; i++) {  //"gameobj_0/gameobj_1"
                let curve = clip.curves[i];
                let key = "";
                let tran = this.gameObject.transform;
                if (!StringUtil.isNullOrEmptyObject(curve.path)) {
                    let strs = curve.path.split("/");
                    for (var j = 0; j < strs.length; j++) {
                        tran = this.serchChild(strs[j], tran);
                        if (!tran) break;
                    }
                    if (!tran) continue;
                }
                key = `${curve.path}_${curve.type}`;
                let comp: any = tran;
                if (curve.type != transform["name"]) {
                    comp = tran.gameObject.getComponent(curve.type);
                }
                pathMap[key] = comp;
            }
        }

        //寻找child by name
        private serchChild(name: string, trans: transform) {
            if (!trans || !trans.children || trans.children.length < 1) return;
            for (var i = 0; i < trans.children.length; i++) {
                let child = trans.children[i];
                if (child && child.name == name)
                    return child;
            }
        }

        clone() {

        }

        remove() {
            this.gameObject = null;
            this.pathPropertyMap = null;
            this._nowClip = null;
            if (this.clips) {
                this.clips.length = 0;
            }
            this.clips = null;

            this.clipMap = null;
            this.playEndDic = null;
        }
    }

    //贝塞尔计算工具
    class bezierCurveTool {
        private static cupV2 = new math.vector2();
        /**
         * 计算值
         * @param kf_l 左边的关键帧
         * @param kf_r 右边边的关键帧
         * @param playTime 时间
         * @returns 返回输出值
         */
        static calcValue(kf_l: keyFrame, kf_r: keyFrame, playTime: number) {
            //是否 是常量
            if (kf_l.outTangent == Infinity || kf_r.inTangent == Infinity) return kf_l.value;
            let rate = (playTime - kf_l.time) / (kf_r.time - kf_l.time);
            let v2 = bezierCurveTool.converCalc(kf_l.value, kf_r.value, kf_l.time, kf_r.time, kf_l.inTangent, kf_r.outTangent, rate);
            return v2.y;
        }

        /**
         * 转换计算
         * @param inV 入值
         * @param outV 出值
         * @param inTime 入时间
         * @param outTime 出时间
         * @param inTangent 入切斜率
         * @param outTangent 出切斜率
         * @param t 单位化时间值（0-1）
         * @returns 曲线值
         */
        private static converCalc(inV: number, outV: number, inTime: number, outTime: number, inTangent: number, outTangent: number, t: number) {
            let p0 = math.pool.new_vector2(inTime, inV);
            let p1 = math.pool.new_vector2();
            let p2 = math.pool.new_vector2();
            let p3 = math.pool.new_vector2(outTime, outV);

            let dir1 = math.pool.new_vector2(inTangent < 0 ? -1 : 1, Math.sqrt(1 + inTangent * inTangent));
            let dir2 = math.pool.new_vector2(outTangent < 0 ? -1 : 1, Math.sqrt(1 + outTangent * outTangent));
            math.vec2Add(p0, dir1, p1);
            math.vec2Add(p3, dir2, p2);
            bezierCurveTool.calcCurve(t, p0, p1, p2, p3, bezierCurveTool.cupV2);

            math.pool.delete_vector2Array([p0, p1, p2, p3, dir1, dir2]);
            return bezierCurveTool.cupV2;
        }

        /** 三阶 贝塞尔曲线 */
        private static calcCurve(t: number, P0: math.vector2, P1: math.vector2, P2: math.vector2, P3: math.vector2, out: math.vector2) {
            var equation = (t: number, val0: number, val1: number, val2: number, val3: number) => {
                var res = (1.0 - t) * (1.0 - t) * (1.0 - t) * val0 + 3.0 * t * (1.0 - t) * (1.0 - t) * val1 + 3.0 * t * t * (1.0 - t) * val2 + t * t * t * val3;
                return res;
            }
            out.x = equation(t, P0.x, P1.x, P2.x, P3.x);
            out.y = equation(t, P0.y, P1.y, P2.y, P3.y);
            return out;
        }
    }
}