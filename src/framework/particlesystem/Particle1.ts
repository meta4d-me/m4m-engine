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
	 * 粒子
	 * 
	 * @author feng3d
	 */
	export class Particle1
	{
		/**
		 * 出生时间
		 */
		birthTime = 0;

		/**
		 * 寿命
		 */
		lifetime = 5;

		/**
		 * 位置
		 */
		position = new math.vector3();

		/**
		 * 速度
		 */
		velocity = new math.vector3();

		/**
		 * 加速度
		 */
		acceleration = new math.vector3();

		/**
		 * 旋转角度
		 */
		rotation = new math.vector3();

		/**
		 * 角速度
		 */
		angularVelocity = new math.vector3();

		/**
		 * 尺寸
		 */
		size = new math.vector3(1, 1, 1);

		/**
		 * 起始尺寸
		 */
		startSize = new math.vector3(1, 1, 1);

		/**
		 * 颜色
		 */
		color = new math.color();

		/**
		 * 起始颜色
		 */
		startColor = new math.color();

		/**
		 * 纹理UV缩放和偏移。
		 */
		tilingOffset = new math.vector4(1, 1, 0, 0);

		/**
		 * 在粒子上翻转UV坐标，使它们呈现水平镜像。
		 */
		flipUV = new math.vector2();

		/**
		 * 出生时在周期的位置（在发射时被更新）
		 */
		birthRateAtDuration: number;

		/**
		 * 此时粒子在生命周期的位置（在更新状态前被更新）
		 */
		rateAtLifeTime: number;

		/**
		 * 缓存，用于存储计算时临时数据
		 */
		cache = {};

		/**
		 * 更新状态
		 */
		updateState(preTime: number, time: number)
		{
			preTime = Math.max(preTime, this.birthTime);
			time = Math.max(this.birthTime, time);

			var pTime = time - preTime;

			// 计算速度
			this.velocity.x += this.acceleration.x * pTime;
			this.velocity.y += this.acceleration.y * pTime;
			this.velocity.z += this.acceleration.z * pTime;

			// 计算位置
			this.position.x += this.velocity.x * pTime;
			this.position.y += this.velocity.y * pTime;
			this.position.z += this.velocity.z * pTime;

			// 计算角度
			this.rotation.x += this.angularVelocity.x * pTime;
			this.rotation.y += this.angularVelocity.y * pTime;
			this.rotation.z += this.angularVelocity.z * pTime;
		}
	}
}
