let chart = echarts.init(document.getElementById('container'));
let starFilter = document.getElementById('star');
let elementFilter = document.getElementById('element');
let weaponFilter = document.getElementById('weapon');
let amulet1 = document.getElementById('amulet1');
let amulet2 = document.getElementById('amulet2');

document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', update);
});
//var advIcons = {
//    'default': '/pic/1.png',
//};

var itemStyle = {
    normal: {
    },
    emphasis: {
        barBorderWidth: 1,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0,0,0,0.5)'
    }
};

var describe2adv = {};
var option = {
    legend: {
        data: ['attack','force_strike','skill_1','skill_2','skill_3','team_buff'],
        //data:[],
        selectedMode:true,
        top: '0%',
    },
    tooltip: {
        //trigger: 'axis',
        axisPointer: {
            type: 'shadow',
        },
        formatter: function(value){
            adv = describe2adv[value.data.advdps];
            r = adv.name;
            //r += value.seriesIndex%2;
            if(adv.condition && adv.condition!=' '){
                if(value.seriesIndex%2==1){
                    r+=' &lt;'+adv.condition.slice(1,-1)+'&gt;';
                }
            }
            r += '<br>';

            sname = value.seriesName;
            if(value.seriesIndex%2==1){
                for(var i in value.data){
                    v = value.data[i];
                    if(v){
                        if(v==0)continue;
                        if(i.slice(0,3)=='_c_')continue;
                        if(i == 'advdps')continue;
                        if(i == '_rightlabel')continue;
                        if(i == '__slider')continue;
                        if(i == sname)r+='->';
                        r += i+': '+v+'<br>';
                    }
                }
            }
            if(value.seriesIndex%2==0){
                for(var i in value.data){
                    v = value.data[i];
                    if(v){
                        if(v==0)continue;
                        if(i.slice(0,3)!='_c_')continue;
                        if(i == '_c_'+sname)r+='->';
                        r += i.slice(3) +': '+v+'<br>';
                    }
                }
            }
            v = value.data[i];
            return r;
        }
    },
    grid: {
        containLabel: true,
        left: '5%',
        right: '5%',
        top: '5%',
        bottom: '5%',
    },
    dataZoom: [{
        type: 'slider',
        right: '5%',
        top:'5%',
        yAxisIndex: [0],
        maxValueSpan: 12,
        showDetail: false,
        showDataShadow:false,
    }, ],
    xAxis: { 
    },
    yAxis: {
        type:'category',
        axisTick : {
            alignWithLabel: true,
        },
        axisLabel: {
            interval: 0,
            formatter: function(value){
                a = describe2adv[value];
                label = a.name + '(' + a.star + a.element + a.weapon + ')' ;
                stre = '(str: ' + a.stre + ')';
                condition = ''
                amulets = a.amulets+' ';

                comment = ''
                if(a.comment){
                    comment = a.comment;
                }
                //if(a.condition){
                //    condition = a.condition
                //}
                //return '{value|' + label + stre + amulets + '}{' + a.name + '| }\n{value|'+ comment +'}';
                //return '{value|' + label + stre + amulets + '}\n{value|'+comment+'}{' + a.name + '| }';
                //return '{value|' + label + stre + amulets + comment + '}{' + a.name + '| }';
                return '{value|' + label + stre + '}{' + a.name + '| }';
                //return '{value| }{' + a.name + '| }';
            },
            margin: 5,
            rich: {
            },
        },
    },
    dataset:{
        source: [
            {'advdps': 'Addis', 'x': 43.3, 's': 85.8, 'b': 93.7},
            {'advdps': 'b', 'x': 83.1, 's': 73.4, 'b': 55.1},
            {'advdps': 'c', 'x': 86.4, 's': 65.2, 'b': 82.5},
            {'advdps': 'd', 'x': 72.4, 's': 53.9, 'b': 39.1}
        ],
    },
    series: [
    ]
}
let characters = [];

