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
namespace m4m.framework {
    export interface PhysicsImpostorParameters {
        mass: number;
        /** The friction of the physics imposter*/
        friction?: number;
        /**
         * The coefficient of restitution of the physics imposter
         */
        restitution?: number;
        /**
         * The native options of the physics imposter
         */
        nativeOptions?: any;
        /**
         * Specifies if the parent should be ignored
         */
        ignoreParent?: boolean;
        /**
         * Specifies if bi-directional transformations should be disabled
         */
        disableBidirectionalTransformation?: boolean;

        /**
         * kinematic
         */
        kinematic?: boolean;
        // radius?:number;
        // width?:number;
        // height?:number;
        // depth?:number;
        heightFieldMatrix?: number[][];
        heightFieldOptions?: {
            minValue?: number;
            maxValue?: number;
            elementSize?: number;
        };
    }

    export interface IPhysicsEnabledObject {
        position: math.vector3;
        rotationQuaternion: math.quaternion;
        scaling: math.vector3;
        rotation?: math.vector3;
        parent?: any;
        // getBoundingInfo(): BoundingInfo;
        // computeWorldMatrix(force: boolean): Matrix;
        /**
         * 获取世界矩阵
         * @returns 矩阵
         */
        getWorldMatrix?(): math.matrix;
        // getChildMeshes?(directDescendantsOnly?: boolean): Array<AbstractMesh>;
        // getVerticesData(kind: string): Array<number> | Float32Array;
        // getIndices?():IndicesArray;
        // getScene?(): Scene;
        /**
         * 获取绝对位置坐标
         * @returns 位置坐标向量
         */
        getAbsolutePosition(): math.vector3;
        /**
         * 获取绝对支点坐标
         * @returns 支点坐标
         */
        getAbsolutePivotPoint(): math.vector3;
        // rotate(axis: math.vector3, amount: number, space?: Space): TransformNode;
        // translate(axis: math.vector3, distance: number, space?: Space): TransformNode;
        // setAbsolutePosition(absolutePosition: math.vector3): TransformNode;
        // getClassName(): string;
    }

    export class PhysicsImpostor {

        public static DEFAULT_OBJECT_SIZE: math.vector3 = new math.vector3(0, 0, 0);

        public static IDENTITY_QUATERNION = new math.quaternion();

        private _physicsEngine: PhysicsEngine;
        //The native cannon/oimo/energy physics body object.
        private _physicsBody: any;
        private _bodyUpdateRequired: boolean = false;

        private _onBeforePhysicsStepCallbacks = new Array<(impostor: PhysicsImpostor) => void>();
        private _onAfterPhysicsStepCallbacks = new Array<(impostor: PhysicsImpostor) => void>();
        private _onPhysicsCollideCallbacks: Array<{ callback: (collider: PhysicsImpostor, collidedAgainst: PhysicsImpostor) => void, otherImpostors: Array<PhysicsImpostor> }> = []

        private _deltaPosition: math.vector3 = new math.vector3();
        private _deltaRotation: math.quaternion;
        private _deltaRotationConjugated: math.quaternion;
        //If set, this is this impostor's parent
        private _parent: PhysicsImpostor;

        private _isDisposed = false;

        private static _tmpVecs: math.vector3[] = [new math.vector3(), new math.vector3(), new math.vector3()];
        private static _tmpQuat: math.quaternion = new math.quaternion();

        private static helpquat = new math.quaternion();
        private static helpv3 = new math.vector3();
        private static helpv3_1 = new math.vector3();
        get isDisposed(): boolean {
            return this._isDisposed;
        }

        get mass(): number {
            return this._physicsEngine.getPhysicsPlugin().getBodyMass(this);
        }

        set mass(value: number) {
            this.setMass(value);
        }

        get friction(): number {
            return this._physicsEngine.getPhysicsPlugin().getBodyFriction(this);
        }

        set friction(value: number) {
            this._physicsEngine.getPhysicsPlugin().setBodyFriction(this, value);
        }

        get restitution(): number {
            return this._physicsEngine.getPhysicsPlugin().getBodyRestitution(this);
        }

        set restitution(value: number) {
            this._physicsEngine.getPhysicsPlugin().setBodyRestitution(this, value);
        }

        //set by the physics engine when adding this impostor to the array.
        public uniqueId: number;

