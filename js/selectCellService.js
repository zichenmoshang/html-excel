(function(){
	angular.module('myApp').factory('selectCellService',[function(){
		//矩阵，记录选择范围
		var matrix = {
			start : null,
			end : null
		};
		
		//初始化鼠标事件
		function init(id,scope){
			var ele = document.querySelector(id);
			
			ele.onmousedown = function(e){
				//让事件传播到table上
				//e.stopPropagation();
				//e.preventDefault();
				
				//关闭右键菜单
				scope.contextMenu.hideMenu();
				
				//左键点击td标签时
				if(e.button !== 2 && e.target.tagName === 'TD'){
					mousedown(e,ele,scope);
				};
			};
			ele.onmouseup = function(e){
				//让事件传播到table上
				//e.stopPropagation();
				//e.preventDefault();

				//左键点击td标签时,起点不为空时
				if(e.button !== 2 && e.target.tagName === 'TD' && !!matrix.start){
					mouseup(e,ele,scope);
				};
			};
		};
		
		//鼠标按下事件
		function mousedown(e,ele,scope){
			//是否已经有选区
			if(!!matrix.start || !!matrix.end){
				clearDraw(scope,true);
			};

			var _target = e.target;
			
			if(!!matrix.start){
				scope.tr[matrix.start.row].td[matrix.start.col].active = '';
			};
			//获取起点目标
			matrix.start = {
				col : parseInt(_target.dataset.col),
				row : parseInt(_target.dataset.row)
			};
			//给选择的点绘制选中状态
			scope.tr[matrix.start.row].td[matrix.start.col].active = 'active';
		
			scope.$digest();

		};
		
		//鼠标抬起事件
		function mouseup(e,ele,scope){
			var _target = e.target;
		
			//获取终点目标
			matrix.end = {
				col : parseInt(_target.dataset.col),
				row : parseInt(_target.dataset.row)
			};
			
			//起点是否大于终点
			var tmp = (matrix.start.col > matrix.end.col) ? matrix.start.col : undefined;
			if(tmp !== undefined){
				matrix.start.col = matrix.end.col;
				matrix.end.col = tmp;
			};
			tmp = (matrix.start.row > matrix.end.row) ? matrix.start.row : undefined;
			if(tmp !== undefined){
				matrix.start.row = matrix.end.row;
				matrix.end.row = tmp;
			};
			
			//判断终点是否越组
			adjustBoundary(scope,_target);
			
			//给选择的点绘制选中状态
			draw(scope);
		};
		
		//调整边界值
		function adjustBoundary(scope,target){
			//修改终点边界
			var i = 0,len = scope.group[0].length;
			if(matrix.start.row < scope.group[0][0]){
				matrix.end.row = scope.group[0][0] - 1;
				return
			};
			for(;i < len;i++){
				if(scope.group[0][i] <= matrix.start.row && (scope.group[0][i] + scope.group[2][i]) > matrix.start.row && scope.group[2][i] <= (matrix.end.row - matrix.start.row)){
					matrix.end.row = scope.group[0][i] + scope.group[2][i] - 1;
					return;
				};
			};
			
			
			//所选区域与合并的单元格之间的并集
//			angular.forEach(scope.mergeMsg,function(item){
//				if(item.)
//			});
		};
		
		//绘制
		function draw(scope){
			var i,j,
				//x轴起点
				sX = matrix.start.col,
				//x轴终点
				eX = matrix.end.col,
				//y轴起点
				sY = matrix.start.row,
				//y轴终点
				eY = matrix.end.row;
			
			for(i = sY;i <= eY; i++){
				for(j = sX;j <= eX; j++){
					scope.tr[i].td[j].active = 'active';
				}
			};
			
			scope.$digest();
			
		};
		
		//清除
		function clearDraw(scope,flag){
			if(!!matrix.start && !!matrix.end){
				var i,j,
					//x轴起点
					sX = matrix.start.col,
					//x轴终点
					eX = matrix.end.col,
					//y轴起点
					sY = matrix.start.row,
					//y轴终点
					eY = matrix.end.row;
					
				for(i = sY;i <= eY; i++){
					for(j = sX;j <= eX; j++){
						scope.tr[i].td[j].active = '';
					};
				};
				
				if(flag){
					scope.$digest();
				};
				
				
				matrix = {
					start : null,
					end : null
				};
			};
		};
		
		//返回选择矩阵
		function selectArea(){
			return matrix;
		};
		
		//判断是否可以合并
		function isMerge(){
			if(matrix.start !== null && matrix.end !== null){
				if(matrix.start.col === matrix.end.col && matrix.start.row === matrix.end.row){
					return false;
				};
				return true;
			}else{
				return false;
			};
		};
		
		/**
		 * @param {function} init 
		 * @param {function} clearDraw
		 * @param {function} selectArea 
		 * @param {function} isSameObj  @return {boolen}
		 * **/
		return {
			init : init,
			clearDraw : clearDraw,
			selectArea : selectArea,
			isMerge : isMerge
		}
	}]);
})()
