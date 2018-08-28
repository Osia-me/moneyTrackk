var budgetController = (function(){
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPerc = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value/ totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
		
	};

	Expense.prototype.getPerc = function(){
		return this.percentage;
	};


	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){

		var sum = 0;
		data.allItems[type].forEach(function(el){
			sum += el.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems:{
			expense:[],
			income:[]
		},
		totals: {
			expense:0,
			income:0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItemBudget: function(type, des, val){
			var newItem, ID;

			//Create new ID
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;	
			} else {
				ID = 0;
			}

			//Create new Item based on type
			if(type === 'expense'){
				newItem = new Expense(ID, des, val);
				} else {
					newItem = new Income(ID, des, val);
				}

			//Push it to the relevant array in data object
			data.allItems[type].push(newItem);	
			
			//Return the new Item
			return newItem;	
		},

		deleteItem: function(type, id){
			var index, ids;
			//id = 6;
			//data.allItems[type][id];
			//ids = [1 2 3 5 9]
			//index = 3
			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function(){
			//calculate total inc and exp
			calculateTotal('expense');
			calculateTotal('income');

			//calculate the budget: income - exp
			data.budget = data.totals.income - data.totals.expense;

			//calculate % of income that we spent
			if(data.totals.income > 0){
				data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
			} else {
				data.percentage = -1;
			}
			
	
		},

		calculatePercentages: function(){
			data.allItems.expense.forEach(function(current){
				current.calcPerc(data.totals.income);
			});
		},

		getPercentages: function(){
			var allPerc = data.allItems.expense.map(function(current){
				return current.getPerc();
			});
			return allPerc;
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.income,
				totalExp: data.totals.expense,
				percentage: data.percentage
			};
		},


		testing: function(){
			console.log(data);
		}
	};

})();

var uiController = (function(){
	var domStrings = {
		type: ".type",
		description: ".description",
		value: ".value",
		btn: ".btn",
		incomeContainer: ".income__list",
		expenseContainer: ".expenses__list",
		budgetLabel: "#balance",
		incomeLabel: "#income",
		expenseLabel: "#expense",
		condition: "#condition",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container-item",
		itemPercentageLabel: ".item__percentage",
		dateLabel: ".budget__title--month"	
	};

	var formatNumber = function(number, type){
       var numberSplit, int, dec, sign;

       	//+ or - before the number
        //exactly 2 decimal points 
        number = Math.abs(number);  
        number = number.toFixed(2);

        //comma separating the thousands
        numberSplit = number.split(".");
        int = numberSplit[0];
        	if(int.length > 3){
        	int = int.substr(0, int.length-3) + "," + int.substr(int.length-3, int.length); //input 2310, output 2,310
          } 
        dec = numberSplit[1];
        	
        	
        	return (type === "expense" ? sign = "-" : sign = "+") + " " + int + "." + dec;

        };

    var nodeListForEach = function(list, callback){
        for(var i =0; i <list.length; i++){
           	callback(list[i], i)
            	}
            };

	return {
		getDom: function(){
			return domStrings;
		},

		getInput: function(){
			return {
			type: document.querySelector(domStrings.type).value, //income or expense
			description: document.querySelector(domStrings.description).value,
			value: parseFloat(document.querySelector(domStrings.value).value)
			};
		},

		addListItem: function(obj, type){
			var html, newHtml, element;

			// Create html string with placeholder text
			if(type === "income"){
				element = domStrings.incomeContainer;

				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
					
			} else if(type === "expense"){
				element = domStrings.expenseContainer;

				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description% </div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}	

			//Replace the placeholder with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorId){

			var element = document.getElementById(selectorId);
			element.parentNode.removeChild(element);
		},

		clearFields: function(){
			var fields, fieldsArr;

			fields = document.querySelectorAll(domStrings.description + ', ' + domStrings.value);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, ind, arr){
				current.value = "";
			});
			fieldsArr[0].focus();

		},

		displayBudget: function(obj){

			var type;

			obj.budget > 0 ? type = "income" : type = "expense";

			document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "income");
			document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExp, "expense");
			
			if(obj.percentage > 0){
				document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + "%";
			} else {
				document.querySelector(domStrings.percentageLabel).textContent = "--%";
			};

        	if(obj.budget > 0){
        		document.querySelector(domStrings.condition).textContent = "positive :)";
        	} else {
        		document.querySelector(domStrings.condition).textContent = "negative :(";
        	};

		},

		displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(domStrings.itemPercentageLabel);

    
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        displayDate: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
        	var fields = document.querySelectorAll(
        		domStrings.type + "," +
        		domStrings.description + "," +
        		domStrings.value);

        	nodeListForEach(fields, function(cur){
        		cur.classList.toggle("red-focus");
        	});

        	document.querySelector(domStrings.btn).classList.toggle("red");

        },

        

		getDomStrings: function(){
			return domStrings;
		}
	}


})();


var generalController = (function(budgetCtrl, uiCtrl){

	var setupEventListeners = function(){
		var DOM = uiController.getDomStrings();

		document.querySelector(DOM.btn).addEventListener("click", ctrlAddInput);

		document.addEventListener("keypress", function(event) {
			if(event.keyCode === 13 || event.which === 13){
			ctrlAddInput();
			}
		});

		document.querySelector(DOM.container).addEventListener("click", crtlDeleteInput);

		document.querySelector(DOM.type).addEventListener("change", uiCtrl.changedType);
	};


	var updateBudget = function(){

		//1. Calculate  the budget
		budgetCtrl.calculateBudget();

		//2. Return the budget
		var budget = budgetController.getBudget();

		//3. Display the budget
		uiCtrl.displayBudget(budget);

	};

	var updatePercentages = function() {
		//1. Calculate percentages
		budgetCtrl.calculatePercentages();

		//2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		
		//3. Update UI with new percentages
		uiCtrl.displayPercentages(percentages);
	};

	var ctrlAddInput = function(){
		var newItem, input;

		//1. get the filed input data
		input = uiCtrl.getInput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
		
			//2. add the item to the budget controller
			newItem = budgetController.addItemBudget(input.type, input.description, input.value);
		
			//3. add a new item to ui 
			uiCtrl.addListItem(newItem, input.type);
		
			//4. Clear the fields
			uiCtrl.clearFields();

			//5. Calculate and update Budget
			updateBudget();

			//6. Calculate and update percetages
			updatePercentages();

		}

	};

	var crtlDeleteInput = function(event){
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID){
			//split element into array with split method;
			splitID = itemID.split("-");
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1. Delete the item from data
				budgetCtrl.deleteItem(type, ID);
			//2. Delete the item from UI
				uiCtrl.deleteListItem(itemID);
			//3. Update and show new budget
				updateBudget();
			//4. Calculate and update percetages
				updatePercentages();
		}
	};

	return {
		init: function(){
			var DOM = uiController.getDomStrings();

			console.log("Application has started!");
			uiCtrl.displayDate();
			uiCtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
			document.querySelector(DOM.condition).textContent = " 0.00";
		}
	};

	

})(budgetController, uiController);

generalController.init();