function setData(data) {
    var tmpdata = [];
    var sp_slash = '\\'.charCodeAt()+128;
    var sp_cap = ':'.charCodeAt()+128;
    sp_slash = String.fromCharCode(sp_slash);
    sp_cap = String.fromCharCode(sp_cap);
    for(var i in data){
        if(data[i][0]=='dps'){ continue; }
        character = data[i]
        character.dps       = character[0];
        character.name      = character[1];
        character.star      = character[2];
        character.element   = character[3];
        character.weapon    = character[4];
        character.stre      = character[5];
        character.amulets   = character[6];
        character.condition = character[7];
        character.comment   = character[8];
        console.log(character.amulets)
        console.log(character.comment)
        var j = 9;
        character.details = {}
        while(1){
            if(j>=character.length) break;
            unit = character[j];
            if(!unit){continue;}
            if(typeof(unit)!='string'){continue;}
            unit = unit.replace('\\\\',sp_slash).replace('\\:',sp_cap);
            if(unit.search(':')!=-1){
                a = unit.split(':',2);
                a[0] = a[0].replace(sp_cap, ':').replace(sp_slash, '\\');
                a[1] = a[1].replace(sp_cap, ':').replace(sp_slash, '\\');
                character.details[a[0]] = parseInt(a[1]);
            }
            j+=1;
        }
        while(j-=1){
            delete(character[j]);
        }
        delete(character[0]);
        tmpdata.push(character);
    }

    tmpdata.sort((character1, character2) => {
        if (character1.dps > character2.dps) {
            return 1;
        }
        if (character1.dps <= character2.dps) {
            return -1;
        }
    });
    characters = tmpdata;
}

function sortData(data) {
    console.log('sort');
    op = chart.getOption();
    lg = op.legend[0].selected;
    console.log(lg);
    var filtered = {};
    for(var i in lg){
        filtered[i] = !lg[i]
    }
    for(var a in characters){
        var dps = 0;
        for(var i in characters[a].details){
            if(filtered[i]){
            }else{
                dps += characters[a].details[i];
            }
        }
        characters[a].dps = dps;
    }
    characters.sort((adv1 , adv2) => {
        if (adv1.dps > adv2.dps) {
            return 1;
        }
        if (adv1.dps <= adv2.dps) {
            return -1;
        }
    });
}


function create_describe(name, adv){
    return name + '(' + adv.star + adv.element + adv.weapon + ')' + adv.comment;
}

