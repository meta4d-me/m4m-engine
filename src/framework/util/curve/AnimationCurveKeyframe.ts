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
     * 动画关键帧
     * 
     * @author feng3d
     */
    export interface AnimationCurveKeyframe
    {
        /**
         * The time of the keyframe.
         * 
         * 关键帧的时间。
         */
        time: number

        /**
         * 曲线在关键帧处的值。
         */
        value: number

        /**
         * Describes the tangent when approaching this point from the previous point in the curve.
         * 
         * 描述从曲线上的前一点接近该点时的切线。
         */
        inTangent: number;

        /**
         * Describes the tangent when leaving this point towards the next point in the curve.
         * 
         * 描述从这个点到曲线上下一个点的切线。
         */
        outTangent: number;
    }
}