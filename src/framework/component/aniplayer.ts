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
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 动画播放器
     * @version m4m 1.0
     */
    @reflect.nodeComponent
    export class aniplayer implements INodeComponent {
        static readonly ClassName: string = "aniplayer";

        gameObject: gameObject;

        @reflect.Field("animationClip[]")
        clips: animationClip[] = [];
        @reflect.Field("boolean")
        public autoplay: boolean = true;

        @reflect.Field("tPoseInfo[]")
        bones: tPoseInfo[];
        @reflect.Field("PoseBoneMatrix[]")
        startPos: PoseBoneMatrix[];

        private _playClip: animationClip = null;

        //这里面放加载好的动画
        private clipnames: { [key: string]: animationClip } = {};

        private bePlay: boolean = false;
        speed: number = 1.0;
        private beCross: boolean = false;
        private beRevert: boolean = false;

        private _playTimer: number = 0;
        private _playFrameid: number = 0;
        private _playCount = 0;
        private crossTotalTime: number = 0;
        private crossRestTimer: number = 0;
        private crossPercentage: number = 0;

        private curFrame: Float32Array;
        private lastFrame: { [key: string]: PoseBoneMatrix };
        //private lastframee:Float32Array;
        //private lastIndexDic:{[boneName:string]:number};
        private carelist: { [id: string]: transform } = {};
        private careBoneMat: { [id: string]: PoseBoneMatrix } = {};

        private inversTpos: { [key: string]: PoseBoneMatrix } = {};
        //private Tpos: { [key: string]: tPoseInfo} = {};

        //tpose: { [key: string]: math.matrix } = {};
        private startepose: { [key: string]: PoseBoneMatrix } = {};

        private _hasBoneMap: { [boneName: string]: boolean };
        private get hasBoneMap() {
            if (!this._hasBoneMap) {
                let _map = this._hasBoneMap = {};
                for (let i = 0; i < this.bones.length; i++) {
                    _map[this.bones[i].name] = true;
                }
            }
            return this._hasBoneMap;
        }

        public get PlayFrameID(): number {
            return this._playFrameid;
        }

        public get currentAniclipName(): string {
            if (this._playClip) {
                return this._playClip.getName();
            } else {
                return null;
            }
        }
        public get currentAniclip(): animationClip {
            return this._playClip;
        }
        /**
         * 动画循环播放次数
         */
        public get playCount() { return this._playCount; }

        /**
         * 初始化
         */
        private init() {
            for (let i = 0; i < this.bones.length; i++) {
                let _info = this.bones[i];
                let name = _info.name;
                var nb = PoseBoneMatrix.create();
                nb.r = _info.tposeq;
                nb.t = _info.tposep;
                nb.invert();
                this.inversTpos[name] = nb;
                //this.Tpos[name]=_info;
                // let bindpose=math.pool.new_matrix();
                // math.matrixMakeTransformRTS(_info.tposep,math.pool.vector3_one,_info.tposeq,bindpose);
                // math.matrixInverse(bindpose,bindpose);
                // this.tpose[name] = bindpose;
                this.startepose[name] = this.startPos[i];
            }

            // let asbones: asbone[] = this.gameObject.getComponentsInChildren("asbone") as asbone[];
            // for (let key in asbones)
            // {
            //     let trans = asbones[key].gameObject.transform;
            //     this.carelist[trans.name] = trans;
            //     this.careBoneMat[trans.name] = PoseBoneMatrix.create();
            //     this.careBoneMat[trans.name].r = math.pool.new_quaternion();
            //     this.careBoneMat[trans.name].t = math.pool.new_vector3();
            //     this.careBoneMat[trans.name].s = 1;
            // }

            this.allAsboneToCareList();
        }

        /**
         * 收集所有的 asbone 到 更新列表
         */
        allAsboneToCareList() {
            let asbones: asbone[] = this.gameObject.getComponentsInChildren("asbone") as asbone[];
            for (let i = 0, len = asbones.length; i < len; i++) {
                let trans = asbones[i].gameObject.transform;
                this.addToCareList(trans);
            }
        }

        /**
         * 添加 到 更新骨骼节点列表 
         * @param bone 骨骼节点
         */
        addToCareList(bone: transform) {
            if (!bone) return;
            let _map = this.hasBoneMap;
            if (!_map[bone.name]) {
                console.info(`aniplayer [${this.gameObject.getName()}] node [${bone.name}] is not a valid bone!`);
                return;
            }
            this.carelist[bone.name] = bone;
            this.careBoneMat[bone.name] = PoseBoneMatrix.create();
            this.careBoneMat[bone.name].r = math.pool.new_quaternion();
            this.careBoneMat[bone.name].t = math.pool.new_vector3();
            this.careBoneMat[bone.name].s = 1;
        }

        private _awaitClips: string[] = [];
        /** 获取待加载的 动画片段名 列表 */
        awaitLoadClipNames() {
            this.collectClipNames();
            return this._awaitClips;
        }

        private _allClipNames: string[] = [];
        /** 所有的动画片段名列表，包含待加载的列表 */
        allClipNames() {
            this.collectClipNames();
            return this._allClipNames;
        }

        private collected = false;
        /**
         * 收集所有片段名
         */
        private collectClipNames() {
            if (this.collected) return;
            if (this.clips) {
                this.clips.forEach(clip => {
                    if (clip) {
                        let cname = clip.getName();
                        this._allClipNames.push(cname);
                        if (!this.haveClip(cname)) {
                            this._awaitClips.push(cname);
                        }
                    }
                });
            }
            this.collected = true;
        }

        /** 添加动画片段 通过名字加载 */
        addClipByNameLoad(_assetMgr: assetMgr, resPath: string, clipName: string, callback?: (state: stateLoad, clipName: string) => any) {
            let url = `${resPath}/${clipName}`;
            _assetMgr.load(url, m4m.framework.AssetTypeEnum.Aniclip, (sta) => {
                if (sta.isfinish) {
                    let clip = sta.resstateFirst.res as m4m.framework.animationClip;
                    this.addClip(clip);
                }
                if (callback) {
                    callback(sta, clipName);
                }
            });
        }

        /** 添加动画片段 */
        addClip(clip: animationClip) {
            if (clip != null) {
                this.clipnames[clip.getName()] = clip;
            }
        }
        /** 是否有装载指定动画判断 */
        haveClip(name: string): boolean {
            return this.clipnames[name] != null;
        }
        /** 获取动画片段 */
        getClip(name: string) {
            return this.clipnames[name];
        }
        start() {
            if (!this.bones) return;
            this.init();
            let len = this.clips.length;
            for (let i = 0; i < len; i++) {
                let clip = this.clips[i];
                if (!clip.frames || Object.keys(clip.frames).length < 1) continue;
                this.addClip(clip);
            }
            let firstClip = this.clips[0];
            if (this.autoplay && firstClip && firstClip.frames && Object.keys(firstClip.frames).length >= 1) {
                this.playAniclip(firstClip);
            }
        }

        onPlay() {

        }
        private temptMat: math.matrix = math.pool.new_matrix();
        frameDirty: boolean = true;
        update(delta: number) {
            if (!this.bePlay) return;
            this.checkFrameId(delta);
            if (!this.bePlay) return;
            if (this.beCross) {
                this.crossRestTimer -= delta * this.speed;
                this.crossPercentage = this.crossRestTimer / this.crossTotalTime;
                if (this.crossRestTimer <= 0) {
                    this.beCross = false;
                }
            }
            let lastFdata = this.curFrame;
            this.frameDirty = false;
            let currFdata = this._playClip.frames[this._playFrameid];
            if (currFdata == lastFdata) return;

            this.frameDirty = true;
            this.curFrame = currFdata;

            const bs = this._playClip.hasScaled
                ? 8 // TODO: 8
                : 7;
            if (!this.curFrame) {
                console.error(`frames of null on aniplayer.update() , framesIsNull :${this._playClip.frames == null} , GameObjectName: ${this.gameObject.getName()} , _playFrameid:${this._playFrameid} , clipName : ${this._playClip.getName()}`);
                return;
            }

            if (this._playClip.indexDic.len)
                for (let bonename in this.carelist) {
                    let trans = this.carelist[bonename];
                    let transMat = this.careBoneMat[bonename];

                    let index = this._playClip.indexDic[bonename];
                    if (index != null) {
                        if (this.beCross && this.lastFrame) {
                            transMat.lerpInWorldWithData(this.inversTpos[bonename], this.lastFrame[bonename], this.curFrame, index * 7 + 1, 1 - this.crossPercentage);
                        } else {
                            transMat.r.x = this.curFrame[index * bs + 1];
                            transMat.r.y = this.curFrame[index * bs + 2];
                            transMat.r.z = this.curFrame[index * bs + 3];
                            transMat.r.w = this.curFrame[index * bs + 4];

                            transMat.t.x = this.curFrame[index * bs + 5];
                            transMat.t.y = this.curFrame[index * bs + 6];
                            transMat.t.z = this.curFrame[index * bs + 7];
                            if (this._playClip.hasScaled) {
                                transMat.s = this.curFrame[index * bs + 8];
                            }
                        }
                        //------------todo 待优化
                        let fmat = PoseBoneMatrix.sMultiply(transMat, this.inversTpos[bonename]);
                        math.matrixMakeTransformRTS(fmat.t, math.pool.vector3_one, fmat.r, this.temptMat);
                        math.matrixMultiply(this.gameObject.transform.getWorldMatrix(), this.temptMat, this.temptMat);

                        trans.setWorldMatrix(this.temptMat);
                        //trans.updateTran(false);

                        // let _matrix: math.matrix = math.pool.new_matrix();
                        // math.matrixMakeTransformRTS(transMat.t,math.pool.vector3_one,transMat.r,_matrix);
                        // math.matrixMultiply(_matrix,this.tpose[bonename],_matrix);
                        // math.matrixMultiply(this.gameObject.transform.getWorldMatrix(), _matrix, _matrix);

                        // trans.setWorldMatrix(_matrix);
                        // let i=0;
                        // trans.updateTran(false);
                    } else {
                        console.error("Bone: " + bonename + " Not Record in Aniclip(" + this._playClip.getName() + ").");
                    }
                }
            this.recyclecache();
        }

        private playEndDic: { [aniName: string]: () => void } = {};

        /**
         * @public
         * @language zh_CN
         * @param animName 动画片段名字
         * @param speed 播放速度
         * @param beRevert 是否倒播
         * @classdesc
         * 根据动画片段名字播放动画
         * @version m4m 1.0
         */
        play(animName: string, onPlayEnd: () => void = null, speed: number = 1.0, beRevert: boolean = false) {
            let clip = this.clipnames[animName];
            if (clip == null) {
                console.error("animclip " + this.gameObject.transform.name + "  " + animName + " is not exist");
                return;
            }
            if (this.bePlay) {
                this.OnClipPlayEnd();
            }
            this.beCross = false;
            this.beActivedEndFrame = false;
            this.playAniclip(clip, onPlayEnd, speed, beRevert);
        }
        /**
         * @public
         * @language zh_CN
         * @param animName 动画片段名字
         * @param crosstimer 融合时间
         * @param speed 播放速度
         * @param beRevert 是否倒播
         * @classdesc
         * 根据动画片段名字播放动画
         * @version m4m 1.0
         */
        playCross(animName: string, crosstimer: number, onPlayEnd: () => void = null, speed: number = 1.0, beRevert: boolean = false) {
            let clip = this.clipnames[animName];
            if (clip == null) {
                console.error("animclip " + this.gameObject.transform.name + "  " + animName + " is not exist");
                return;
            }
            if (this.bePlay)//正在播放其他动画
            {
                if (crosstimer > 0 && this.curFrame) {
                    this.recordeLastFrameData();
                    this.beCross = true;
                    this.crossTotalTime = crosstimer;
                    this.crossRestTimer = crosstimer;
                } else {
                    this.beCross = false;
                }
                this.OnClipPlayEnd();
            }
            this.beActivedEndFrame = false;
            this.playAniclip(clip, onPlayEnd, speed, beRevert);
        }
        private beActivedEndFrame: boolean = false;
        private endFrame: number = 0;
        /**
         * 播放到指定帧
         * @param animName 动画名
         * @param endframe 结束帧
         * @param crosstimer 融合时间
         * @param onPlayEnd 当播放结束回调
         * @param speed 速度
         */
        playToXFrame(animName: string, endframe: number, crosstimer: number = 0, onPlayEnd: () => void = null, speed: number = 1.0) {
            let clip = this.clipnames[animName];
            if (clip == null) {
                console.error("animclip " + this.gameObject.transform.name + "  " + animName + " is not exist");
                return;
            }
            if (this.bePlay)//正在播放其他动画
            {
                if (crosstimer > 0 && this.curFrame) {
                    this.recordeLastFrameData();
                    this.beCross = true;
                    this.crossTotalTime = crosstimer;
                    this.crossRestTimer = crosstimer;
                } else {
                    this.beCross = false;
                }
                this.OnClipPlayEnd();
            }
            if (endframe >= 0) {
                this.beActivedEndFrame = true;
                this.endFrame = endframe;
            } else {
                this.beActivedEndFrame = false;
            }
            this.playAniclip(clip, onPlayEnd, speed, false);
        }

        //private tempPoseMat:PoseBoneMatrix=PoseBoneMatrix.createDefault();
        // private tempPoseMat1:PoseBoneMatrix=PoseBoneMatrix.createDefault();

        /**
         * 记录上帧数据
         */
        private recordeLastFrameData() {
            if (this.lastFrame == null) this.lastFrame = {};
            for (let key in this._playClip.bones) {
                let bonename = this._playClip.bones[key];
                if (!this.lastFrame[bonename]) {
                    this.lastFrame[bonename] = PoseBoneMatrix.create();
                }
                let index = this._playClip.indexDic[bonename];
                this.lastFrame[bonename].copyFromData(this.curFrame, index * 7 + 1);
            }
        }

        /**
         * 播放动画片段
         * @param aniclip 动画片段
         * @param onPlayEnd 当播放结束回调
         * @param speed 播放速度
         * @param beRevert 是否翻转
         */
        private playAniclip(aniclip: animationClip, onPlayEnd: () => void = null, speed: number = 1.0, beRevert: boolean = false) {
            this.beActived = true;
            this.bePlay = true;
            this._playTimer = 0;
            this._playFrameid = 0;
            this._playCount = 0;
            this._playClip = aniclip;
            this.playEndDic[aniclip.getName()] = onPlayEnd;
            this.speed = speed;
            this.beRevert = beRevert;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 停止播放动画
         * @version m4m 1.0
         */
        stop(): void {
            if (this.bePlay) {
                this.OnClipPlayEnd();
            }
        }

        /**
         * 暂停播放
         */
        pause(): void {
            if (this.bePlay) {
                this.bePlay = false;
            } else if (!this.bePlay && this._playClip) {
                this.bePlay = true;
            }
        }

        /**
         * 是否在播放动画
         */
        isPlay(): boolean {
            return this.bePlay;
        }
        /**
         * 是否在停止动画
         */
        isStop(): boolean {
            return !this.bePlay;
        }
        remove() {
            if (this.clips)
                this.clips.forEach(temp => {
                    if (temp) temp.unuse();
                });
            for (let key in this.lastFrame) {
                PoseBoneMatrix.recycle(this.lastFrame[key]);
            }
            for (let key in this.careBoneMat) {
                PoseBoneMatrix.recycle(this.careBoneMat[key]);
            }
            for (let key in this.boneCache) {
                PoseBoneMatrix.recycle(this.boneCache[key]);
            }
            this.clips.length = 0;
            this.bones.length = 0;
            this.startPos.length = 0;
            this.startepose = null;
            this._playClip = null;
            this.curFrame = null;
            this.lastFrame = null;
            this.careBoneMat = null;
            this.boneCache = null;

            delete this.inversTpos;
            delete this.carelist;
        }
        /** @deprecated [已弃用] */
        clone() {

        }
        /**
         * 检查帧ID
         * @param delay dt
         */
        private checkFrameId(delay: number): void {
            let lastFid = this._playFrameid;
            this._playTimer += delay * this.speed;
            this._playFrameid = (this._playClip.fps * this._playTimer) | 0;
            let clipFrameCount = this._playClip.frameCount;
            if (this.beActivedEndFrame && this._playFrameid > this.endFrame) {
                this._playFrameid = this.endFrame;
                if (lastFid == this.endFrame) {
                    this.OnClipPlayEnd();
                }
            } else if (this._playClip.loop)//加上循环与非循环动画的分别控制
            {
                this._playCount = Math.floor(this._playFrameid / clipFrameCount);
                this._playFrameid %= clipFrameCount;
            }
            else if (this._playFrameid > clipFrameCount - 1) {
                this._playFrameid = clipFrameCount - 1;
                //-------------------OnPlayEnd
                this.OnClipPlayEnd();
            }

            if (this.beRevert) {
                this._playFrameid = clipFrameCount - this._playFrameid - 1;
            }

            //避免 _playFrameid 为负
            this._playFrameid = this._playFrameid < 0 ? 0 : this._playFrameid;
        }
        
        /**
         * 当片段播放结束是回调
         */
        private OnClipPlayEnd() {
            let Clipame = this._playClip ? this._playClip.getName() : "";
            this._playClip = null;
            // this.lastFrame=null;
            this.bePlay = false;
            this.beCross = false;

            let endFunc = this.playEndDic[Clipame];
            if (endFunc) {
                endFunc();
            }
        }
        private beActived: boolean = false;//是否play过动画
        private boneCache: { [id: string]: PoseBoneMatrix } = {};
        /**
         * 回收缓存
         */
        private recyclecache() {
            for (let key in this.boneCache) {
                PoseBoneMatrix.recycle(this.boneCache[key]);
            }
            this.boneCache = {};
        }

        /**
         * 填充骨骼姿态数据
         * @param data 数据
         * @param bones 骨骼列表
         */
        fillPoseData(data: Float32Array, bones: transform[]): void {
            if (!bones || !data) return;
            if (!this.bePlay) {
                if (this.beActived) return;
                for (let i = 0, len = bones.length; i < len; i++) {
                    let bonename = bones[i].name;
                    let boneMat = this.startepose[bonename];
                    data[i * 8 + 0] = boneMat.r.x;
                    data[i * 8 + 1] = boneMat.r.y;
                    data[i * 8 + 2] = boneMat.r.z;
                    data[i * 8 + 3] = boneMat.r.w;
                    data[i * 8 + 4] = boneMat.t.x;
                    data[i * 8 + 5] = boneMat.t.y;
                    data[i * 8 + 6] = boneMat.t.z;
                    data[i * 8 + 7] = boneMat.s ? boneMat.s : 1;
                }
                return;
            }
            if (!this.curFrame) return;
            if (this._playClip.indexDic.len)
                for (let i = 0, len = bones.length; i < len; i++) {
                    let bonename = bones[i].name;
                    let index = this._playClip.indexDic[bonename];

                    if (index != null) {
                        if (this.beCross && this.lastFrame) {
                            // let lastindex=this.lastIndexDic[bonename];
                            let boneMat;
                            if (this.careBoneMat[bonename]) {
                                boneMat = this.careBoneMat[bonename];

                            } else if (this.boneCache[bonename]) {
                                boneMat = this.boneCache[bonename];
                            }
                            else {
                                let mat = PoseBoneMatrix.create();
                                mat.lerpInWorldWithData(this.inversTpos[bonename], this.lastFrame[bonename], this.curFrame, index * 7 + 1, 1 - this.crossPercentage);
                                this.boneCache[bonename] = mat;
                            }
                            data[i * 8 + 0] = boneMat.r.x;
                            data[i * 8 + 1] = boneMat.r.y;
                            data[i * 8 + 2] = boneMat.r.z;
                            data[i * 8 + 3] = boneMat.r.w;
                            data[i * 8 + 4] = boneMat.t.x;
                            data[i * 8 + 5] = boneMat.t.y;
                            data[i * 8 + 6] = boneMat.t.z;
                            // data[i * 8 + 7] = 1;
                            data[i * 8 + 7] = boneMat.s ? boneMat.s : 1;
                        } else {
                            const bs = this._playClip.hasScaled
                                ? 8
                                : 7;
                            data[i * 8 + 0] = this.curFrame[index * bs + 1];
                            data[i * 8 + 1] = this.curFrame[index * bs + 2];
                            data[i * 8 + 2] = this.curFrame[index * bs + 3];
                            data[i * 8 + 3] = this.curFrame[index * bs + 4];
                            data[i * 8 + 4] = this.curFrame[index * bs + 5];
                            data[i * 8 + 5] = this.curFrame[index * bs + 6];
                            data[i * 8 + 6] = this.curFrame[index * bs + 7];
                            data[i * 8 + 7] = this._playClip.hasScaled
                                ? this.curFrame[index * bs + 8]
                                : 1;
                            // data[i * 8 + 7] = 1;
                        }
                    } else {
                        // console.error("Bone: " + bonename + " Not Record in Aniclip(" + this._playClip.getName() + ").");
                    }
                    //----------------------
                }
        }
    }
}