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
/// <reference path="../../math/matrix.ts" />

namespace m4m.framework {
    export interface I2DPhysicsBody {
        /** 初始化完成回调 */
        onInit : (phy2dBody : I2DPhysicsBody)=>any;
        /** 引擎对象 */
        physicsEngine: physicEngine2D;
        /** body 选项数据*/
        options: I2dPhyBodyData;
        /** 绑定的UI */
        transform: transform2D;
        /** 物理世界body */
        body: Ibody;
        /** 施加力 */
        addForce(Force: math.Ivec2);
        /**设置 速度*/
        setVelocity(velocity: math.Ivec2);
        /**设置 密度*/
        setDensity(Desity: number);
        /**设置 空气摩擦系数*/
        setFrictionAir(frictionAir: number);
        /**设置 摩擦系数*/
        setFriction(friction: number);
        /**设置 静态摩擦系数*/
        setFrictionStatic(frictionStatic: number);
        /**设置 恢复系数*/
        setRestitution(restitution: number);
        /** 设置质量 */
        setMass(mass: number);
        /**设置位置 */
        setPosition(pos: math.Ivec2);
        /** 设置旋转角度 */
        setAngle(angle:number);
        /** 设置成员 */
        setParts(parts: Ibody[], autoHull:boolean);
        /** 设置顶点 */
        setVertices(vertices: math.Ivec2[]);
        /** 设置惯性值*/
        setInertia(Inertia: number);
        /**设置角速度 */
        setAngularVelocity(velocity: number) ;
        /**是否睡眠 */
        isSleeping(): boolean;
        /** 是否是传感器*/
        isSensor():boolean;
        /**是否是静态 */
        isStatic():boolean;
        /** 物理一次计算执行前调用 */
        beforeStep();
        /** 物理一次计算执行后调用 */
        afterStep();
    }
    export interface I2dPhyBodyData {
        mass?: number;
        density?: number;
        inertia?: number;
        restitution?: number;
        frictionStatic?: number;
        frictionAir?: number;
        friction?: number;
        collisionFilter?: collisionFilter;
        slop?: number;
        isStatic?: boolean;
        isSensor?: boolean;
        type?: string;
        tag?: string;
        name?: string;
        chamfer?:number;
        label?: string,
        parts?: Ibody[],
        plugin?: {},
        angle?: number,
        vertices?: math.Ivec2[],
        position?: math.Ivec2,
        force?: math.Ivec2,
        torque?: number,
        positionImpulse?: math.Ivec2,
        previousPositionImpulse?: math.Ivec2,
        totalContacts?: number,
        speed?: number,
        angularSpeed?: number,
        velocity?: math.Ivec2,
        angularVelocity?: number,
        isSleeping?: boolean,
        motion?: number,
        sleepThreshold?: number,
        timeScale?: number,
        events?: any,
        bounds?: any,
        circleRadius?: number,
        positionPrev?: any,
        anglePrev?: number,
        parent?: any,
        axes?: any,
        area?: number,
        _original?: any
    }

    /**
     * 2d 物理引擎Body 组件父对象
     * （本组件不会创建具体物理对象，需要使用子类对象 或者 自行在onInit回调中创建）
     */
    export abstract class physics2DBody extends behaviour2d implements I2DPhysicsBody {
        private static helpV2 = new math.vector2();
        private static helpV2_1 = new math.vector2();
        private static helpRefAngle = new math.angelref();

        /** 2d物理引擎实例对象 */
        get physicsEngine() {
            if (this._physicsEngine) {
                return this._physicsEngine;
            } else {
                console.error("Physics not enabled. Please use scene.enable2DPhysics(...) before creating 2dPhysicsBody.");
            }
        };
        protected _physicsEngine: physicEngine2D;
        /**
         * 2D 物理体
         */
        constructor() {
            super();
            this._physicsEngine = physics2D;
        }
        private lastScale = new math.vector2(1,1);
        private beforePos = new m4m.math.vector2();
        private beforeAngle = 0;

        private _bodyLocalMtx : math.matrix3x2;
        private _bodyWorldMtx : math.matrix3x2;
        private enableBT : boolean = false;

        // beStatic:boolean=false;
        transform: transform2D;
        body: Ibody;
        /** 物理对象初始化完成回调 */
        onInit : (phy2dBody : I2DPhysicsBody)=>any;

        private _positionOffset = new math.vector2();
        /** 物理对象 碰撞体位置偏移量 */
        get positionOffset () { return this._positionOffset; } ;
        set positionOffset(pos: math.vector2){
            if(!pos) return;
            math.vec2Clone(pos , this._positionOffset);
            if(pos.x !=0 || pos.y !=0 ){
                this.enableBT = true;
                if(!this._bodyWorldMtx) this._bodyWorldMtx = new math.matrix3x2();
                if(!this._bodyLocalMtx) {
                    this._bodyLocalMtx = new math.matrix3x2();
                    //偏移矩阵
                    let sV2 = math.pool.new_vector2(1,1);
                    m4m.math.matrix3x2MakeTransformRTS(pos, sV2, 0, this._bodyLocalMtx);
                    math.pool.delete_vector2(sV2);
                }
                this._bodyLocalMtx.rawData[4] = pos.x;
                this._bodyLocalMtx.rawData[5] = pos.y;

            }else{
                this.enableBT = false;
            }
        }

