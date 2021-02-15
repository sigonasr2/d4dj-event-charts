var ctx = document.getElementById('myChart');
var chartData={}
var predictionChartData={}

const EVENTSTART=moment('2021-02-05 12:00:00+09:00');
const EVENTEND=moment('2021-02-12 20:59:59+09:00');

var diffData=[]

const PREDICTIONS=true

var defaultLegendClickHandler = Chart.defaults.global.legend.onClick;
var newLegendClickHandler = function (e, legendItem) {
    var index = legendItem.datasetIndex;
	

	let ci = this.chart;
	//console.log(Number(ci.data.datasets[index].label))
	[
		ci.getDatasetMeta(index),
		ci.getDatasetMeta(index+1)
	].forEach(function(meta) {
		if (ci.data.datasets[index+1].label.includes("Prediction")) {
			meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
		} else {
			if (meta===ci.getDatasetMeta(index)) {
				ci.data.datasets[index].hidden=!ci.data.datasets[index].hidden
			}
		}
	});
	ci.update();
};

function ChartData(rank) {
	if (!chartData[rank]) {
		return [{x:0,y:0}]
	}
	if (rank<=20) {
		return [...chartData[rank].map((data)=>{return {x:data.date,y:data.points}}),{x:moment().isBefore(EVENTEND)?moment():EVENTEND,y:chartData[rank][chartData[rank].length-1].points}]
	} else {
		return [{x:EVENTSTART,y:0},...chartData[rank].map((data)=>{return {x:data.date,y:data.points}})]
	}
}

function GetRank(rank) {
	if (chartData[rank]) {
		return chartData[rank][chartData[rank].length-1].points
	} else {
		return "???"
	}
}

//var tiers= [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,50,100,500,1000,2000,5000,10000,20000]

const nyoomfactor={//Percentage of original speed to use when nyoom'ing
	1:1.0,
	2:1.0,
	3:1.0,
	4:1.0,
	5:1.0,
	6:1.0,
	7:1.0,
	8:1.0,
	9:1.0,
	10:1.0,
	11:1.0,
	12:0.9,
	13:0.7,
	14:0.5,
	15:0.3,
	16:0.3,
	17:0.3,
	18:0.3,
	19:0.3,
	20:0.3,
	50:1.0,
	100:0.9,
	500:0.3,
	1000:0.2,
	2000:0.14,
	5000:0.1,
	10000:0.06,
	20000:0.04
}

const slowdownFactor={//Percentage of slowdown per hour.
	1:0.00001,
	2:0.00003,
	3:0.00003,
	4:0.00005,
	5:0.00005,
	6:0.00005,
	7:0.00005,
	8:0.00005,
	9:0.00005,
	10:0.00005,
	11:0.00005,
	12:0.00006,
	13:0.00007,
	14:0.00008,
	15:0.00009,
	16:0.0001,
	17:0.0001,
	18:0.0001,
	19:0.0001,
	20:0.0001,
	50:0.0002,
	100:0.0003,
	500:0.0004,
	1000:0.0005,
	2000:0.0007,
	5000:0.001,
	10000:0.002,
	20000:0.003
}

var MAXSPEED=0

function SetupPredictionModel() {
	if (chartData['1'].length>100) {
		MAXSPEED=Math.floor(chartData['1'][100].points/(moment(chartData['1'][100].date).diff(EVENTSTART,'minutes')/60))
	}
}