        private _joints: Array<{
            joint: PhysicsJoint,
            otherImpostor: PhysicsImpostor
        }>;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * PhysicsImpostor
         * @param object    transform 对象
         * @param type  shape types.
         * @param _options Body Parameters
         */
        constructor(public object: transform, public type: ImpostorType, public _options: PhysicsImpostorParameters = { mass: 0 }) {
            this._physicsEngine = physics;
            if (!this.object) {
                console.error("No object was provided. A physics object is obligatory");
                return;
            }

            if (!this._physicsEngine) {
                console.error("Physics not enabled. Please use scene.enablePhysics(...) before creating impostors.")
                return;
            }

            {
                //set the object's quaternion, if not set
                // if (!this.object.rotationQuaternion) {
                //     if (this.object.rotation) {
                //         this.object.rotationQuaternion = Quaternion.RotationYawPitchRoll(this.object.rotation.y, this.object.rotation.x, this.object.rotation.z);
                //     } else {
                //         this.object.rotationQuaternion = new Quaternion();
                //     }
                // }
                //default options params
                this._options.mass = (_options.mass === void 0) ? 0 : _options.mass
                this._options.friction = (_options.friction === void 0) ? 0.2 : _options.friction
                this._options.restitution = (_options.restitution === void 0) ? 0.2 : _options.restitution

                this._joints = [];

                //If the mesh has a parent and parent is not the scene rootNode , don't initialize the physicsBody. Instead wait for the parent to do that.
                if (!this.object.parent || (this.object.scene && this.object.parent == this.object.scene.getRoot()) || this._options.ignoreParent) {
                    this._init();
                } else if (this.object.parent && this.object.parent.physicsImpostor) {
                    console.warn("You must affect impostors to children before affecting impostor to parent.");
                }

                //引用到设置到 transform
                if (this.object)
                    this.object.physicsImpostor = this;
            }
        }

        /**
         * This function will completly initialize this impostor.
         * It will create a new body - but only if this mesh has no parent.
         * If it has, this impostor will not be used other than to define the impostor
         * of the child mesh.
         */
        public _init() {
            if (!this._physicsEngine) {
                return;
            }

            this._physicsEngine.removeImpostor(this);
            this.physicsBody = null;
            this._parent = this._parent || this._getPhysicsParent();
            if (!this._isDisposed && (!this.parent || this._options.ignoreParent)) {
                this._physicsEngine.addImpostor(this);
            }
        }

        /**
         * 获取物理体的父节点
         * @returns 物理体的父节点
         */
        private _getPhysicsParent(): PhysicsImpostor {
            if (this.object && this.object.parent) {
                return this.object.parent.physicsImpostor;
            }
            return null;
        }

        /**
         * Should a new body be generated.
         */
        public isBodyInitRequired(): boolean {
            return this._bodyUpdateRequired || !this._physicsBody;
        }

        /**
         * 设置缩放更新
         * @param updated 是更新
         */
        public setScalingUpdated(updated: boolean) {
            this.forceUpdate();
        }

        /**
         * Force a regeneration of this or the parent's impostor's body.
         * Use under cautious - This will remove all joints already implemented.
         */
        public forceUpdate() {
            this._init();
            if (this.parent && !this._options.ignoreParent) {
                this.parent.forceUpdate();
            }
        }

        /*public get mesh(): AbstractMesh {
            return this._mesh;
        }*/

        /**
         * Gets the body that holds this impostor. Either its own, or its parent.
         */
        public get physicsBody(): any {
            return this._physicsBody;
        }

        /**
         * Get the parent of the physics imposter
         * @returns Physics imposter or null
         */
        public get parent(): PhysicsImpostor {
            return !this._options.ignoreParent && this._parent ? this._parent : null;
        }

        /**
         * Sets the parent of the physics imposter
         */
        public set parent(value: PhysicsImpostor) {
            this._parent = value;
        }

        /**
         * Set the physics body. Used mainly by the physics engine/plugin
         */
        public set physicsBody(physicsBody: any) {
            if (this._physicsBody && this._physicsEngine) {
                this._physicsEngine.getPhysicsPlugin().removePhysicsBody(this);
            }
            this._physicsBody = physicsBody;
            this.resetUpdateFlags();
        }

        /**
         * 重置更新标记
         */
        public resetUpdateFlags() {
            this._bodyUpdateRequired = false;
        }

        private _obb: obb;

