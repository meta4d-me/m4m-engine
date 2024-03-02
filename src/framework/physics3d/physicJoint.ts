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

    export interface PhysicsJointData {
        //Important for some engines, optional!
        /**
         * The main pivot of the joint
         */
        mainPivot?: math.vector3;
        /**
         * The connected pivot of the joint
         */
        connectedPivot?: math.vector3;
        /**
         * The main axis of the joint
         */
        mainAxis?: math.vector3,
        /**
         * The connected axis of the joint
         */
        connectedAxis?: math.vector3,
        /**
         * The collision of the joint
         */
        collision?: boolean
        /**
         * Native Oimo/Cannon/Energy data
         */
        nativeParams?: any;
    }

    /**
     * This is a holder class for the physics joint created by the physics plugin.
     * It holds a set of functions to control the underlying joint.
     */
    export class PhysicsJoint {

        private _physicsJoint: any;
        protected _physicsPlugin: IPhysicsEnginePlugin;
        /**
         * 关节
         * @param type 类型
         * @param jointData 关节数据
         */
        constructor(public type: number, public jointData: PhysicsJointData) {
            jointData.nativeParams = jointData.nativeParams || {};
        }

        public get physicsJoint(): any {
            return this._physicsJoint;
        }

        public set physicsJoint(newJoint: any) {

            if (this._physicsJoint) {
                //remove from the wolrd
            }

            this._physicsJoint = newJoint;
        }

        public set physicsPlugin(physicsPlugin: IPhysicsEnginePlugin) {
            this._physicsPlugin = physicsPlugin;
        }
        
        /**
         * 执行物理插件特定的函数。
         * @param  func 执行函数
         */
        public executeNativeFunction(func : (world: any, physicsJoint:any) => void) {
            func(this._physicsPlugin.world, this._physicsJoint)
        }


        //TODO check if the native joints are the same

        //Joint Types
        /**
         * Distance-Joint type
         */
        public static DistanceJoint = 0;
        /**
         * Hinge-Joint type
         */
        public static HingeJoint = 1;
        /**
         * Ball-and-Socket joint type
         */
        public static BallAndSocketJoint = 2;
        /**
         * Wheel-Joint type
         */
        public static WheelJoint = 3;
        /**
         * Slider-Joint type
         */
        public static SliderJoint = 4;
        //OIMO
        /**
         * Prismatic-Joint type
         */
        public static PrismaticJoint = 5;
        //
        /**
         * Universal-Joint type
         */
        public static UniversalJoint = 6;
        /**
         * Hinge-Joint 2 type
         */
        public static Hinge2Joint = PhysicsJoint.WheelJoint;
        //Cannon
        /**
         * Point to Point Joint type.  Similar to a Ball-Joint.  Different in parameters
         */
        public static PointToPointJoint = 8;
        //Cannon only at the moment
        /**
         * Spring-Joint type
         */
        public static SpringJoint = 9;
        /**
         * Lock-Joint type
         */
        public static LockJoint = 10;
    }

    /**
     * A class representing a physics distance joint.
     */
    export class DistanceJoint extends PhysicsJoint {
        /**
         * 距离关节
         * @param jointData 关节数据
         */
        constructor(jointData: DistanceJointData) {
            super(PhysicsJoint.DistanceJoint, jointData);
        }

        /**
         * 更新预定义的距离。
         * @param maxDistance 最大距离
         * @param minDistance 最小距离
         */
        public updateDistance(maxDistance: number, minDistance?: number) {
            this._physicsPlugin.updateDistanceJoint(this, maxDistance, minDistance);
        }
    }
    
    /**
     * Represents a Motor-Enabled Joint
     */
    export class MotorEnabledJoint extends PhysicsJoint implements IMotorEnabledJoint {
        /**
         * 马达关节
         * @param type 类型
         * @param jointData 关节数据
         */
        constructor(type: number, jointData:PhysicsJointData) {
            super(type, jointData);
        }
        
        public setMotor(force?: number, maxForce?: number) {
            this._physicsPlugin.setMotor(this, force || 0, maxForce);
        }
        
        public setLimit(upperLimit: number, lowerLimit?: number) {
            this._physicsPlugin.setLimit(this, upperLimit, lowerLimit);
        }
    }

    /**
     * This class represents a single hinge physics joint
     */
    export class HingeJoint extends MotorEnabledJoint {
        /**
         * 铰链关节
         * @param jointData 关节数据
         */
        constructor(jointData:PhysicsJointData) {
            super(PhysicsJoint.HingeJoint, jointData);
        }
        
        public setMotor(force?: number, maxForce?: number) {
            this._physicsPlugin.setMotor(this, force || 0, maxForce);
        }
        
        public setLimit(upperLimit: number, lowerLimit?: number) {
            this._physicsPlugin.setLimit(this, upperLimit, lowerLimit);
        }
    }
    
    /**
     * This class represents a dual hinge physics joint (same as wheel joint)
     */
    export class Hinge2Joint extends MotorEnabledJoint {
        /**
         * 铰链2关节
         * @param jointData 关节数据
         */
        constructor(jointData:PhysicsJointData) {
            super(PhysicsJoint.Hinge2Joint, jointData);
        }
        
        /**
         * 设置马达
         * 注意，此函数是特定于插件的。发动机的反应不会100%相同。
         * @param force 设置力
         * @param maxForce 马达的最大力
         * @param motorIndex 马达索引
         */
        public setMotor(force?: number, maxForce?: number, motorIndex: number = 0) {
            this._physicsPlugin.setMotor(this, force || 0, maxForce, motorIndex);
        }
        
        /**
         * 设置马达的限制
         * @param upperLimit 上限
         * @param lowerLimit 下限
         * @param motorIndex 马达索引
         */
        public setLimit(upperLimit: number, lowerLimit?: number, motorIndex: number = 0) {
            this._physicsPlugin.setLimit(this, upperLimit, lowerLimit, motorIndex);
        }
    }

    /**
     * Interface for a motor enabled joint
     */
    export interface IMotorEnabledJoint {
        physicsJoint: any;
        /**
         * 设置马达
         * 注意，此函数是特定于插件的。发动机的反应不会100%相同。
         * @param force 设置力
         * @param maxForce 马达的最大力
         */
        setMotor(force?: number, maxForce?: number, motorIndex?: number): void;
        /**
         * 设置马达的限制
         * @param upperLimit 上限
         * @param lowerLimit 下限
         */
        setLimit(upperLimit: number, lowerLimit?: number, motorIndex?: number): void;
    }

    /**
     * Joint data for a Distance-Joint
     */
    export interface DistanceJointData extends PhysicsJointData {
        maxDistance: number;
        //Oimo - minDistance
        //Cannon - maxForce
    }
    /**
     * Joint data from a spring joint
     */
    export interface SpringJointData extends PhysicsJointData {
        length: number;
        stiffness: number;
        damping: number;
    }
}