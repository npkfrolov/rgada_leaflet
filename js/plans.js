Vue.component('plans', {
    template: '#plansPanelTemplate',
    data: function(){
        return {
            items: [],
            searchQuery: "",
            periodQuery: undefined,
            activeItemNum: undefined,
            filterShown: false,
            itemsDateRange: {
                min: undefined,
                max: undefined
            }
        }
    },
    computed: {
        sortedItems: function(){
            var filteredItems = this.items,
                searchQuery = this.searchQuery.toLowerCase();

            if (this.searchQuery){
                filteredItems = filteredItems.filter(function(item){

                    var totalString = item.NumbCat.toLowerCase() + " " + item.ArchNumb.toLowerCase() + " " + item.Title.toLowerCase();                    
                    return (totalString.indexOf(searchQuery)>-1);

                }, this);
            }

            if (this.periodQuery){   

                filteredItems = filteredItems.filter(function(item){
                    var isMatched = false;

                    if ((item.DateLow && item.DateLow >= this.periodQuery[0] && item.DateLow <= this.periodQuery[1]) 
                        || (item.DateUpp && item.DateUpp >= this.periodQuery[0] && item.DateUpp <= this.periodQuery[1])) {
                        isMatched = true;
                    }

                    return isMatched;
                }, this);

            }

            return filteredItems.sort(function(a,b){
                if (parseInt(a.NumbCat) < parseInt(b.NumbCat)) return -1;
                if (parseInt(a.NumbCat) > parseInt(b.NumbCat)) return 1;
                return 0;
            })
        }
    },
    watch:{
        filterShown: function(value){
            if (!value) {
                this.periodQuery = undefined;
            } else {
                this.periodQuery = this.$refs.filter.period;
            }
        }
    },
    mounted: function(){
        var that = this;

        get_plans_data.then(function (data) {
            $(".object-list").removeClass("loading");
            that.items = plans_data;
            that.getItemsDateRange();
        });
    },
    methods: {
        activatePlan: function(plan){
            this.activeItemNum = plan.NumbCat;
            zoomAndShowPopup(plan);
        },
        getItemsDateRange: function(){
            var dateLowArray,
                dateUpArray,
                dateTotalArray;

            if (this.items.length){
                dateLowArray = this.items.map(function(item){
                    return item.DateLow;
                }).filter(function(item){
                    return item
                });

                dateUpArray = this.items.map(function(item){
                    return item.DateUpp;
                }).filter(function(item){
                    return item
                });

                dateTotalArray = dateLowArray.concat(dateUpArray);

                this.itemsDateRange = {
                    min: Math.min.apply(Math, dateTotalArray),
                    max: Math.max.apply(Math, dateTotalArray),
                }
            }
        }
    }
});

Vue.component('plans-list', {
    template: '#plansListTemplate',
    props: [
        "items",
        "activeItemNum"
    ],
    computed: {
        itemsComputed:  function(){
           return this.items.map(function(item){
                var date;
                if (item.DateUpp && item.DateLow){
                    date = item.DateLow + " – " + item.DateUpp;
                } else if (item.DateLow){
                    date = "позже " + item.DateLow;
                } else if (item.DateUpp){
                    date = "до " + item.DateUpp;
                }
                item.date = date;
                return item
           }); 
        } 
    },
    watch: {
        items: function(value){
            this.$el.scrollTop = 0;
        },
        activeItemNum: function(value){
            if (value && this.$refs[value][0])
                this.$el.scrollTop = this.$refs[value][0].offsetTop - (this.$el.clientHeight - this.$refs[value][0].offsetHeight)/2;
        }
    }
});

Vue.component('search', {
    template: '#searchTemplate',
    data: function(){
        return{
            searchQuery: ""
        }
    }
});

Vue.component('filter-panel', {
    template: '#filterPanelTemplate',
    props: [
        "periodRange"
    ],
    data: function(){
        return{
            period: [1500, 1700],
            periodControl: undefined,
            defaultPeriodRange:{
                min: 1500,
                max: 1700
            }
        }
    },
    computed: {
        periodRangeComputed: function(){            
            return {
                min: this.periodRange.min || this.defaultPeriodRange.min,
                max: this.periodRange.max || this.defaultPeriodRange.max
            }
        }
    },
    watch: {
        period: function(value){
            this.$emit("filter:changed", value)
        },
        periodRangeComputed: function(value){
            this.period = [value.min, value.max];
            if (this.$refs.periodControl) this.updateSlider(value);
        }
    },
    mounted: function(){
        var that = this,
            periodControlValue1 = document.getElementById('period-value-1'),
            periodControlValue2 = document.getElementById('period-value-2');

        noUiSlider.create(that.$refs.periodControl, {
            start: [that.periodRangeComputed.min, that.periodRangeComputed.max],
            connect: true,
            range: {
                'min': that.periodRangeComputed.min,
                'max': that.periodRangeComputed.max
            },
            step: 1
        });

        that.$refs.periodControl.noUiSlider.on('update', function( values, handle ) {
            var value = values[handle];
            if (handle) {
                periodControlValue2.innerHTML = Math.round(value);
            } else {
                periodControlValue1.innerHTML = Math.round(value);
            }
        });

        that.$refs.periodControl.noUiSlider.on('change', function( values, handle ) {
            that.period = values;
        });
    },
    methods: {
        updateSlider: function(range){
            var that = this;

            this.$refs.periodControl.noUiSlider.updateOptions({
                start: [that.period.min || range.min, that.period.max || range.max],
                range: {
                    'min': range.min,
                    'max': range.max
                }
            });
        }
    }
});

var vueApp = new Vue({ 
  el: '#vue-app'
});