        /**
         * 获取Obb 有向包围盒
         * @returns Obb
         */
        private getObb(): obb {
            if (!this.object || !(this.object instanceof transform)) {
                return null;
            }

            if (!this._obb) {
                let go = this.object.gameObject;
                let mf = go.getComponent("meshFilter") as meshFilter;
                if (!mf) return null;
                let min = PhysicsImpostor.helpv3;
                let max = PhysicsImpostor.helpv3_1;
                mf.getMeshOutput().calcVectexMinMax(min, max);
                //构建一个 obb
                this._obb = new obb();
                this._obb.buildByMaxMin(min, max);
            }
            this._obb.update(this.object.getWorldMatrix());

            return this._obb;
        }

        private _cacheSizeWorld = new math.vector3();
        /**
        * 获取对象扩展大小
        * @returns 大小
        */
        getObjectExtendSize(): math.vector3 {
            let tempObb = this.getObb();
            if (!tempObb) return PhysicsImpostor.DEFAULT_OBJECT_SIZE;
            math.vec3Clone(tempObb.halfSizeWorld, this._cacheSizeWorld);
            math.vec3ScaleByNum(this._cacheSizeWorld, 2, this._cacheSizeWorld);
            return this._cacheSizeWorld;
        }

        /**
         * 获取对象的中心点
         * @returns 中心点
         */
        public getObjectCenter(): math.vector3 {
            let tempObb = this.getObb();
            if (!tempObb) return this.object.getWorldPosition();
            return tempObb.worldCenter;
        }

        // public getObjectCenter(): Vector3 {
        //     if (this.object.getBoundingInfo) {
        //         let boundingInfo = this.object.getBoundingInfo();
        //         return boundingInfo.boundingBox.centerWorld;
        //     } else {
        //         return this.object.position;
        //     }
        // }

        /**
         * 从选项参数中获取特定的参数。
         * @param paramName 参数名
         */
        public getParam(paramName: string) {
            return (<any>this._options)[paramName];
        }

        /**
         * 在物理插件的选项中设置特定参数
         * @param paramName 参数名
         * @param value 值
         */
        public setParam(paramName: string, value: number) {
            (<any>this._options)[paramName] = value;
            this._bodyUpdateRequired = true;
        }

        /**
         * Specifically change the body's mass option. Won't recreate the physics body object
         */
        public setMass(mass: number) {
            if (this.getParam("mass") !== mass) {
                this.setParam("mass", mass);
            }
            if (this._physicsEngine) {
                this._physicsEngine.getPhysicsPlugin().setBodyMass(this, mass);
            }
        }

        /**
         * 获取线性速度
         * @returns 速度向量
         */
        public getLinearVelocity(): math.vector3 {
            return this._physicsEngine.getPhysicsPlugin().getLinearVelocity(this)
        }

        /**
         * 设置线性速度
         * @param velocity 速度向量
         */
        public setLinearVelocity(velocity: math.vector3) {
            this._physicsEngine.getPhysicsPlugin().setLinearVelocity(this, velocity);
        }

        /**
         * 设置角速度
         * @returns 速度向量
         */
        public getAngularVelocity(): math.vector3 {
            return this._physicsEngine.getPhysicsPlugin().getAngularVelocity(this);
        }

        /**
         * 设置角速度
         * @param velocity 速度向量
         */
        public setAngularVelocity(velocity: math.vector3) {
            this._physicsEngine.getPhysicsPlugin().setAngularVelocity(this, velocity);
        }

        /**
         * 使用物理插件的本地代码执行函数。
         * 提供一个函数，该函数将有两个变量-世界对象和物理体对象。
         * @param func 执行函数
         */
        public executeNativeFunction(func: (world: any, physicsBody: any) => void) {
            if (this._physicsEngine) {
                func(this._physicsEngine.getPhysicsPlugin().world, this.physicsBody);
            }
        }

        /**
         * 注册一个函数，该函数将在物理世界执行一步之前执行。
         * @param func 执行函数
         */
        public registerBeforePhysicsStep(func: (impostor: PhysicsImpostor) => void): void {
            this._onBeforePhysicsStepCallbacks.push(func);
        }

        /**
         * 注销，物理世界执行一步之前执行的函数
         * @param func 执行函数
         */
        public unregisterBeforePhysicsStep(func: (impostor: PhysicsImpostor) => void): void {
            var index = this._onBeforePhysicsStepCallbacks.indexOf(func);

            if (index > -1) {
                this._onBeforePhysicsStepCallbacks.splice(index, 1);
            } else {
                console.warn("Function to remove was not found");
            }
        }