function CreatePrediction(precision,rank) {
	var startPoint=chartData[rank][chartData[rank].length-1]
	if (rank<=20) {
		startPoint={points:startPoint.points,date:moment()}
	}
	var startTime=moment(startPoint.date)
	if (PREDICTIONS&&startTime.diff(EVENTSTART,'hours')>24) {
		//console.log(MAXSPEED)
		//Precision is in hours. 1 is default
		var finalChart=[{y:chartData[rank][chartData[rank].length-1].points,x:chartData[rank][chartData[rank].length-1].date}]
		//Start from the time of the last reported rank.
		var myPoints = startPoint.points
		var pointSpeed = GetRank(rank)/(moment(startPoint.date).diff(EVENTSTART,'minutes')/60)
		var speedGoal = MAXSPEED*nyoomfactor[rank]
		while (startTime<EVENTEND) {
			startTime.add(precision,'hours')
			myPoints+=Math.floor(pointSpeed)
			if (EVENTEND.diff(startTime,'hours')>8) {
				pointSpeed-=pointSpeed*(slowdownFactor[rank]*5/*CONSTANT for adjustment*/)
			} else {
				pointSpeed+=(speedGoal-pointSpeed)/5 //Increase towards final goal.
				console.log(pointSpeed)
			}
			finalChart=[...finalChart,{y:myPoints,x:moment(startTime)}]
		}
		predictionChartData[rank]=finalChart
		return finalChart
	} else {
		return []
	}
}

async function GetDiffData(rank1,rank2) {
	for (var i=0;i<chartData[rank1].length;i++) {
		diffData[i]=GetClosestPoint(rank2,i,chartData[rank1][i].date)
		.then((response)=>{
			return response[0].then((data)=>{
				//console.log(data[0].points)
				return {y:chartData[rank1][response[1]].points-data[0].points,x:chartData[rank1][response[1]].date}
			})
		})
		.catch((err)=>{
			return {y:0,x:0}
		})
		await new Promise(r => setTimeout(r, 10));
	}
}

function GetClosestPoint(rank,i,date) {
	return fetch("http://www.projectdivar.com/eventdata/t20?date="+encodeURI(date)+"&rank="+rank)
	.then(response => [response.json(),i])
	.catch((err)=>{
		return [{points:0},i]
	})
}
document.getElementsByClassName('time')[0].innerHTML=(moment().isAfter(EVENTEND))?EVENTEND.diff(EVENTSTART,'hours')+1:moment().diff(EVENTSTART,'hours')

var extraData = []
var extraData2 = []

