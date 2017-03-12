(function(){
	angular.module('myApp').factory('dragService',[function(){
		
		//初始化鼠标事件
		function init(id,scope){
			var ele = document.querySelector(id);
			ele.onmousedown = function(e){
				e.stopPropagation();
				e.preventDefault();
				
				mousedown(e,ele,scope);
			};
			//鼠标抬起清除移动事件
			ele.onmouseup = function(e){
				e.stopPropagation();
				e.preventDefault();
				
				ele.onmousemove = null;
			};
		};
		
		//鼠标按下事件
		function mousedown(e,ele,scope){
			//获取点击目标
			var target = e.target;
			//添加鼠标移动绑定
			ele.onmousemove = function(e) {
				e.stopPropagation();
				e.preventDefault();
				
				mousemove(e,scope,target);
			};
		};
		
		//鼠标移动事件
		function mousemove(e,scope,target){
			//获取点击目标数
			var index = target.dataset.index;
			//通过class名称来区别横向移动和上下移动
			switch (target.className){
				case 'moveWidth':
					transverseFun(e,scope,index);
					break;
				case 'moveHeight':
					verticalFun(e,scope,index);
					break;
				default:
					break;
			};

		};

		//横向移动
		function transverseFun(e,scope,index){
			if(index > 0){
				//选中线的宽度
				var moveLineWidth = 3,i=0,width=0;
				//汇总宽度
				for(i=0;i<index;i++){
					width += scope.col[i].width;
				};
				
				//左侧移动边界
				if(e.pageX > (width + moveLineWidth)){
					scope.col[index].width = e.pageX - width;
					scope.$digest();
				};
			};
		};
		
		//竖向移动
		function verticalFun(e,scope,index){
			//选中线的高度
			var moveLineHeight = 3,i=0,height=0;
			//汇总宽度
			for(i=0;i<index;i++){
				height += scope.tr[i].height;
			};
			
			//上方移动边界
			if(e.pageY > (height + moveLineHeight)){
				scope.tr[index].height = e.pageY - height;
				scope.$digest();
			};
		};
		
		return {
			init : init
		}
	}]);
})();