        /**
         * 注册将在物理执行一步骤后执行的函数
         * @param func 执行函数
         */
        public registerAfterPhysicsStep(func: (impostor: PhysicsImpostor) => void): void {
            this._onAfterPhysicsStepCallbacks.push(func);
        }

        /**
         * 注销，物理世界执行一步之后执行的函数
         * @param func 执行函数
         */
        public unregisterAfterPhysicsStep(func: (impostor: PhysicsImpostor) => void): void {
            var index = this._onAfterPhysicsStepCallbacks.indexOf(func);

            if (index > -1) {
                this._onAfterPhysicsStepCallbacks.splice(index, 1);
            } else {
                console.warn("Function to remove was not found");
            }
        }

        /**
         * 注册一个函数，该函数将在该物理代理与其他实体碰撞时执行。
         * @param collideAgainst 物理代理
         * @param func 执行函数
         */
        public registerOnPhysicsCollide(collideAgainst: PhysicsImpostor | Array<PhysicsImpostor>, func: (collider: PhysicsImpostor, collidedAgainst: PhysicsImpostor) => void): void {
            var collidedAgainstList: Array<PhysicsImpostor> = collideAgainst instanceof Array ? <Array<PhysicsImpostor>>collideAgainst : [<PhysicsImpostor>collideAgainst]
            this._onPhysicsCollideCallbacks.push({ callback: func, otherImpostors: collidedAgainstList });
        }

        /**
         * 注销，在该物理代理与其他实体碰撞时执行函数
         * @param collideAgainst 物理代理
         * @param func 执行函数
         */
        public unregisterOnPhysicsCollide(collideAgainst: PhysicsImpostor | Array<PhysicsImpostor>, func: (collider: PhysicsImpostor, collidedAgainst: PhysicsImpostor | Array<PhysicsImpostor>) => void): void {
            var collidedAgainstList: Array<PhysicsImpostor> = collideAgainst instanceof Array ? <Array<PhysicsImpostor>>collideAgainst : [<PhysicsImpostor>collideAgainst]
            var index = -1;
            let found = this._onPhysicsCollideCallbacks.some((cbDef, idx) => {
                if (cbDef.callback === func && cbDef.otherImpostors.length === collidedAgainstList.length) {
                    // chcek the arrays match
                    let sameList = cbDef.otherImpostors.every((impostor) => {
                        return collidedAgainstList.indexOf(impostor) > -1;
                    });
                    if (sameList) {
                        index = idx;
                    }
                    return sameList;
                }
                return false;
            });

            if (found) {
                this._onPhysicsCollideCallbacks.splice(index, 1);
            } else {
                console.warn("Function to remove was not found");
            }
        }

        private lastObjwPos = new m4m.math.vector3();
        private lastObjwRot = new m4m.math.quaternion();
        /**
         * 之前执行步，该函数由物理引擎执行。
         */
        public beforeStep = () => {
            if (!this._physicsEngine) {
                return;
            }

            let wpos = this.object.getWorldPosition();
            let wrot = this.object.getWorldRotate();

            let hasDirty = !math.vec3Equal(wpos, this.lastObjwPos) || !math.quatEqual(wrot, this.lastObjwRot);
            math.vec3Clone(wpos, this.lastObjwPos);
            math.quatClone(wrot, this.lastObjwRot);

            //处理 质心点 与 模型中心点 的偏移
            let offset_wpos = PhysicsImpostor.helpv3;
            math.vec3Clone(this._deltaPosition, offset_wpos);
            math.vec3ScaleByNum(offset_wpos, -1, offset_wpos);
            math.vec3Add(wpos, offset_wpos, offset_wpos);

            // this._deltaRotationConjugated && this.object.rotationQuaternion && this.object.rotationQuaternion.multiplyToRef(this._deltaRotationConjugated, this.object.rotationQuaternion);
            // this.object.computeWorldMatrix(false);
            // if (this.object.parent && this.object.rotationQuaternion) {
            //     this.getParentsRotation();
            //     this._tmpQuat.multiplyToRef(this.object.rotationQuaternion, this._tmpQuat);
            // } else {
            //     this._tmpQuat.copyFrom(this.object.rotationQuaternion || new Quaternion());
            // }
            if (hasDirty && !this._options.disableBidirectionalTransformation) {
                this._physicsEngine.getPhysicsPlugin().setPhysicsBodyTransformation(this, /*bInfo.boundingBox.centerWorld*/offset_wpos, wrot);
            }

            this._onBeforePhysicsStepCallbacks.forEach((func) => {
                func(this);

            });
        }