Chart.defaults.global.elements.point.radius=0
/*fetch("http://www.projectdivar.com/eventdata/t20?tier=100&event=7")
  .then(response => response.json())
  .then(data => data.map((obj)=>{extraData=[...extraData,obj]}))
  .then(()=>fetch("http://www.projectdivar.com/eventdata/t20?tier=500&event=7"))
  .then(response => response.json())
  .then(data => data.map((obj)=>{extraData2=[...extraData2,obj]}))
  .then(()=>fetch("http://www.projectdivar.com/eventdata/t20?all=true&event=8"))*/
 fetch("http://www.projectdivar.com/eventdata/t20?all=true&event=9")
  .then(response => response.json())
  .then(data => data.map((obj)=>{if (chartData[obj.rank]) {chartData[obj.rank]=[...chartData[obj.rank],obj]} else {chartData[obj.rank]=[obj]}
  }))
  /*.then(()=>GetDiffData(1,2))
  .then(()=>Promise.all(diffData))*/
  .then((values)=>{
		SetupPredictionModel()
		//console.log(values)
		var tiers= [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,50,100,500,1000,2000,5000,10000,20000]
		for (t of tiers) {
			CreatePrediction(1,t)
			var fields = document.getElementsByClassName('points'+t)
			var fields2 = document.getElementsByClassName('points'+t+'rate')
			if (fields.length>0) {
				if (predictionChartData[t]) {
					fields[0].innerHTML=GetRank(t)+"<sub> / "+predictionChartData[t][predictionChartData[t].length-1].y+"</sub>"
				} else {
					fields[0].innerHTML=GetRank(t)+"<sub> / ???</sub>"
				}
			}
			if (fields2.length>0) {
				//console.log(EVENTSTART.diff(moment(),'minutes'))
				fields2[0].innerHTML=Math.ceil(GetRank(t)/(moment().diff(EVENTSTART,'minutes')/60))+"/hr"
			}
		}
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				datasets: [{
					label: 'T1',
					data: ChartData(1),
					backgroundColor: 'rgba(255, 99, 132, 0.05)',
					borderColor: 'rgba(255, 99, 132, 1)'
				},{
					label: 'T1 (Prediction)',
					data: predictionChartData[1],
					backgroundColor: 'rgba(255, 99, 132, 0)',
					borderColor: 'rgba(255, 99, 132, 0.5)',
					borderDash:[15,5]
					/*pointBorderColor: 'rgba(60,60,60,0.5)',
					pointStyle:'dash',
					pointRadius: 1*/
				},{
					label: 'T2',
					data: ChartData(2),
					backgroundColor: [
						'rgba(54, 162, 235, 0.05)'
					],
					borderColor: [
						'rgba(54, 162, 235, 1)'
					]
				},{
					label: 'T3',
					data: ChartData(3),
					backgroundColor: [
						'rgba(255, 206, 86, 0.05)',
					],
					borderColor: [
						'rgba(255, 206, 86, 1)',
					]
				},{
					label: 'T4',
					data: ChartData(4),
					backgroundColor: [
						'rgba(75, 192, 192, 0.05)',
					],
					borderColor: [
						'rgba(75, 192, 192, 1)',
					]
				},{
					label: 'T5',
					data: ChartData(5),
					backgroundColor: [
						'rgba(153, 102, 255, 0.05)',
					],
					borderColor: [
						'rgba(153, 102, 255, 1)',
					]
				},{
					label: 'T6',
					data: ChartData(6),
					backgroundColor: [
						'rgba(255, 159, 64, 0.05)'
					],
					borderColor: [
						'rgba(255, 159, 64, 1)'
					]
				},{
					label: 'T7',
					data: ChartData(7),
					backgroundColor: [
						'rgba(255, 99, 132, 0.05)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)'
					]
				},{
					label: 'T8',
					data: ChartData(8),
					backgroundColor: [
						'rgba(54, 162, 235, 0.05)'
					],
					borderColor: [
						'rgba(54, 162, 235, 1)'
					]
				},{
					label: 'T9',
					data: ChartData(9),
					backgroundColor: [
						'rgba(255, 206, 86, 0.05)'
					],
					borderColor: [
						'rgba(255, 206, 86, 1)'
					]
				},{
					label: 'T10',
					data: ChartData(10),
					backgroundColor: 'rgba(75, 192, 192, 0.05)',
					borderColor: 'rgba(75, 192, 192, 1)'
				},{
					label: 'T10 (Prediction)',
					data: predictionChartData[10],
					backgroundColor: 'rgba(75, 192, 192, 0)',
					borderColor: 'rgba(75, 192, 192, 0.5)',
					borderDash:[15,5]
					/*pointBorderColor: 'rgba(60,60,60,0.5)',
					pointStyle:'dash',
					pointRadius: 1*/
				},{
					label: 'T20',
					data: ChartData(20),
					backgroundColor: 'rgba(0, 0, 0, 0.05)',
					borderColor: 'rgba(0, 0, 0, 1)'
					/*pointBorderColor: 'rgba(60,60,60,0.5)',
					pointStyle:'dash',
					pointRadius: 1*/
				},{
					label: 'T20 (Prediction)',
					data: predictionChartData[20],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 'rgba(0, 0, 0, 0.4)',
					borderDash:[15,5]
					/*pointBorderColor: 'rgba(60,60,60,0.5)',
					pointStyle:'dash',
					pointRadius: 1*/
				},{
					label: 'T50',
					data: ChartData(50),
					backgroundColor: 'rgba(255, 255, 255, 0.5)',
					pointBackgroundColor: 'rgba(255, 255, 255, 1)',
					pointBorderColor: 'black',
					borderColor: 'rgba(255, 255, 255, 1)',
					pointRadius: 2
				},{
					label: 'T50 (Prediction)',
					data: predictionChartData[50],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 'rgba(255, 255, 255, 0.5)',
					borderDash:[15,5]
				}
				/*,{
					label: 'T50 (First Part)',
					data: extraData.map((data)=>{return {x:moment(data.date).add(12,'d'),y:data.points}}),
					backgroundColor: [
						'rgba(0, 255, 255, 0.5)'
					],
					borderColor: [
						'rgba(0, 255, 255, 1)'
					]
				}*/,{
					label: 'T100',
					data: ChartData(100),
					backgroundColor: 'rgba(150, 255, 150, 0.5)',
					pointBackgroundColor: 'rgba(150, 255, 150, 1)',
					pointBorderColor: 'black',
					borderColor: 'rgba(150, 255, 150, 1)',
					pointRadius: 2
				},{
					label: 'T100 (Prediction)',
					data: predictionChartData[100],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 'rgba(150, 255, 150, 0.5)',
					borderDash:[15,5]
				}/*,{
					label: 'T100 (First Part)',
					data: extraData.map((data)=>{return {x:moment(data.date).add(12,'d'),y:data.points}}),
					backgroundColor: 'rgba(255, 150, 0, 0.5)',
					borderColor: 'rgba(255, 150, 0, 1)',
					pointBorderColor: 'black',
					pointRadius: 2
				}*/,{
					label: 'T500',
					data: ChartData(500),
					backgroundColor: 
						'rgba(160, 0, 0, 0.5)',
					pointBackgroundColor: 
						'rgba(160, 0, 0, 1)',
					pointBorderColor: 'black',
					borderColor: 
						'rgba(160, 0, 0, 1)',
					pointRadius: 2
				},{
					label: 'T500 (Prediction)',
					data: predictionChartData[500],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 
						'rgba(160, 0, 0, 0.5)',
					borderDash:[15,5]
				}/*,{
					label: 'T500 (First Part)',
					data: extraData2.map((data)=>{return {x:moment(data.date).add(12,'d'),y:data.points}}),
					backgroundColor: 
						'rgba(65, 60, 0, 0.5)',
					borderColor: 
						'rgba(65, 60, 0, 1)',
					pointBorderColor: 'black',
					pointRadius: 2
				}*/,{
					label: 'T1000',
					data: ChartData(1000),
					backgroundColor: 
						'rgba(255, 150, 150, 0.5)',
					pointBackgroundColor: 
						'rgba(255, 150, 150, 1)',
					pointBorderColor: 'black',
					borderColor: 
						'rgba(255, 150, 150, 1)',
					pointRadius: 2
				},{
					label: 'T1000 (Prediction)',
					data: predictionChartData[1000],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 
						'rgba(255, 150, 150, 0.5)',
					borderDash:[15,5]
				},{
					label: 'T2000',
					data: ChartData(2000),
					backgroundColor: 
						'rgba(220, 220, 0, 0.5)',
					pointBackgroundColor: 
						'rgba(220, 220, 0, 1)',
					pointBorderColor: 'black',
					borderColor: 
						'rgba(220, 220, 0, 1)',
					pointRadius: 2
				},{
					label: 'T2000 (Prediction)',
					data: predictionChartData[2000],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 
						'rgba(220, 220, 0, 0.5)',
					borderDash:[15,5]
				},{
					label: 'T5000',
					data: ChartData(5000),
					backgroundColor: 
						'rgba(0, 140, 0, 0.5)',
					pointBackgroundColor: 
						'rgba(0, 140, 0, 1)',
					pointBorderColor: 'black',
					borderColor: 
						'rgba(0, 140, 0, 1)',
					pointRadius: 2
				},{
					label: 'T5000 (Prediction)',
					data: predictionChartData[5000],
					backgroundColor: 
						'rgba(160, 0, 0, 0)',
					borderColor: 
						'rgba(0, 140, 0, 0.5)',
					borderDash:[15,5]
				}/*,{
					label: 'T10000 (Last Event)',
					data: extraData.map((data)=>{return {x:moment(data.date).add(12,'d'),y:data.points}}),
					backgroundColor: 
						'rgba(30, 30, 255, 0.5)',
					pointBackgroundColor: 
						'rgba(30, 30, 255, 1)',
					pointBorderColor: 'black',
					borderColor: 
						'rgba(30, 30, 255, 1)',
					pointRadius: 2
				}*/,{
					label: 'T10000',
					data: ChartData(10000),
					backgroundColor: 'rgba(30, 30, 255, 0.5)',
					pointBackgroundColor: 'rgba(30, 30, 255, 1)',
					pointBorderColor: 'black',
					borderColor: 'rgba(30, 30, 255, 1)',
					pointRadius: 2
				},{
					label: 'T10000 (Prediction)',
					data: predictionChartData[10000],
					backgroundColor: 'rgba(30, 30, 255, 0)',
					borderColor: 'rgba(30, 30, 255, 0.5)',
					borderDash:[15,5]
				},{
					label: 'T20000',
					data: ChartData(20000),
					backgroundColor: 
						'rgba(0, 0, 60, 0.5)',
					pointBackgroundColor: 
						'rgba(0, 0, 60, 1)',
					pointBorderColor: 'black',
					borderColor: 
						'rgba(0, 0, 60, 1)',
					pointRadius: 2
				},{
					label: 'T20000 (Prediction)',
					data: predictionChartData[20000],
					backgroundColor: 'rgba(30, 30, 255, 0)',
					borderColor: 
						'rgba(0, 0, 60, 0.5)',
					borderDash:[15,5]
				},/*{
					label: 'T1 vs T2',
					data: values,
					backgroundColor: 
						'rgba(30, 30, 255, 0.5)',
					borderColor: 
						'rgba(30, 30, 255, 1)'
					]
				},{
					label: 'T100 HAPPY FORTUNE NEW YEAR',
					data: 
						{x:moment('2021-01-12 12:00:00+09:00').add(0,'days').add(0,'hours'),y:0},
						{x:moment('2021-01-12 12:00:00+09:00').add(0,'days').add(7,'hours'),y:54036},
						{x:moment('2021-01-12 12:00:00+09:00').add(4,'days').add(23,'hours'),y:451398},
						{x:moment('2021-01-12 12:00:00+09:00').add(5,'days').add(3,'hours'),y:470204},
						{x:moment('2021-01-12 12:00:00+09:00').add(7,'days').add(18,'hours'),y:671150},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(15,'hours'),y:915147},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(17,'hours'),y:952330},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(19,'hours'),y:988548},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(21,'hours'),y:1027488},,
					backgroundColor: 
						'rgba(255, 255, 150, 0.5)',
					borderColor: 
						'rgba(255, 255, 150, 1)'
					]
				}*/]
			},
			options: {
				legend:{
					onClick: newLegendClickHandler,
					labels:{
						boxWidth:20,
						filter:(item,data)=>!item.text.includes("Prediction")
					}
				},
				tooltips: {
					callbacks: {

						title: function(tooltipItem, data) {
							//console.log(JSON.stringify(tooltipItem))
							//var title = data.datasets[tooltipItem.datasetIndex].label || '';
							/*
							[{"xLabel":"2021-01-25T05:42:58.214Z","yLabel":1148478,"label":"2021-01-25T05:42:58.214Z","value":"1148478","index":615,"datasetIndex":0,"x":108.39772118267871,"y":99.4803316356776}]
							*/
							return moment(tooltipItem[0].xLabel);
						},
						label: function(tooltipItem, data) {
							var label = data.datasets[tooltipItem.datasetIndex].label || '';

							if (label) {
								label += '   ';
							}
							label += tooltipItem.yLabel+" Pt";
							return label;
						},
						footer: function(tooltipItem, data) {
							return Math.ceil(Number(tooltipItem[0].yLabel)/(moment(tooltipItem[0].xLabel).diff(EVENTSTART,'minutes')/60))+"/hr";
						}
					}
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
						}
					}],
					xAxes: [{
						type: 'time',
						time: {
							unit: 'hours',
							displayFormats: {
								hours: 'MMM D hA'
							}
						},
						bounds:'ticks',
						ticks: {
							min:EVENTSTART,
							max:EVENTEND
						},
						distribution: 'linear'
					}]
				}
			}
		})
  })
