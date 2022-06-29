/**
@license
Copyright 2022 meta4d.me Authors

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
     * 曲线模式
     * 
     * @author feng3d
     */
    export enum MinMaxCurveMode
    {
        /**
         * Use a single constant for the MinMaxCurve.
         * 
         * 使用单个常数。
         */
        Constant = 0,
        /**
         * Use a single curve for the MinMaxCurve.
         * 
         * 使用一条曲线
         */
        Curve = 1,
        /**
         * Use a random value between 2 constants for the MinMaxCurve.
         * 
         * 在两个常量之间使用一个随机值
         */
        TwoConstants = 3,
        /**
         * Use a random value between 2 curves for the MinMaxCurve.
         * 
         * 在两条曲线之间使用一个随机值。
         */
        TwoCurves = 2,
    }
}