        private _freezeMask: number = 0; //位移和旋转冻结 mask
        /**
         * 设置 位移、旋转 冻结选项
         * @param option 冻结类型
         * @param beSelect 是否选上
         */
        setFreeze(option: FreezeType, beSelect: boolean) {
            if (beSelect) {
                this._freezeMask |= option;
            } else {
                if (this._freezeMask & option) {
                    this._freezeMask ^= option;
                }
            }
        }

        /**
         * 获取 位移、旋转 冻结选项
         * @param option 冻结类型
         */
        getFreeze(option: FreezeType) {
            return this._freezeMask & option;
        }

        private lastbodywPos = new m4m.math.vector3();
        private lastbodywRot = new m4m.math.quaternion();
        private lastEuler = new m4m.math.vector3();
        private lastRotMask: number = 0;
        /**
         * 之后执行步,该函数由物理引擎执行。
         */
        public afterStep = () => {
            if (!this._physicsEngine) {
                return;
            }

            this._onAfterPhysicsStepCallbacks.forEach((func) => {
                func(this);
            });

            let lwpos = this.lastbodywPos;
            let lwrot = this.lastbodywRot;
            let posDirty = !physicTool.Ivec3Equal(this.physicsBody.position, lwpos);
            let rotDirty = !physicTool.IQuatEqual(this.physicsBody.quaternion, lwrot);
            //冻结处理逻辑
            if (this._freezeMask > 0) {
                if (posDirty) {
                    //过滤掉 物理的 位移 影响
                    let pPos: { x, y, z } = this._physicsBody.position;
                    //清理 速度
                    let linearVelocity: { x, y, z } = this._physicsBody.linearVelocity;
                    if (this.getFreeze(FreezeType.Position_x)) {
                        pPos.x = lwpos.x;
                        linearVelocity.x = 0;
                    }
                    if (this.getFreeze(FreezeType.Position_y)) {
                        pPos.y = lwpos.y;
                        linearVelocity.y = 0;
                    }
                    if (this.getFreeze(FreezeType.Position_z)) {
                        pPos.z = lwpos.z;
                        linearVelocity.z = 0;
                    }
                }

                if (rotDirty) {
                    let l_x = this.getFreeze(FreezeType.Rotation_x);
                    let l_y = this.getFreeze(FreezeType.Rotation_y);
                    let l_z = this.getFreeze(FreezeType.Rotation_z);

                    let pRot: { x, y, z, w } = this._physicsBody.quaternion;
                    let angularVelocity: { x, y, z } = this._physicsBody.angularVelocity;
                    if (!l_x || !l_y || !l_z) {
                        //过滤掉 物理的 旋转 影响
                        //清理 速度
                        let Euler: math.vector3 = PhysicsImpostor.helpv3;
                        let tquat = PhysicsImpostor.helpquat;
                        physicTool.IQuatCopy(pRot, tquat);
                        math.quatToEulerAngles(tquat, Euler);  //物理结算当前 欧拉角
                        let lEuler = this.lastEuler;
                        let mask_ = l_x ? 1 : 0 | l_y ? 2 : 0 | l_z ? 4 : 0; //优化计算 量
                        if (mask_ != this.lastRotMask) {
                            math.quatToEulerAngles(lwrot, lEuler);  //上一次的 欧拉角
                        }
                        this.lastRotMask = mask_;
                        //逐轴冻结判定                        
                        let t_x = lEuler.x;
                        let t_y = lEuler.y;
                        let t_z = lEuler.z;
                        if (this.getFreeze(FreezeType.Rotation_x)) {
                            angularVelocity.x = 0;
                        } else {
                            t_x = Euler.x;
                        }
                        if (this.getFreeze(FreezeType.Rotation_y)) {
                            angularVelocity.y = 0;
                        } else {
                            t_y = Euler.y;
                        }
                        if (this.getFreeze(FreezeType.Rotation_z)) {
                            angularVelocity.z = 0;
                        } else {
                            t_z = Euler.z;
                        }

                        math.quatFromEulerAngles(t_x, t_y, t_z, tquat);
                        physicTool.IQuatCopy(tquat, pRot);
                    } else {
                        //全部锁定 , 不用计算旋转
                        angularVelocity.x = angularVelocity.y = angularVelocity.z = 0;
                        physicTool.IQuatCopy(lwrot, pRot);
                    }
                }
            }

            physicTool.Ivec3Copy(this.physicsBody.position, lwpos);
            physicTool.IQuatCopy(this.physicsBody.quaternion, lwrot);
            if (!posDirty && !rotDirty) return;

            // object has now its world rotation. needs to be converted to local.

            // if (this.object.parent && this.object.rotationQuaternion) {
            //     this.getParentsRotation();
            //     this._tmpQuat.conjugateInPlace();
            //     this._tmpQuat.multiplyToRef(this.object.rotationQuaternion, this.object.rotationQuaternion);
            // }
            // // take the position set and make it the absolute position of this object.
            // this.object.setAbsolutePosition(this.object.position);


            // this._deltaRotation && this.object.rotationQuaternion && this.object.rotationQuaternion.multiplyToRef(this._deltaRotation, this.object.rotationQuaternion);

            //同步到transform
            this._physicsEngine.getPhysicsPlugin().setTransformationFromPhysicsBody(this);
            //处理 质心点 与 模型中心点 的偏移
            let tempv3 = PhysicsImpostor.helpv3;
            math.vec3Add(this.object.getWorldPosition(), this._deltaPosition, tempv3);
            this.object.setWorldPosition(tempv3)
        }