        /** 是否已休眠
        * A flag that indicates whether the body is considered sleeping. A sleeping body acts similar to a static body, except it is only temporary and can be awoken.
        * If you need to set a body as sleeping, you should use `Sleeping.set` as this requires more than just setting this flag.
         */
        isSleeping() {
            return this.body.isSleeping;
        }

        /** 是否是静态
        * A flag that indicates whether a body is considered static. A static body can never change position or angle and is completely fixed.
        * If you need to set a body as static after its creation, you should use `Body.setStatic` as this requires more than just setting this flag.
         */
        isStatic() {
            return this.body.isStatic;
        }

        /** 是否是传感器
         * A flag that indicates whether a body is a sensor. Sensor triggers collision events, but doesn't react with colliding body physically.
         */
        isSensor() {
            return this.body.isSensor;
        }

        /**
         * 施加作用力
         * @param Force
         */
        addForce(Force: math.Ivec2) {
            this.physicsEngine.applyForceAtCenter(this.body, Force);
        }
        /**
         * 设置速度
         * @param velocity
         */
        setVelocity(velocity: math.Ivec2) {
            this.physicsEngine.setVelocity(this.body, velocity);
        }

        /**
         * 设置角速度
         * @param velocity
         */
        setAngularVelocity(velocity: number) {
            this.physicsEngine.setAngularVelocity(this.body, velocity);
        }

        /**
         * 设置密度
         * @param Desity
         */
        setDensity(Desity: number) {
            this.physicsEngine.setDensity(this.body, Desity);
        }

        /**
         * 设置空气摩擦力
         * @param frictionAir
         */
        setFrictionAir(frictionAir: number) {
            this.body.frictionAir = frictionAir;
        }
        /**
         * 设置摩擦力
         * @param friction
         */
        setFriction(friction: number) {
            this.body.friction = friction;
        }
        /**
         * 设置静态摩擦力
         * @param frictionStatic
         */
        setFrictionStatic(frictionStatic: number) {
            this.body.frictionStatic = frictionStatic;
        }
        /**
         * 设置还原张力
         * @param restitution
         */
        setRestitution(restitution: number) {
            this.body.restitution = restitution;
        }

        /**
         * 设置质量
         * @param mass
         */
        setMass(mass: number) {
            this.physicsEngine.setMass(this.body, mass);
        }

        options: I2dPhyBodyData = {};
        /**
         * 设置选项数据
         * @param options 选项数据
         */
        setInitData(options: I2dPhyBodyData) {
            this.options = options;
        }

        /**
         * 设置位置
         * @param pos 位置vec2
         */
        setPosition(pos: math.Ivec2) {
            // this.physicsEngine.setPosition(this.body, pos);
            if(this.enableBT){
                let trans = this.transform;
                trans.localTranslate.x = pos.x;
                trans.localTranslate.y = pos.y;
                trans.markDirty();
            }else{
                this.setPositionByPhy(pos);
            }
        }

        /**
         * 通过 物理设置位置坐标
         * @param pos 位置坐标
         */
        private setPositionByPhy(pos: math.Ivec2){
            this._physicsEngine.setPosition(this.body , pos);
        }

        /**
         * 设置旋转角度
         * @param angle
         */
        setAngle(angle:number){
            if(this.enableBT){
                let trans = this.transform;
                trans.localRotate = angle;
                trans.markDirty();
            }else{
                this.setAngleByPhy(angle);
            }
        }

        /**
         * 通过 物理设置角度
         * @param angle 角度值
         */
        private setAngleByPhy(angle:number){
            this._physicsEngine.setAngle(this.body,angle);
        }

        private bodyWorldScale = new m4m.math.vector2(1,1);
        setScale(scale: math.Ivec2){
            let wScal = this.bodyWorldScale;
            let sX = Math.pow(wScal.x , -1) * scale.x;
            let sY = Math.pow(wScal.y , -1) * scale.y;
            this._physicsEngine.setScale(this.body, sX , sY );
            math.vec2Set(this.bodyWorldScale, sX , sY);
        }

        /** 设置静态状态
         * Sets the body as static, including isStatic flag and setting mass and inertia to Infinity.
         */
        public setStatic(isStatic: boolean) {
            this.physicsEngine.setStatic(this.body, isStatic);
        }

        /** 设置休眠状态
         */
        public setSleeping(isSleeping: boolean) {
            this.physicsEngine.setSleeping(this.body, isSleeping);
        }

