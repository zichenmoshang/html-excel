(function(){
	angular.module('myApp').directive('printTemplate',
		['$templateCache','dragService','selectCellService',
		function($templateCache,dragService,selectCellService){
			return {
				restrict : 'AC',
				template : $templateCache.get('tpl.html'),
				replace : true,
				scope : {},
				link : function(scope,ele,attr){
					//基准值
					var base = {
						w : 50,
						h : 30
					};
					//容器宽高
					var box = {
						w : ele[0].clientWidth,
						h : ele[0].clientHeight
					};
					//合并的单元格信息
					scope.mergeMsg = [];
					//分组 [0]所在行 [1]信息 [2]长度
					scope.group = [
						[0,1,2,3,4,5,6],
						[
							{
								name : '页头',
								show : true
							},
							{
								name : '页标题',
								show : true
							},
							{
								name : '数据标题',
								show : true
							},
							{
								name : '数据明细',
								show : true
							},
							{
								name : '数据注脚',
								show : true
							},
							{
								name : '页注脚',
								show : true
							},
							{
								name : '汇总',
								show : true
							}
						],
						[1,1,1,1,1,1,1]
					];
					//右键菜单
					scope.contextMenu = {
						//菜单
						menu : [
							{
								id : 0,
								name : "合并单元格",
								disable : true
							},
							{
								id : 1,
								name : "拆分单元格",
								disable : true
							},
							{
								id : 2,
								name : "在之前插入一行",
								disable : true
							},
							{
								id : 3,
								name : "在之后插入一行",
								disable : true
							},
							{
								id : 4,
								name : "在之前插入一列",
								disable : true
							},
							{
								id : 5,
								name : "在之后插入一列",
								disable : true
							},
							{
								id : 6,
								name : "删除当前行",
								disable : true
							},
							{
								id : 7,
								name : "删除当前列",
								disable : true
							},
							{
								id : 8,
								name : "隐藏该区域"
							}
						],
						//权限
						power : {
							theadTH : [4,5,7],
							tbodyTH : [2,3,8],
							tbodyTD : [2,3,4,5,6,7],
							empty : []
						},
						//显示
						showMenu : function(x,y){
							this.disable();
							
							this.position = {
								left : x,
								top : y
							};
							this.show = true;
						},
						//隐藏
						hideMenu : function(){
							if(this.show === true){
								this.show = false;
							};
						},
						//判断可用菜单
						disable : function(){
							switch (scope.selectTd.dataset.op){
								case "col":
									//thead th 表头权限
									this.assignPower(this.power.theadTH);
									break;
								case "row":
									//tbody th 表体头权限
									this.assignPower(this.power.tbodyTH);
									//判断是否可删除,可隐藏区域
									if(scope.selectTd.dataset.row < scope.group[0][0]){
										this.menu[6].disable = false;
										this.menu[8].disable = true;
									};
									break;
								default:
									//td 表内容权限
									//判断是否可合并
									if(selectCellService.isMerge()){
										this.assignPower(this.power.empty);
										this.menu[0].disable = false;
										return;
									};
									this.assignPower(this.power.tbodyTD);
									//判断是否可拆分
									if(scope.selectTd.colSpan !== 1 || scope.selectTd.rowSpan !== 1){
										this.menu[1].disable = false;
									};
									//判断是否可删除
									if(scope.selectTd.dataset.delete === 'true'){
										this.menu[6].disable = true;
									};
									break;
							};
						},
						//赋值权限
						assignPower : function(power){
							angular.forEach(this.menu,function(item,index){
								if(power.indexOf(index) > -1){
									item.disable = false;
								}else{
									item.disable = true;
								};
							});
						}
					};
					
					//初始化数据
					var init = function(){
						//列宽
						scope.col = [];
						//表头
						scope.th = [];
						//表体
						scope.tr = [];
						//空行
						scope.td = []
						var i,len,charCode = 65;
						
						for(i=1,len=Math.floor(box.w/base.w)-1;i<=len;i++){
							scope.col.push({width:i===1?100:base.w});
							if(i === 1){
								scope.th.push({
									title:'',
									op:'col'
								});
							}else{
								scope.th.push({
									title:String.fromCharCode(charCode++),
									op:'col'
								});
							};
							
							scope.td.push({
								active : '',
								textContent : '',
								colspan : 1,
								rowspan : 1,
								show : true
							});
						};
						
						for(i=1,len=Math.floor(box.h/base.h)-1;i<=len;i++){
							var _td = [];
							angular.copy(scope.td,_td);
							scope.tr.push({
								height : 30,
								td : _td,
								show : true,
								th : {
									op : 'row',
									name : filterTrName(i-1),
									show : true,
									rowspan : 1
								}
							});
						};
						
						//右键菜单
						scope.contextMenu.show = false;
						scope.contextMenu.position = {
							top : 0,
							left : 0
						};
					};
					init();
					
					//过滤行标题名称
					function filterTrName(i){
						if(scope.group[0].indexOf(i) > -1){
							return scope.group[1][i].name;
						}else{
							return '';
						};
					};
					
					scope.$watch('$viewContentLoaded',function(){
						//移动事件,使用原生事件绑定
						dragService.init('.table',scope);
						//合并单元格,使用原生事件绑定
						selectCellService.init('.tbody',scope);
					});
					
					//表格内容双击写入
					ele.find('tbody').bind('dblclick',function(e){
						e.stopPropagation();
						e.preventDefault();
						var _target = e.target;
						
						if(_target.tagName === "TD"){
							var col = _target.dataset.col,
								row = _target.dataset.row;
							scope.tr[row].td[col].active = '';
							  	
							var content = prompt("请输入内容","");
							if (content !== null && content !== ""){
							   	 scope.tr[row].td[col].textContent = content;
							};
							
							scope.$digest();
						};
					});
					
					
					//表格内容右键菜单
					ele.find('table').bind('contextmenu',function(e){
						e.stopPropagation();
						e.preventDefault();

						scope.selectTd = e.target;
						
						//第一个th元素不能点击
						if(scope.selectTd.dataset.index === "0" && scope.selectTd.dataset.op === "col"){
							scope.contextMenu.hideMenu();
						}else{
							//打开右键菜单
							scope.contextMenu.showMenu(e.pageX,e.pageY);
						}
						
						scope.$digest();
					});
					
					//右键菜单点击
					ele.find('ul').bind('click',function(e){
						e.stopPropagation();
						e.preventDefault();
						
						//关闭右键菜单
						scope.contextMenu.hideMenu();
						
						switch(e.target.dataset.id){
							case '0' : 
								//合并单元格
								//活动选区
								var selectArea = selectCellService.selectArea();
								mergeCell(
									selectArea.start.col,
									selectArea.end.col,
									selectArea.start.row,
									selectArea.end.row
								);
								//加入合并单元格信息数组
								scope.mergeMsg.push({
									row : selectArea.start.row,
									col : selectArea.start.col,
									width : selectArea.end.col - selectArea.start.col + 1,
									height : selectArea.end.row - selectArea.start.row + 1
								});
								//清除选区
								selectCellService.clearDraw(scope,false);
								break;
							case '1' : 
								//拆分单元格
								splitCell(
									parseInt(scope.selectTd.dataset.col),
									parseInt(scope.selectTd.dataset.row),
									parseInt(scope.selectTd.colSpan),
									parseInt(scope.selectTd.rowSpan)
								);
								//清除选区
								selectCellService.clearDraw(scope,false);
								break;
							case '2' :
								//清除选区
								selectCellService.clearDraw(scope,false);
								//在之前插入一行
								insertRow(0);
								break;
							case '3':
								//清除选区
								selectCellService.clearDraw(scope,false);
								//在之后插入一行
								insertRow(1);
								break;
							case '4':
								//清除选区
								selectCellService.clearDraw(scope,false);
								//在之前插入一列
								insertCol(0);
								break;
							case '5':
								//清除选区
								selectCellService.clearDraw(scope,false);
								//在之后插入一列
								insertCol(1);
								break;
							case '6':
								//清除选区
								selectCellService.clearDraw(scope,false);
								//删除当前行
								deleteCurrent(0);
								break;
							case '7':
								//清除选区
								selectCellService.clearDraw(scope,false);
								//删除当前列
								deleteCurrent(1);
								break;
							case '8':
								//清除选区
								selectCellService.clearDraw(scope,false);
								//隐藏当前组
								hideGroup(1,parseInt(scope.selectTd.dataset.row));
								break;
							default:
								break;
						};
						
						scope.selectTd = null;
						scope.$digest();
					});
					
					//合并单元格 
					//x轴起点  x轴终点  y轴起点  y轴终点
					function mergeCell(sX,eX,sY,eY){
						var i,j;
							
						for(i = sY;i <= eY; i++){
							for(j = sX;j <= eX; j++){
								if(i === sY && j === sX){
									scope.tr[i].td[j].show = true;
								}else{
									scope.tr[i].td[j].show = false;
									//清空其他单元格内容
									scope.tr[i].td[j].textContent = "";
								};
							}
						};
						
						//合并单元格
						scope.tr[sY].td[sX].colspan = eX - sX + 1;
						scope.tr[sY].td[sX].rowspan = eY - sY + 1;

					};
					
					//移除合并单元格信息
					function splitMergeMsg(col,row){
						var i = 0,len = scope.mergeMsg.length;
						for(i = 0;i < len;i++){
							if(scope.mergeMsg[i].col === col && scope.mergeMsg[i].row === row){
								scope.mergeMsg.splice(i,1);
								break;
							};
						};
					};
					
					//拆分单元格 
					function splitCell(col,row,colspan,rowspan){
						var i,j;
						
						//移除合并单元格信息
						splitMergeMsg(col,row);
						
						scope.tr[row].td[col].colspan = 1;
						scope.tr[row].td[col].rowspan = 1;
						
						for(i = row;i <= (row + rowspan); i++){
							for(j = col;j <= (col + colspan); j++){
								scope.tr[i].td[j].show = true;
							};
						};
					};
					
					//插入行,之前插入pointer为0,之后插入pointer为1
					function insertRow(pointer){
						var row = parseInt(scope.selectTd.dataset.row),
							_td = [];
						angular.copy(scope.td,_td);	
						
						//插入位置是否在第一组前,true显示,false隐藏
						var flag = (function(){
							if(row < scope.group[0][0]){
								return true;
							}else if(row === scope.group[0][0] && pointer === 0){
								return true;
							}else{
								return false;
							}
						})();
						
						//合并单元格 --> tbody th
						mergeTH(pointer,row,0);
						
						scope.tr.splice(row + pointer,0,{
							height : 30,
							td : _td,
							show : true,
							th : {
								op : 'row',
								name : '',
								show : flag,
								rowspan : 1
							}
						});
						
						//修改受影响的已合并单元格
						influence(0,0,row,pointer);
						//修改row之后的所有scope.mergeMsg
						changeMergeMsg('row',0,row + pointer);
						
						//修改group位置
						changeGroupRow(row,pointer,0);
					};
					
					//修改之后的所有scope.mergeMsg
					//type 'row' 行 'col' 列
					//rule 0 新增 1 删除
					//baseLine 基准线位置
					function changeMergeMsg(type,rule,baseLine){
						switch (rule){
							case 0 : 
								angular.forEach(scope.mergeMsg,function(item){
									if(item[type] >= baseLine){
										item[type] ++;
									};
								});
								break;
							case 1 : 
								angular.forEach(scope.mergeMsg,function(item){
									if(item[type] >= baseLine){
										item[type] --;
									};
								});
								break;
							default : 
								break;
						};
					};
					
					//合并单元格 --> tbody th  type 0添加 1删除
					function mergeTH(pointer,row,type){
						var i,len = scope.group[0].length;
						switch (pointer){
							case 0:
								//之前
								if(row > scope.group[0][0]){
									for(i=0;i < len;i++){
										if(row <= scope.group[0][i]){
											type === 0 ? scope.tr[scope.group[0][i-1]].th.rowspan ++ : scope.tr[scope.group[0][i-1]].th.rowspan --;
											break;
										};
									};
								};
								break;
							case 1:
								//之后
								if(row >= scope.group[0][0]){
									for(i=0;i < len;i++){
										if(row === scope.group[0][i]){
											type === 0 ? scope.tr[scope.group[0][i]].th.rowspan ++ : scope.tr[scope.group[0][i]].th.rowspan --;
											break;
										}else if(row < scope.group[0][i]){
											type === 0 ? scope.tr[scope.group[0][i-1]].th.rowspan ++ : scope.tr[scope.group[0][i-1]].th.rowspan --;
											break;
										};
									};	
								};
								break;
							default:
								break;
						};
					};
					
					//修改group位置 flag 0 插入 1 删除
					function changeGroupRow(row,pointer,flag){
						var i = 0,len = scope.group[0].length,changeFlag = false;
						for(;i < len;i ++){
							if(scope.group[0][i] >= (row + pointer)){
								flag === 0 ? scope.group[0][i] ++ : scope.group[0][i] --;
								//修改长度，若满足，只能修改第一个
								if(changeFlag === false){
									flag === 0 ? scope.group[2][i-1] ++ : scope.group[2][i-1] --;
									changeFlag = true;
								};
							};
						};
					};
					
					//插入列,之前插入pointer为0,之后插入pointer为1
					function insertCol(pointer){
						var col = parseInt(scope.selectTd.dataset.col);
						
						angular.forEach(scope.tr,function(item){
							item.td.splice(col + pointer,0,{
								active : '',
								textContent : '',
								colspan : 1,
								rowspan : 1,
								show : true
							});
						});
						
						//修改受影响的已合并单元格
						influence(1,0,col,pointer);
						//修改col之后的所有scope.mergeMsg
						changeMergeMsg('col',0,col+pointer);
					};
					
					//删除行、列,0为行,1为列
					function deleteCurrent(pointer){
						switch (pointer){
							case 0:
								var row = parseInt(scope.selectTd.dataset.row);
								
								//修改受影响的已合并单元格
								influence(0,1,row);
								
								//修改group位置
								changeGroupRow(row,pointer,1);
								//修改row之后的所有scope.mergeMsg
								changeMergeMsg('row',1,row);
								//合并单元格 --> tbody th
								mergeTH(pointer,row,1);
								
								scope.tr.splice(row,1);
								
								break;
							case 1:
								var col = parseInt(scope.selectTd.dataset.col);
								//修改受影响的已合并单元格
								influence(1,1,col);
								//修改row之后的所有scope.mergeMsg
								changeMergeMsg('col',1,col);
								angular.forEach(scope.tr,function(item){
									item.td.splice(col,1);
								});
								break;
							default:
								break;
						};
					};
					
					//判断新增、删除影响的行，列中是否存在合并的单元格 
					//pointer 0行 1列 type 0新增 1删除 rank行列值
					//insertRowType 0 之前插入行 1之后插入行
					//@return true 受影响  false 不受影响
					function influence(pointer,type,rank,insertRowType){
						var arr;
						switch(pointer){
							case 0 :
								arr = getMergeMsg('row','height',rank);
								if(arr.length > 0){
									switch (type){
										case 0:
											//修改scope.mergeMsg和scope.tr
											angular.forEach(arr,function(item){
												if(insertRowType === 0 && item.row === rank){
													//第一行之前添加 不作修改
												}else if(insertRowType === 1 && item.row+item.height-1 === rank){
													//最后一行之后添加 不作修改
												}else{
													//高度加1
													item.height ++;
													scope.tr[item.row].td[item.col].rowspan ++;
												};
											});
											break;
										case 1 : 
											//修改scope.mergeMsg和scope.tr
											angular.forEach(arr,function(item){
												if(item.row !== rank){
													//当所合并的单元格不在受影响的那行时 
													//高度减1
													item.height --;
													scope.tr[item.row].td[item.col].rowspan --;
												}else{
													//当所合并的单元格在受影响的那行时.
													//当高度大于1行时 合并下一行单元格
													if(item.height > 1){
														mergeCell(item.col,item.col+item.width-1,item.row+1,item.row+item.height-1);
														//移除原合并格信息
														splitMergeMsg(item.col,item.row);
														//加入合并单元格信息数组
														scope.mergeMsg.push({
															row : item.row,
															col : item.col,
															width : item.width,
															height : --item.height
														});
													};
												};
											});
											break;
										default:
											break;
									};
								};	
								break;
							case 1 :
								arr = getMergeMsg('col','width',rank);
								if(arr.length > 0){
									switch (type){
										case 0:
											//修改scope.mergeMsg和scope.tr
											angular.forEach(arr,function(item){
												if(insertRowType === 0 && item.col === rank){
													//第一列之前添加 不作修改
												}else if(insertRowType === 1 && item.col+item.width-1 === rank){
													//最后一列之后添加 不作修改
												}else{
													//宽度加1
													item.width ++;
													scope.tr[item.row].td[item.col].colspan ++;
												};
											});
											break;
										case 1: 
											//修改scope.mergeMsg和scope.tr
											angular.forEach(arr,function(item){
												if(item.col !== rank){
													//当所合并的单元格不在受影响的那列时 
													//宽度加1
													item.width --;
													scope.tr[item.row].td[item.col].colspan --;
												}else{
													//当所合并的单元格在受影响的那行时.
													//当高度大于1行时 合并下一行单元格
													if(item.width > 1){
														mergeCell(item.col+1,item.col+item.width-1,item.row,item.row+item.height-1);
														//移除原合并格信息
														splitMergeMsg(item.col,item.row);
														//加入合并单元格信息数组
														scope.mergeMsg.push({
															row : item.row,
															col : item.col,
															width : --item.width,
															height : item.height
														});
													};
												};
											});
											break;
										default:
											break;
									};
								};
								break;
							default:
								break;
						};
					};
					
					//获取影响的已合并单元格信息
					function getMergeMsg(type,length,rank){
						var _tmp=[];
						angular.forEach(scope.mergeMsg,function(item){
							if(rank >= item[type] && rank < (item[type] + item[length]) && item[length] !== 1){
								_tmp.push(item);
							};
						});
						
						return _tmp;
					};
					
					//隐藏显示组
					scope.groupShow = function(index){
						hideGroup(0,index);
					};
					
					//隐藏显示组,0为复选框选择,1为右键菜单选择
					function hideGroup(pointer,index){
						//row 行号, i group序号
						var row,i,j,len;
						
						switch(pointer){
							case 0 :
								row = scope.group[0][index];
								i = index;
								len = scope.group[2][i];
								break;
							case 1 : 
								row = index;
								i = scope.group[0].indexOf(row);
								len = scope.group[2][i];
								break;
							default :
								break;
						};
						
						scope.group[1][i].show = !scope.group[1][i].show;
						
						for(j = 0;j < len;j++){
							scope.tr[row ++].show = scope.group[1][i].show;
						};
						
						
					};
				}
			}
		}]);
})();