        /**
         * 当碰撞事件时触发
         * 旧版碰撞检测事件支持
         */
        public onCollideEvent: (collider: PhysicsImpostor, collidedWith: PhysicsImpostor) => void = null;

        /**
         * 当碰撞触发
         * @param e 事件对象
         */
        public onCollide = (e: { body: any }) => {
            if (!this._onPhysicsCollideCallbacks.length && !this.onCollideEvent) {
                return;
            }

            if (!this._physicsEngine) {
                return;

            }
            var otherImpostor = this._physicsEngine.getImpostorWithPhysicsBody(e.body);
            if (otherImpostor) {
                // Legacy collision detection event support
                if (this.onCollideEvent) {
                    this.onCollideEvent(this, otherImpostor);
                }
                this._onPhysicsCollideCallbacks.filter((obj) => {
                    return obj.otherImpostors.indexOf((<PhysicsImpostor>otherImpostor)) !== -1
                }).forEach((obj) => {
                    obj.callback(this, <PhysicsImpostor>otherImpostor);
                })
            }
        }

        /**
         * 应用施加力
         * @param force 力向量
         * @param contactPoint 施加位置点
         * @returns 物理代理
         */
        public applyForce(force: math.vector3, contactPoint: math.vector3): PhysicsImpostor {
            if (this._physicsEngine) {
                this._physicsEngine.getPhysicsPlugin().applyForce(this, force, contactPoint);
            }
            return this;
        }

        /**
         * 应用施加一个冲量
         * @param force 力向量
         * @param contactPoint 施加位置点
         * @returns 物理代理
         */
        public applyImpulse(force: math.vector3, contactPoint: math.vector3): PhysicsImpostor {
            if (this._physicsEngine) {
                this._physicsEngine.getPhysicsPlugin().applyImpulse(this, force, contactPoint);
            }

            return this;
        }

        /**
         * 创建一个关节
         * @param otherImpostor 物理代理
         * @param jointType 关节类型
         * @param jointData 关节数据
         * @returns 物理代理
         */
        public createJoint(otherImpostor: PhysicsImpostor, jointType: number, jointData: PhysicsJointData): PhysicsImpostor {
            var joint = new PhysicsJoint(jointType, jointData);
            this.addJoint(otherImpostor, joint);

            return this;
        }

        /**
         * 添加一个关节
         * @param otherImpostor 物理代理
         * @param joint 关节
         * @returns 物理代理
         */
        public addJoint(otherImpostor: PhysicsImpostor, joint: PhysicsJoint): PhysicsImpostor {
            this._joints.push({
                otherImpostor: otherImpostor,
                joint: joint
            });

            if (this._physicsEngine) {
                this._physicsEngine.addJoint(this, otherImpostor, joint);
            }

            return this;
        }

        /**
         * 保持身体静止，处于睡眠状态。
         */
        public sleep(): PhysicsImpostor {
            if (this._physicsEngine) {
                this._physicsEngine.getPhysicsPlugin().sleepBody(this);
            }

            return this;
        }

