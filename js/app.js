(function(){
	var app = angular.module('myApp',[]);
	app.run(['$templateCache',function($templateCache){
		$templateCache.put('tpl.html',
			'<div>'
				+ '<div>'
					+ '<label ng-click="groupShow($index)" ng-repeat="group in group[1]">'
						+ '{{group.name}}'
						+ '<span ng-class="{true:\'active\'}[group.show]">'
					+ '</label>'
				+ '</div>'
				+ '<div class="container">'
					+ '<table class="table">'
						+'<colgroup>'
							+'<col ng-repeat="col in col" style="width: {{col.width + \'px\'}};">'
						+ '</colgroup>'
						+'<thead>'
							+'<tr>'
								+'<th ng-repeat="th in th" data-op="{{th.op}}" data-index="{{$index}}">'
									+'{{th.title}}'
									+'<i class="moveWidth" data-index="{{$index}}" ng-hide="$index===0"></i>'	
								+'</th>'
							+'</tr>'
						+'</thead>'
						+'<tbody class="tbody">'
							+'<tr ng-repeat="tr in tr track by $index" ng-show="tr.show" style="height:{{tr.height + \'px\'}}">'
								+'<th data-row="{{$index}}" rowspan="{{tr.th.rowspan}}" ng-show="tr.th.show" data-op="{{tr.th.op}}">'
									+'{{tr.th.name}}'
									+'<i class="moveHeight" data-index="{{$index}}"></i>'	
								+'</th>'
								+'<td class="{{td.active}}" data-delete="{{tr.th.show}}" data-col="{{$index}}" data-row="{{$parent.$index}}" colspan="{{td.colspan}}" rowspan="{{td.rowspan}}" ng-show="td.show" ng-bind="td.textContent" ng-repeat="td in tr.td">'
								+'</td>'
							+'</tr>'
						+'</tbody>'
					+ '</table>'
					+ '<ul class="contextMenu" ng-show="contextMenu.show" style="left:{{contextMenu.position.left + \'px\'}};top:{{contextMenu.position.top + \'px\'}}">'
						+ '<li ng-repeat="menu in contextMenu.menu">'
							+'<button type="button" ng-disabled="menu.disable" data-id="{{menu.id}}" ng-bind="menu.name"></button>'
						+ '</li>'
					+ '</ul>'
				+ '</div>'
			+ '</div>'	
		);
	}]);
})();
	