//var _dimensions = {__1:1,__2:2};
var _dimensions = {};
var datasrc = {};
var o_data = [];
var c_data = [];
function update() {
    let filtered = characters.filter(character => {
        if (starFilter.value && starFilter.value != character.star) {
            return false;
        }
        if (elementFilter.value && elementFilter.value != character.element) {
            return false;
        }
        if (weaponFilter.value && weaponFilter.value != character.weapon) {
            return false;
        }
                                     
var amulet = "[";
     if (amulet1.value)
     {
        amulet += amulate1.value;
     }

     if (amulet1.value + amulet2.value)
     {
        amulet += "+" + amulate2.value;
     }
     else if(amulet2.value)
     {
        amulet = amulet2.value;
     }

     amulet += "]";
     
     if(amulet.length > 2)
     {
         characters.amulets = amulet;
     }
            
        return true;
    });
    o_data = filtered;
    datasrc = {};
    c_data = {};
    var a = [];
    var lines = {};
    var line = {};
    var sp_slash = '\\'.charCodeAt()+128;
    var sp_cap = ':'.charCodeAt()+128;
    var describe = '';
    var rich = {
        value: {
            lineHeight: 30,
            //align: 'center'
        },
    };
    sp_slash = String.fromCharCode(sp_slash);
    sp_cap = String.fromCharCode(sp_cap);
    console.log(o_data);
    for(var i in o_data){
        var adv = o_data[i];
        lines[i] = {};
        line = lines[i];
        if(adv.name.slice(0,3)=='_c_'){c_data[i]=adv;continue;}
        for(var j in adv.details){
            line[j] = adv.details[j];
            line['_c_'+j] = adv.details[j]
            _dimensions[j] = 1;
        }
        name = adv.name;
        describe = create_describe(name, adv);
        line.advdps = describe;
        line._rightlabel = 1;
        datasrc[describe] = line;
        datasrc[describe].__slider = adv.dps;
        describe2adv[describe] = adv;
        advIcons[name] = picfolder+name+'.png';
        rich[adv.name] = {
            lineHeight: 0,
            height: 50,
            //align: 'center',
            backgroundColor:{
                image: advIcons[name]
            }
        };
    }

    for(var i in c_data){
        var adv = c_data[i];
        line = lines[i];
        for(var j in adv.details){
            line[j] = adv.details[j]
            _dimensions[j] = 1;
        }
        name = adv.name.slice(3);
        describe = create_describe(name, adv);

        // clean _c_ 
        for(var i in datasrc[describe]){
            if(i.slice(0,3) == '_c_'){
                datasrc[describe][i] = 0;
            }
        }
        // set _c_
        for(var i in line){
            datasrc[describe]['_c_'+i] = line[i];
        }
        describe2adv['_c_'+describe] = adv;
        //if(!datasrc[describe].condition){
        //    datasrc[describe].condition = adv.condition
        //}
        //if(!describe2adv[describe].condition){
        //    describe2adv[describe].condition = adv.condition;
        //}
    }

    for(var i in _dimensions){
        //if(i.slice(0,2)!='__'){
        //    option.legend.data.push(i);
        //}
        for(var l in datasrc){
            if(!datasrc[l][i]){
                datasrc[l][i] = null;
            }
            if(!datasrc[l]['_c_'+i]){
                datasrc[l]['_c_'+i] = null;
            }
        }
    }

    option.dataset.source = []
    for(var i in datasrc){
        option.dataset.source.push(datasrc[i]);
    }

    option.series = [];
    /**/
    s0 = {type:'bar',name:'slider',stack:'slider',encode:{x:'__slider',y:'advdps'}};
    s0.show = false;
    s0.animation = false;
    s0.barWidth = 0.01;
    s0.label = {
        normal: {
            show: true,
            //position: 'insideLeft',
            //position: 'top',
            position: [10,-13],
            formatter: params => {
                var a = describe2adv[params.name];
                var label = a.name + '(' + a.star + a.element + a.weapon + ')' ;
                var stre = '(str: ' + a.stre + ')';
                var condition = '';
                var amulets = a.amulets+' ';

                var comment = '';
                if(a.comment){
                    comment = a.comment;
                }

                var r = '';
                //r += label + stre ;
                r += amulets + comment;
                return r
            },
        },
    }
    s0.itemStyle = {color: '#2f4554'};
    option.series.push(s0);
    option.dataZoom[0].showDataShadow='__slider';
    /**/
    t1 = {
        type:'bar',
        name:'attack',
        stack:'dps',
        encode:{x:'attack',y:'advdps'},
        animation:false,
        //barWidth: 15,
        itemStyle:itemStyle,
        label: {
            normal: {
                show: true,
                position: 'insideLeft',
                formatter: params => {
                    a = describe2adv[params.name];
                    return a.condition;
                },
            },
            //notnormal: {
            //    show: true,
            //    position: 'top',
            //    formatter: params => {
            //        a = describe2adv[params.name];
            //        if(a.comment != null){
            //            return a.amulets + ' ' + a.comment
            //        }else{
            //            return a.amulets 
            //        }
            //    },
            //},
        },
    }
    t2 = {
        type:'bar',
        name:'attack',
        stack:'c_dps',
        encode:{x:'_c_attack',y:'advdps'},
        animation:false,
        //barWidth: 15,
        itemStyle:itemStyle,
    }
    option.series.push(t1);
    option.series.push(t2);

    for(var i in _dimensions){
        if(i == 'attack'){continue;}
        if(i == '_c_attack'){continue;}
        if(i == '__slider'){continue;}
        s1 = {type:'bar',name:i,stack:'dps',encode:{x:i,y:'advdps'}};
        s2 = {type:'bar',name:i,stack:'c_dps',encode:{x:'_c_'+i,y:'advdps'}};
        s1.animation = false;
        s1.itemStyle = itemStyle;
        s1.barGap = 0;
        //s1.barWidth = 30;
        s2.animation = false;
        s2.itemStyle = itemStyle;
        s2.barGap = -0.05;
        //s2.barWidth = 30;
        option.series.push(s1);
        option.series.push(s2);
    }
    
    t1 = {
        type:'bar',
        name:'_rightlabel',
        stack:'dps',
        encode:{x:'_rightlabel',y:'advdps'},
        animation:false,
        itemStyle:itemStyle,
        label: {
            normal: {
                show: true,
                position: 'right',
                formatter: params => {
                    a = describe2adv[params.name];
                    return a.dps;
                },
            },
        },
    }
    t2 = {
        type:'bar',
        name:'_rightlabel',
        stack:'c_dps',
        encode:{x:'_rightlabel',y:'advdps'},
        animation:false,
        itemStyle:itemStyle,
        label: {
            normal: {
                show: true,
                position: 'right',
                formatter: params => {
                    a = describe2adv['_c_'+params.name];
                    if(a)
                        return a.dps;
                    return '';
                },
            },
        },
    }
    option.series.push(t1);
    option.series.push(t2);


    option.yAxis.axisLabel.rich = rich;

    var slider = option.dataZoom[0];
    len = Object.keys(datasrc).length;
    slider.endValue = len - 1;
    slider.startValue = Math.max(slider.endValue - slider.maxValueSpan, 0);

    console.log(option);
    chart.setOption(option);
}

fetch('data.csv').then(response => response.text()).then(text => {
    let csv = Papa.parse(text, {
        //header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: ',',
        delimitersToGuess: [',']
    });

    setData(csv.data);
    update();
});

chart.on('legendselectchanged', function () {
    sortData();
    update();
});