        /**
         * 是睡眠状态？
         */
        get isSleeping() {
            if (this._physicsEngine) {
                return this._physicsEngine.getPhysicsPlugin().isSleeping(this);
            }
            return false;
        }

        /**
         * 唤醒
         */
        public wakeUp(): PhysicsImpostor {
            if (this._physicsEngine) {
                this._physicsEngine.getPhysicsPlugin().wakeUpBody(this);
            }

            return this;
        }

        /**
         * 克隆
         * @param newObject 引擎变换节点
         * @returns 输出的克隆物理代理对象
         */
        public clone(newObject: transform): PhysicsImpostor {
            if (!newObject) return null;
            return new PhysicsImpostor(newObject, this.type, this._options);
        }

        /** 销毁 */
        public dispose(/*disposeChildren: boolean = true*/) {
            //no dispose if no physics engine is available.
            if (!this._physicsEngine) {
                return;
            }

            this._joints.forEach((j) => {
                if (this._physicsEngine) {
                    this._physicsEngine.removeJoint(this, j.otherImpostor, j.joint);
                }
            })
            //dispose the physics body
            this._physicsEngine.removeImpostor(this);
            if (this.parent) {
                this.parent.forceUpdate();
            } else {
                // if(this.object.children){
                //     this.object.children.forEach(sub=>{
                //         if(sub && sub.physicsImpostor){
                //             sub.physicsImpostor.dispose();
                //             sub.physicsImpostor = null;
                //         }
                //     });
                // }
            }

            this._isDisposed = true;
        }

        /**
         * 设置 变化的位置
         * @param position 变化的位置向量
         */
        public setDeltaPosition(position: math.vector3) {
            math.vec3Clone(position, this._deltaPosition);
            // this._deltaPosition.copyFrom(position);
        }

        /**
         * 设置 变化的旋转
         * @param rotation 旋转四元数
         */
        public setDeltaRotation(rotation: math.quaternion) {
            if (!this._deltaRotation) {
                this._deltaRotation = new math.quaternion();
            }
            // this._deltaRotation.copyFrom(rotation);
            math.quatClone(rotation, this._deltaRotation);

            // this._deltaRotationConjugated = this._deltaRotation.conjugate();
        }

        /**
         * 获取 包围盒尺寸
         * @param result 输出包围盒尺寸
         */
        public getBoxSizeToRef(result: math.vector3): PhysicsImpostor {
            this._physicsEngine.getPhysicsPlugin().getBoxSizeToRef(this, result);

            return this;
        }

        /**
         * 获取半径
         * @returns 
         */
        public getRadius(): number {
            return this._physicsEngine.getPhysicsPlugin().getRadius(this);
        }

        /**
         * 设置动力学的 位置
         */
        public kinematicSetPosition(position: math.vector3) {
            if (!this._physicsBody || !position) return;
            this._physicsBody.setPosition(position);
        }

        /**
         * 设置动力学的 旋转 
         */
        public kinematicSetRotation(rotation: math.quaternion) {
            if (!this._physicsBody || !rotation) return;
            this._physicsBody.setQuaternion(rotation);
        }

        // /**
        //  * Sync a bone with this impostor
        //  * @param bone The bone to sync to the impostor.
        //  * @param boneMesh The mesh that the bone is influencing.
        //  * @param jointPivot The pivot of the joint / bone in local space.
        //  * @param distToJoint Optional distance from the impostor to the joint.
        //  * @param adjustRotation Optional quaternion for adjusting the local rotation of the bone.
        //  */
        // public syncBoneWithImpostor(bone: Bone, boneMesh: AbstractMesh, jointPivot: Vector3, distToJoint?: number, adjustRotation?: Quaternion) {

        //     var tempVec = PhysicsImpostor._tmpVecs[0];
        //     var mesh = <AbstractMesh>this.object;

        //     if (mesh.rotationQuaternion) {
        //         if (adjustRotation) {
        //             var tempQuat = PhysicsImpostor._tmpQuat;
        //             mesh.rotationQuaternion.multiplyToRef(adjustRotation, tempQuat);
        //             bone.setRotationQuaternion(tempQuat, Space.WORLD, boneMesh);
        //         } else {
        //             bone.setRotationQuaternion(mesh.rotationQuaternion, Space.WORLD, boneMesh);
        //         }
        //     }

        //     tempVec.x = 0;
        //     tempVec.y = 0;
        //     tempVec.z = 0;

