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
     * 方程求解
     * 
     * 求解方程 f(x) == 0 在[a, b]上的解
     * 
     * 参考：高等数学 第七版上册 第三章第八节 方程的近似解
     * 当f(x)在区间 [a, b] 上连续，且f(a) * f(b) <= 0 时，f(x)在区间 [a, b] 上至少存在一个解使得 f(x) == 0
     * 
     * 当f(x)在区间 [a, b] 上连续，且 (f(a) - y) * (f(b) - y) < 0 时，f(x)在区间 [a, b] 上至少存在一个解使得 f(x) == y
     * 
     * @author feng / http://feng3d.com 05/06/2018
     */
    export class EquationSolving
    {
        /**
         * 获取数字的(正负)符号
         * @param n 数字
         */
        private static getSign(n: number)
        {
            return n > 0 ? "+" : "-";
        }

        /**
         * 比较 a 与 b 是否相等
         * @param a 值a
         * @param b 值b
         * @param precision 比较精度
         */
        private static equalNumber(a: number, b: number, precision = 0.0000001)
        {
            return Math.abs(a - b) < precision;
        }

        /**
         * 获取近似导函数 f'(x)
         * 
         * 导函数定义
         * f'(x) = (f(x + Δx) - f(x)) / Δx , Δx → 0
         * 
         * 注：通过测试Δx不能太小，由于方程内存在x的n次方问题（比如0.000000000000001的10次方为0），过小会导致计算机计算进度不够反而导致求导不准确！
         * 
         * 另外一种办法是还原一元多次函数，然后求出导函数。
         * 
         * @param f 函数
         * @param delta Δx，进过测试该值太小或者过大都会导致求导准确率降低（个人猜测是计算机计算精度问题导致）
         */
        static getDerivative(f: (x: number) => number, delta = 0.000000001)
        {
            return (x: number) =>
            {
                var d = (f(x + delta) - f(x)) / delta;
                return d;
            }
        }

        /**
         * 函数是否连续
         * @param f 函数
         */
        private static isContinuous(f: (x: number) => number)
        {
            return true;
        }

        /**
         * 方程 f(x) == 0 在 [a, b] 区间内是否有解
         * 
         * 当f(x)在区间 [a, b] 上连续，且f(a) * f(b) <= 0 时，f(x)在区间 [a, b] 上至少存在一个解使得 f(x) == 0
         * 
         * @param f 函数f(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param errorcallback  错误回调函数
         * 
         * @returns 是否有解
         */
        private static hasSolution(f: (x: number) => number, a: number, b: number, errorcallback?: (err: Error) => void)
        {
            if (!this.isContinuous(f))
            {
                errorcallback && errorcallback(new Error(`函数 ${f} 在 [${a} ,${b}] 区间内不连续，无法为其求解！`));
                return false;
            }
            var fa = f(a);
            var fb = f(b);
            if (fa * fb > 0)
            {
                errorcallback && errorcallback(new Error(`f(a) * f(b) 值为 ${fa * fb}，不满足 f(a) * f(b) <= 0，无法为其求解！`));
                return false;
            }
            return true;
        }

        /**
         * 连线法 求解 f(x) == 0
         * 
         * 连线法是我自己想的方法，自己取的名字，目前没有找到相应的资料（这方法大家都能够想得到。）
         * 
         * 用曲线弧两端的连线来代替曲线弧与X轴交点作为边界来逐步缩小求解区间，最终获得解
         * 
         * 通过 A，B两点连线与x轴交点来缩小求解区间最终获得解
         * 
         * A，B两点直线方程 f(x) = f(a) + (f(b) - f(a)) / (b - a) * (x-a) ,求 f(x) == 0 解得 x = a - fa * (b - a)/ (fb - fa)
         * 
         * @param f 函数f(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param precision 求解精度
         * @param errorcallback  错误回调函数
         * 
         * @returns 不存在解时返回 undefined ，存在时返回 解
         */
        static line(f: (x: number) => number, a: number, b: number, precision = 0.0000001, errorcallback?: (err: Error) => void)
        {
            if (!this.hasSolution(f, a, b, errorcallback)) return undefined;

            var fa = f(a);
            var fb = f(b);
            if (this.equalNumber(fa, 0, precision))
            {
                return a;
            }
            if (this.equalNumber(fb, 0, precision))
            {
                return b;
            }
            do
            {
                // 
                var x = a - fa * (b - a) / (fb - fa);
                var fr = f(x);
                if (fa * fr < 0)
                {
                    b = x;
                    fb = fr;
                } else
                {
                    a = x;
                    fa = fr;
                }
            } while (!this.equalNumber(fr, 0, precision));
            return x;
        }
    }
}
