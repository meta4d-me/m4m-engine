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

    export interface PhysicsImpostorJoint {
        mainImpostor: PhysicsImpostor;
        connectedImpostor: PhysicsImpostor;
        joint: PhysicsJoint;
    }

    export class PhysicsEngine {

        public gravity: math.vector3;

        /**
         * Creates a new Physics Engine
         * @param gravity defines the gravity vector used by the simulation
         * @param _physicsPlugin defines the plugin to use (CannonJS by default)
         */
        constructor(gravity:math.vector3=null, private _physicsPlugin: IPhysicsEnginePlugin = new CannonJSPlugin()) {
            if (!this._physicsPlugin.isSupported()) {
                throw new Error("Physics Engine " + this._physicsPlugin.name + " cannot be found. "
                    + "Please make sure it is included.")
            }
            gravity = gravity || new math.vector3(0, -9.807, 0)
            this.setGravity(gravity);
            this.setTimeStep();
        }

        /**
         * Sets the gravity vector used by the simulation
         * @param gravity defines the gravity vector to use
         */
        public setGravity(gravity: math.vector3): void {
            this.gravity = gravity;
            this._physicsPlugin.setGravity(this.gravity);
        }

        /**
         * Set the time step of the physics engine.
         * default is 1/60.
         * To slow it down, enter 1/600 for example.
         * To speed it up, 1/30
         * @param {number} newTimeStep the new timestep to apply to this world.
         */
        public setTimeStep(newTimeStep: number = 1 / 60) {
            this._physicsPlugin.setTimeStep(newTimeStep);
        }

        /**
         * Get the time step of the physics engine.
         */
        public getTimeStep(): number {
            return this._physicsPlugin.getTimeStep();
        }

        /**
         * dispose all impostor of the physics engine.
         */
        public dispose(): void {
            this._impostors.forEach(function (impostor) {
                impostor.dispose();
            })
            this._physicsPlugin.dispose();
        }

        public getPhysicsPluginName(): string {
            return this._physicsPlugin.name;
        }

        // Statics
        public static Epsilon = 0.001;

        //new methods and parameters

        private _impostors: Array<PhysicsImpostor> = [];
        private _joints: Array<PhysicsImpostorJoint> = [];
        
        /**
         * Adding a new impostor for the impostor tracking.
         * This will be done by the impostor itself.
         * @param {PhysicsImpostor} impostor the impostor to add
         */
        public addImpostor(impostor: PhysicsImpostor) {
            impostor.uniqueId = this._impostors.push(impostor);
            //if no parent, generate the body
            // if (!impostor.parent) {
            //     this._physicsPlugin.generatePhysicsBody(impostor);
            // }

            this._physicsPlugin.generatePhysicsBody(impostor);
        }

        /**
         * Remove an impostor from the engine.
         * This impostor and its mesh will not longer be updated by the physics engine.
         * @param {PhysicsImpostor} impostor the impostor to remove
         */
        public removeImpostor(impostor: PhysicsImpostor) {
            var index = this._impostors.indexOf(impostor);
            if (index > -1) {
                var removed = this._impostors.splice(index, 1);
                //Is it needed?
                if (removed.length) {
                    //this will also remove it from the world.
                    removed[0].physicsBody = null;
                }
            }
        }

        /**
         * Add a joint to the physics engine
         * @param {PhysicsImpostor} mainImpostor the main impostor to which the joint is added.
         * @param {PhysicsImpostor} connectedImpostor the impostor that is connected to the main impostor using this joint
         * @param {PhysicsJoint} the joint that will connect both impostors.
         */
        public addJoint(mainImpostor: PhysicsImpostor, connectedImpostor: PhysicsImpostor, joint: PhysicsJoint) {
            var impostorJoint = {
                mainImpostor: mainImpostor,
                connectedImpostor: connectedImpostor,
                joint: joint
            }
            joint.physicsPlugin = this._physicsPlugin;
            this._joints.push(impostorJoint);
            this._physicsPlugin.generateJoint(impostorJoint);
        }

        /**
         * Removes a joint from the simulation
         * @param mainImpostor defines the impostor used with the joint
         * @param connectedImpostor defines the other impostor connected to the main one by the joint
         * @param joint defines the joint to remove
         */
        public removeJoint(mainImpostor: PhysicsImpostor, connectedImpostor: PhysicsImpostor, joint: PhysicsJoint) {
            var matchingJoints = this._joints.filter(function (impostorJoint) {
                return (impostorJoint.connectedImpostor === connectedImpostor
                    && impostorJoint.joint === joint
                    && impostorJoint.mainImpostor === mainImpostor)
            });
            if (matchingJoints.length) {
                this._physicsPlugin.removeJoint(matchingJoints[0]);
                //TODO remove it from the list as well

            }
        }

        /**
         * Called by the scene. no need to call it.
         */
        public _step(delta: number) {
            //check if any mesh has no body / requires an update
            this._impostors.forEach((impostor) => {

                if (impostor.isBodyInitRequired()) {
                    this._physicsPlugin.generatePhysicsBody(impostor);
                }
            });

            if (delta > 0.1) {
                delta = 0.1;
            } else if (delta <= 0) {
                delta = 1.0 / 60.0;
            }

            this._physicsPlugin.executeStep(delta, this._impostors);

            // this._impostors.forEach((impostor) => {
            //     this._physicsPlugin.setTransformationFromPhysicsBody(impostor);
            // });

        }

        /**
         * Gets the current plugin used to run the simulation
         * @returns current plugin
         */
        public getPhysicsPlugin(): IPhysicsEnginePlugin {
            return this._physicsPlugin;
        }
        /**
         * Gets the list of physic impostors
         * @returns an array of PhysicsImpostor
         */
        public getImpostors(): Array<PhysicsImpostor> {
            return this._impostors;
        }

        /**
         * Gets the impostor for a physics enabled object
         * @param object defines the object impersonated by the impostor
         * @returns the PhysicsImpostor or null if not found
         */
        public getImpostorForPhysicsObject(object: transform): PhysicsImpostor {
            for (var i = 0; i < this._impostors.length; ++i) {
                if (this._impostors[i].object === object) {
                    return this._impostors[i];
                }
            }

            return null;
        }

        /**
         * Gets the impostor for a physics body object
         * @param body defines physics body used by the impostor
         * @returns the PhysicsImpostor or null if not found
         */
        public getImpostorWithPhysicsBody(body: any): PhysicsImpostor {
            for (var i = 0; i < this._impostors.length; ++i) {
                if (this._impostors[i].physicsBody === body) {
                    return this._impostors[i];
                }
            }

            return null;
        }



    }

    export interface IPhysicsEnginePlugin {
        world: any;
        name: string;
        /**
         * 设置重力值
         * @param gravity  重力值
         */
        setGravity(gravity: math.vector3): void;
        /**
         * 设置固定的 一步执行的时间周期
         * @param timeStep 时间周期
         */
        setTimeStep(timeStep: number): void;
        getTimeStep(): number;
        /**
         * 执行一步计算
         * @param delta 上一帧的时间间隔值
         * @param impostors 物理代理列表
         */
        executeStep(delta: number, impostors: Array<PhysicsImpostor>): void; //not forgetting pre and post events
        /**
         * 应用一个冲量
         * @param impostor 物理代理
         * @param force 力向量
         * @param contactPoint 作用点坐标
         */
        applyImpulse(impostor: PhysicsImpostor, force: math.vector3, contactPoint: math.vector3): void;
        /**
         * 应用一个力
         * @param impostor 物理代理
         * @param force 力向量
         * @param contactPoint 作用点坐标
         */
        applyForce(impostor: PhysicsImpostor, force: math.vector3, contactPoint: math.vector3): void;
        /**
         * 生成物理体
         * @param impostor 物理代理
         */
        generatePhysicsBody(impostor: PhysicsImpostor): void;
        /**
         * 移除物理体
         * @param impostor 物理代理
         */
        removePhysicsBody(impostor: PhysicsImpostor): void;
        /**
         * 生成物理连关节
         * @param joint 物理连关节
         */
        generateJoint(joint: PhysicsImpostorJoint): void;
        /**
         * 移除物理连关节
         * @param joint 物理连关节
         */
        removeJoint(joint: PhysicsImpostorJoint): void;
        /**
         * 是否支持
         */
        isSupported(): boolean;
        /**
         * 设置同步节点的变换信息 到 物理体
         * @param impostor 物理体
         */
        setTransformationFromPhysicsBody(impostor: PhysicsImpostor): void;
        /**
         * 设置物理体的变换
         * @param impostor 物理体
         * @param newPosition 位置
         * @param newRotation 旋转
         */
        setPhysicsBodyTransformation(impostor: PhysicsImpostor, newPosition: math.vector3, newRotation: math.quaternion): void;
        /**
         * 设置线性速度
         * @param impostor 物理体
         * @param velocity 速度向量
         */
        setLinearVelocity(impostor: PhysicsImpostor, velocity: math.vector3): void;
        /**
         * 设置角速度
         * @param impostor 物理体
         * @param velocity 速度向量
         */
        setAngularVelocity(impostor: PhysicsImpostor, velocity: math.vector3): void;
        /**
         * 获取线性速度
         * @param impostor 物理体
         * @returns 输出的速度向量
         */
        getLinearVelocity(impostor: PhysicsImpostor): math.vector3;
        /**
         * 获取角速度
         * @param impostor 物理体
         * @returns 输出的速度向量
         */
        getAngularVelocity(impostor: PhysicsImpostor): math.vector3;
        /**
         * 设置物理体的质量
         * @param impostor 物理体
         * @param mass 质量
         */
        setBodyMass(impostor: PhysicsImpostor, mass: number): void;
        /**
         * 获取物理体的质量
         * @param impostor 物理体
         * @returns 质量
         */
        getBodyMass(impostor: PhysicsImpostor): number;
        /**
         * 获取物理体的摩擦力
         * @param impostor 物理体
         * @returns 摩擦力
         */
        getBodyFriction(impostor: PhysicsImpostor): number;
        /**
         * 设置物理体的摩擦力
         * @param impostor 物理体
         * @param friction 摩擦力
         */
        setBodyFriction(impostor: PhysicsImpostor, friction: number): void;
        /**
         * 获取物理体的恢复系数
         * @param impostor 物理体
         * @returns 恢复系数
         */
        getBodyRestitution(impostor: PhysicsImpostor): number;
        /**
         * 设置物理体的恢复系数
         * @param impostor 物理体
         * @param restitution 恢复系数
         */
        setBodyRestitution(impostor: PhysicsImpostor, restitution: number): void;
        /**
         * 睡眠物理体
         * @param impostor 物理体
         */
        sleepBody(impostor: PhysicsImpostor): void;
        /**
         * 是睡眠状态？
         * @param impostor  物理体
         * @returns 是睡眠状态？
         */
        isSleeping(impostor: PhysicsImpostor) : boolean;
        /**
         * 叫醒物理体
         * @param impostor 物理体
         */
        wakeUpBody(impostor: PhysicsImpostor): void;
        //Joint Update
        /**
         * 更新距离关节
         * @param joint 关节
         * @param maxDistance 最大距离
         * @param minDistance 最小距离
         */
        updateDistanceJoint(joint: PhysicsJoint, maxDistance:number, minDistance?: number): void;
        /**
         * 设置 马达转子
         * @param joint 马达关节
         * @param speed 速度
         * @param maxForce 最大力值
         * @param motorIndex 马达索引
         */
        setMotor(joint: IMotorEnabledJoint, speed: number, maxForce?: number, motorIndex?: number): void;
        /**
         * 设置限制马达关节
         * @param joint 马达关节
         * @param upperLimit 上限
         * @param lowerLimit 下限
         * @param motorIndex 马达索引
         */
        setLimit(joint: IMotorEnabledJoint, upperLimit: number, lowerLimit?: number, motorIndex?: number): void;
        /**
         * 获取半径
         * @param impostor  物理体
         */
        getRadius(impostor: PhysicsImpostor):number;
        /**
         * 获取 物理体的 包围盒尺寸
         * @param impostor 物理体
         * @param result 包围盒尺寸
         */
        getBoxSizeToRef(impostor: PhysicsImpostor, result:math.vector3): void;
        //syncMeshWithImpostor(mesh:AbstractMesh, impostor:PhysicsImpostor): void;
        /** 销毁 */
        dispose(): void;
    }
    
}
