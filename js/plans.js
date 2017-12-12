Vue.component('plans', {
    template: '#plansPanelTemplate',
    data: function(){
        return {
            items: [],
            searchQuery: "",
            periodQuery: undefined,
            activeItemNum: undefined,
            filterShown: false
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
        });
    },
    methods: {
        activatePlan(plan){
            this.activeItemNum = plan.NumbCat;
            zoomAndShowPopup(plan);
        }
    }
});

Vue.component('plans-list', {
    template: '#plansListTemplate',
    props: [
        "items",
        "activeItemNum"
    ],
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
    data: function(){
        return{
            period: [1500, 1700]
        }
    },
    watch: {
        period: function(value){
            this.$emit("filter:changed", value)
        }
    },
    mounted: function(){
        var that = this,
            periodControl = document.getElementById('period-control'),
            periodControlValue1 = document.getElementById('period-value-1'),
            periodControlValue2 = document.getElementById('period-value-2');

        noUiSlider.create(periodControl, {
            start: that.period,
            connect: true,
            range: {
                'min': 1500,
                'max': 1700
            },
            step: 1
        });

        periodControl.noUiSlider.on('update', function( values, handle ) {
            var value = values[handle];
            if (handle) {
                periodControlValue2.innerHTML = Math.round(value);
            } else {
                periodControlValue1.innerHTML = Math.round(value);
            }
        });

        periodControl.noUiSlider.on('change', function( values, handle ) {
            that.period = values;
        });
    }
});

var vueApp = new Vue({ 
  el: '#vue-app'
});