        //     if (jointPivot) {
        //         tempVec.x = jointPivot.x;
        //         tempVec.y = jointPivot.y;
        //         tempVec.z = jointPivot.z;

        //         bone.getDirectionToRef(tempVec, boneMesh, tempVec);

        //         if (distToJoint === undefined || distToJoint === null) {
        //             distToJoint = jointPivot.length();
        //         }

        //         tempVec.x *= distToJoint;
        //         tempVec.y *= distToJoint;
        //         tempVec.z *= distToJoint;
        //     }

        //     if (bone.getParent()) {
        //         tempVec.addInPlace(mesh.getAbsolutePosition());
        //         bone.setAbsolutePosition(tempVec, boneMesh);
        //     } else {
        //         boneMesh.setAbsolutePosition(mesh.getAbsolutePosition());
        //         boneMesh.position.x -= tempVec.x;
        //         boneMesh.position.y -= tempVec.y;
        //         boneMesh.position.z -= tempVec.z;
        //     }

        // }

        // /**
        //  * Sync impostor to a bone
        //  * @param bone The bone that the impostor will be synced to.
        //  * @param boneMesh The mesh that the bone is influencing.
        //  * @param jointPivot The pivot of the joint / bone in local space.
        //  * @param distToJoint Optional distance from the impostor to the joint.
        //  * @param adjustRotation Optional quaternion for adjusting the local rotation of the bone.
        //  * @param boneAxis Optional vector3 axis the bone is aligned with
        //  */
        // public syncImpostorWithBone(bone: Bone, boneMesh: AbstractMesh, jointPivot: Vector3, distToJoint?: number, adjustRotation?: Quaternion, boneAxis?: Vector3) {

        //     var mesh = <AbstractMesh>this.object;

        //     if (mesh.rotationQuaternion) {
        //         if (adjustRotation) {
        //             var tempQuat = PhysicsImpostor._tmpQuat;
        //             bone.getRotationQuaternionToRef(Space.WORLD, boneMesh, tempQuat);
        //             tempQuat.multiplyToRef(adjustRotation, mesh.rotationQuaternion);
        //         } else {
        //             bone.getRotationQuaternionToRef(Space.WORLD, boneMesh, mesh.rotationQuaternion);
        //         }
        //     }

        //     var pos = PhysicsImpostor._tmpVecs[0];
        //     var boneDir = PhysicsImpostor._tmpVecs[1];

        //     if (!boneAxis) {
        //         boneAxis = PhysicsImpostor._tmpVecs[2];
        //         boneAxis.x = 0;
        //         boneAxis.y = 1;
        //         boneAxis.z = 0;
        //     }

        //     bone.getDirectionToRef(boneAxis, boneMesh, boneDir);
        //     bone.getAbsolutePositionToRef(boneMesh, pos);

        //     if ((distToJoint === undefined || distToJoint === null) && jointPivot) {
        //         distToJoint = jointPivot.length();
        //     }

        //     if (distToJoint !== undefined && distToJoint !== null) {
        //         pos.x += boneDir.x * distToJoint;
        //         pos.y += boneDir.y * distToJoint;
        //         pos.z += boneDir.z * distToJoint;
        //     }

        //     mesh.setAbsolutePosition(pos);

        // }

    }

    /** Impostor types */
    export enum ImpostorType {
        /** No-Imposter type */
        NoImpostor = 0,
        /** Sphere-Imposter type */
        SphereImpostor,
        /** Box-Imposter type */
        BoxImpostor,
        /** Plane-Imposter type */
        PlaneImpostor,
        /** Mesh-Imposter type */
        MeshImpostor,
        /** Cylinder-Imposter type */
        CylinderImpostor = 7,
        /** Particle-Imposter type */
        ParticleImpostor,
        /** Heightmap-Imposter type */
        HeightmapImpostor,
        /** ConvexHull-Imposter type */
        ConvexHullImpostor,
        /** Rope-Imposter type */
        RopeImpostor = 101,
        /** Cloth-Imposter type */
        ClothImpostor,
        /** Softbody-Imposter type */
        SoftbodyImpostor
    }

    /**
     * physicImpostor 冻结类型
     */
    export enum FreezeType {
        Position_x = 1,
        Position_y = 2,
        Position_z = 4,
        Rotation_x = 8,
        Rotation_y = 16,
        Rotation_z = 32
    }
}