        /** 设置惯性值
         * Sets the moment of inertia (i.e. second moment of area) of the body.
         * Inverse inertia is automatically updated to reflect the change. Mass is not changed.
         */
        public setInertia(Inertia: number) {
            this.physicsEngine.setInertia(this.body, Inertia);
        }

        /** 设置顶点
        * Sets the body's vertices and updates body properties accordingly, including inertia, area and mass (with respect to `body.density`).
        * Vertices will be automatically transformed to be orientated around their centre of mass as the origin.
        * They are then automatically translated to world space based on `body.position`.
        *
        * The `vertices` argument should be passed as an array of `Matter.Vector` points (or a `Matter.Vertices` array).
        * Vertices must form a convex hull, concave hulls are not supported.
        */
        public setVertices(vertices: math.Ivec2[]) {
            this.physicsEngine.setVertices(this.body, vertices);
        }

        /** 设置成员
        * Sets the parts of the `body` and updates mass, inertia and centroid.
        * Each part will have its parent set to `body`.
        * By default the convex hull will be automatically computed and set on `body`, unless `autoHull` is set to `false.`
        * Note that this method will ensure that the first part in `body.parts` will always be the `body`.
        */
        public setParts(parts: Ibody[], autoHull = true) {
            this.physicsEngine.setParts(this.body, parts, autoHull);
        }

        /** 设置中心点
        * Set the centre of mass of the body.
        * The `centre` is a vector in world-space unless `relative` is set, in which case it is a translation.
        * The centre of mass is the point the body rotates about and can be used to simulate non-uniform density.
        * This is equal to moving `body.position` but not the `body.vertices`.
        * Invalid if the `centre` falls outside the body's convex hull.
        */
        public setCentre(centre: math.Ivec2, relative = false) {
            this.physicsEngine.setCentre(this.body, centre, relative);
        }

        start (){
            if(this.onInit) this.onInit(this);
        }

        update(delta: number) {

        }

        beforeStep(){
            if (!this.body ) return;
            //缩放
            let tSca = this.transform.localScale;
            if(!math.vec2Equal(this.lastScale , tSca)){
                this.setScale(tSca);
            }
            math.vec2Clone(tSca , this.lastScale);

            //位移、旋转
            if(this.enableBT){
                this.setPhyBodyTransformation();
            }

        }

        afterStep(){
            if (!this.body) return;
            this.setTransformationFormPhyBody();

        }


        private lastPos = new math.vector2();
        private lastRot = 0;
        /**
         * 设置物理的 旋转、位移
         */
        private setPhyBodyTransformation(){
            let tran = this.transform;
            let lpos = tran.localTranslate;
            if(lpos.x == this.lastPos.x && lpos.y == this.lastPos.y && this.lastRot == tran.localRotate) return;  //没有变化

            //同步到物理对象
            let posOs = this._positionOffset;
            let mPos : math.vector2;
            let mAngle : number;
            if(posOs.x !=0 || posOs.y !=0){
                let _scalR = physics2DBody.helpV2;
                mPos = physics2DBody.helpV2_1;
                let _angleR = physics2DBody.helpRefAngle;
                m4m.math.matrix3x2Multiply(tran.getLocalMatrix() , this._bodyLocalMtx, this._bodyWorldMtx);
                math.matrix3x2Decompose(this._bodyWorldMtx  , _scalR , _angleR , mPos);
                mAngle = _angleR.v;
            }else{
                mPos = tran.localTranslate;
                mAngle = tran.localRotate;
            }

            this.setPositionByPhy( mPos );
            this.setAngleByPhy( mAngle );

            //记录 before数据
            let bPos = this.body.position;
            m4m.math.vec2Set(this.beforePos , bPos.x, bPos.y );
            this.beforeAngle = this.body.angle;
        }

        /**
         * 从物理 设置 旋转、位移
         */
        private setTransformationFormPhyBody(){
            let trans = this.transform;
            let bPos = this.body.position;
            if(this.enableBT){
                let bfPos = this.beforePos;
                let deltaX = bPos.x - bfPos.x ;
                let deltaY = bPos.y - bfPos.y ;
                let deltaRot = this.body.angle - this.beforeAngle;
                if(deltaX== 0 && deltaY == 0 && deltaRot == 0) return;  //没有变化退出
                let lPos = trans.localTranslate;
                m4m.math.vec2Set(lPos, lPos.x + deltaX , lPos.y + deltaY);
                trans.localRotate += deltaRot;
            }else{
                let tPos = trans.localTranslate;
                if(bPos.x == tPos.x && bPos.y == tPos.y && trans.localRotate == this.body.angle ){  //没有变化退出
                    return;
                }
                physicTool.Ivec2Copy(this.body.position, trans.localTranslate);
                trans.localRotate = this.body.angle;
            }

            trans.markDirty();
        }

        remove() {
            this.physicsEngine.removeBody(this);
            this.body = null;
        }
    }
}