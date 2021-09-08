namespace df {
	/**
	 * 消灭星星算法
	 * @example
	 *	let ps = new df.PSAlgo();
	 *	ps.colors = 4;
	 *	ps.initGrids();
	 * 
	 *	let randomStar:df.PSGrid; // 任选一个可消除的星星
	 *	let uniteStars = ps.getUniteStars(randomStar); // 取得同色星星
	 *	ps.move(uniteStars); // 下落左移
	 *	ps.print();
	 */
	export class PSAlgo {
		constructor() {

		}

		/**行 */
		public row: number = 10;
		/**列 */
		public col: number = 10;
		public colors: number = 4;
		public grids: Array<PSGrid> = [];
		public initGrids() {
			this.grids.length = 0;
			for (let i = 0; i < this.row * this.col; i++) {
				let grid = new PSGrid();
				grid.num = df.MathUtil.randomInt(1, this.colors);
				grid.gridX = i % this.col;
				grid.gridY = Math.floor(i / this.col);
				this.grids.push(grid);
			}

			if (this.gameOver()) { // 确保生成可玩网格；
				this.initGrids();
			}
			else {
				this.print();
			}
		}

		public test() {
			let data = [
				[0, 0, 0, 2, 0, 0, 2, 0, 0, 1],
				[0, 3, 1, 2, 0, 3, 1, 0, 1, 0]
			]
			this.row = data.length;
			this.col = data[0].length;
			this.grids.length = 0;
			for (let i = 0; i < data.length; i++) {
				for (let j = 0; j < data[i].length; j++) {
					let grid = new PSGrid();
					grid.num = data[i][j];
					grid.gridX = j;
					grid.gridY = i;
					this.grids.push(grid);
				}
			}

			this.print();
		}

		public print() {
			let str = "";
			let line = 0;
			for (let i = 0; i < this.grids.length; i++) {
				let grid = this.grids[i];
				if (line != grid.gridY) {
					line = grid.gridY;
					str += "\n";
				}
				if (grid.num == 0) {
					str += "_ ";
				}
				else {
					str += `${grid.num} `;
				}
			}

			console.log(str);
			console.log("*********************************");
		}

		public auto() {
			if (this.gameOver()) {
				console.log("游戏结束!!!");
			}
			else {
				let tip = this.tip();
				let randomStar = df.ArrayUtil.getRandomItem(tip);
				let uniteStars = this.getUniteStars(randomStar);
				this.move(uniteStars);
				this.print();
			}
		}

		/**
		 * 下落左移
		 * @param stars 
		 * @returns 下落和左移的格子数据
		 */
		public move(stars: Array<PSGrid>) {
			let obj = this.getDisCol(stars);

			let move = { down: [], left: [] };
			for (let i = 0; i < obj.gridsX.length; i++) { // 先下落
				let data = obj.gridsX[i];
				let gridXStars = this.getGridXstars(data.key);
				df.ArrayUtil.sortDesBy("gridY", gridXStars);
				if (gridXStars.length == 0) { //本列已清空；
					data.clean = true;
				}

				let allGirdsX = this.getGridsByX(data.key);
				df.ArrayUtil.sortDesBy("gridY", allGirdsX);
				for (let j = 0; j < this.row; j++) {
					if (gridXStars[j]) {
						let dis = this.row - j - gridXStars[j].gridY - 1;
						if (dis != 0) {
							move.down.push({
								gridX: gridXStars[j].gridX,
								girdY: gridXStars[j].gridY,
								dis
							})
						}
						allGirdsX[j].num = gridXStars[j].num;
					}
					else {
						allGirdsX[j].num = 0;
					}
				}
			}

			this.formatLeft(obj, move);
			console.log(move);

			for (let i = 0; i < obj.gridsX.length; i++) { // 再左移
				let data = obj.gridsX[i];
				if (data.clean) {
					for (let j = data.key + 1; j < this.col; j++) {
						for (let k = 0; k < this.row; k++) {
							let leftGrid = this.getGrid(j - 1, k);
							let cur = this.getGrid(j, k);
							leftGrid.num = cur.num;
							cur.num = 0;
						}
					}
				}
			}

			return move;
		}

		private getGridXstars(gridX: number) {
			let stars: Array<PSGrid> = [];
			for (let i = 0; i < this.grids.length; i++) {
				if (this.grids[i].gridX == gridX && this.grids[i].num != 0) {
					stars.push(this.grids[i]);
				}
			}

			return stars;
		}

		private getGridsByX(gridX: number) {
			let grids: Array<PSGrid> = [];
			for (let i = 0; i < this.grids.length; i++) {
				if (this.grids[i].gridX == gridX) {
					grids.push(this.grids[i]);
				}
			}

			return grids;
		}

		private getGrid(gridX: number, gridY: number): PSGrid {
			for (let i = 0; i < this.grids.length; i++) {
				let grid = this.grids[i];
				if (grid.gridX == gridX && grid.gridY == gridY) {
					return grid;
				}
			}
			return;
		}

		/**
		 * 消失的星星所在列
		 */
		private getDisCol(stars: Array<PSGrid>) {
			let obj = { gridsX: [] };
			for (let i = 0; i < stars.length; i++) {
				let star: PSGrid = stars[i];
				star.num = 0;

				let has = false;
				for (let i = 0; i < obj.gridsX.length; i++) {
					if (obj.gridsX[i].key == star.gridX) {
						has = true;
						break;
					}
				}
				if (!has) {
					obj.gridsX.push({ key: star.gridX });
				}
			}
			df.ArrayUtil.sortDesBy("key", obj.gridsX);

			return obj;
		}

		/**
		 * 格式化左移项
		 */
		private formatLeft(obj, move) {
			for (let i = 0; i < obj.gridsX.length; i++) {
				let data = obj.gridsX[i];
				if (data.clean) {
					for (let j = data.key + 1; j < this.col; j++) {
						let gridXStars = this.getGridXstars(j);
						for (let k = 0; k < gridXStars.length; k++) {
							move.left.push({
								gridX: gridXStars[k].gridX,
								gridY: gridXStars[k].gridY,
							})
						}
					}
				}
			}

			let left = [];
			for (let i = 0; i < move.left.length; i++) {
				let m = move.left[i];
				let has = false;
				for (let j = 0; j < left.length; j++) {
					if (left[j].gridX == m.gridX && left[j].gridY == m.gridY) {
						left[j].dis++;
						has = true;
					}
				}
				if (!has) {
					m.dis = 1;
					left.push(m);
				}
			}

			move.left = left;
		}

		private _hasSelected: Array<PSGrid> = [];
		private _uniteStars: Array<PSGrid> = [];

		/**
		 * 取整块同颜色的星星
		 * @param star 
		 * @returns 
		 */
		public getUniteStars(star: PSGrid) {
			this._hasSelected.length = 0;
			this._uniteStars.length = 0;
			this.scanUniteStars(star);

			return this._uniteStars;
		}

		/**
		 * 扫描同颜色的星星
		 * @param star 
		 */
		private scanUniteStars(star: PSGrid) {
			if (this._hasSelected.indexOf(star) == -1) {
				this._hasSelected.push(star);

				if (this._uniteStars.indexOf(star) == -1) {
					this._uniteStars.push(star);
				}

				let rounds: Array<PSGrid> = this.selectRoundGrid(star);
				for (let i = 0; i < rounds.length; i++) {
					if (rounds[i].num == star.num) {
						this.scanUniteStars(rounds[i]);
					}
				}
			}
		}

		/**
		 * 选择上下左右的格子
		 * @param star 
		 * @returns 
		 */
		private selectRoundGrid(star: PSGrid) {
			let r = [];
			for (let i = 0; i < this.grids.length; i++) {
				let data = this.grids[i];
				if (star.gridX == data.gridX && star.gridY == data.gridY + 1) { // 上面
					r.push(data);
				}
				if (star.gridX == data.gridX && star.gridY == data.gridY - 1) { // 下面
					r.push(data);
				}
				if (star.gridX == data.gridX + 1 && star.gridY == data.gridY) { // 左
					r.push(data);
				}
				if (star.gridX == data.gridX - 1 && star.gridY == data.gridY) { // 右
					r.push(data);
				}
			}

			return r;
		}

		/**
		 * 给出可消除提示
		 * @returns 
		 */
		public tip() {
			let tipStars: Array<PSGrid>;
			for (let i = 0; i < this.grids.length; i++) {
				if (this.grids[i].num != 0) {
					tipStars = this.getUniteStars(this.grids[i]);
					if (tipStars && tipStars.length >= 2) {
						break;
					}
				}
			}

			return tipStars;
		}

		/**
		 * 判断游戏是否结束
		 * @returns 
		 */
		public gameOver() {
			let tipStars = this.tip();
			if (tipStars && tipStars.length >= 2) {
				return false;
			}
			else {
				return true;
			}
		}

	}
}