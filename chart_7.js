var ctx = document.getElementById('myChart');
var chartData={}

const EVENTSTART=moment('2021-01-12 12:00:00+09:00');
const EVENTEND=moment('2021-01-21 20:59:59+09:00');

function ChartData(rank) {
	if (rank<=20) {
		return [...chartData[rank].map((data)=>{return {x:data.date,y:data.points}}),{x:moment().isBefore(EVENTEND)?moment():chartData[rank][chartData[rank].length-1].date,y:chartData[rank][chartData[rank].length-1].points}]
	} else {
		return chartData[rank].map((data)=>{return {x:data.date,y:data.points}})
	}
}

Chart.defaults.global.elements.point.radius=0
fetch("http://www.projectdivar.com/eventdata/t20?all=true&event=7")
  .then(response => response.json())
  .then(data => data.map((obj)=>{if (chartData[obj.rank]) {chartData[obj.rank]=[...chartData[obj.rank],obj]} else {chartData[obj.rank]=[obj]}}))
  .then(()=>{
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				datasets: [{
					label: 'T1',
					data: ChartData(1),
					backgroundColor: [
						'rgba(255, 99, 132, 0.05)',
						'rgba(54, 162, 235, 0.05)',
						'rgba(255, 206, 86, 0.05)',
						'rgba(75, 192, 192, 0.05)',
						'rgba(153, 102, 255, 0.05)',
						'rgba(255, 159, 64, 0.05)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)'
					]
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
					backgroundColor: [
						'rgba(75, 192, 192, 0.05)'
					],
					borderColor: [
						'rgba(75, 192, 192, 1)'
					]
				},{
					label: 'T20',
					data: ChartData(20),
					backgroundColor: [
						'rgba(0, 0, 0, 0.05)'
					],
					borderColor: [
						'rgba(0, 0, 0, 1)'
					]
				},{
					label: 'T50',
					data: ChartData(50),
					backgroundColor: [
						'rgba(255, 255, 255, 0.5)'
					],
					borderColor: [
						'rgba(255, 255, 255, 1)'
					]
				}
				,{
					label: 'T100',
					data: ChartData(100),
					backgroundColor: [
						'rgba(150, 255, 150, 0.5)'
					],
					borderColor: [
						'rgba(150, 255, 150, 1)'
					]
				},{
					label: 'T500',
					data: ChartData(500),
					backgroundColor: [
						'rgba(160, 0, 0, 0.5)'
					],
					borderColor: [
						'rgba(160, 0, 0, 1)'
					]
				},{
					label: 'T1000',
					data: ChartData(1000),
					backgroundColor: [
						'rgba(255, 150, 150, 0.5)'
					],
					borderColor: [
						'rgba(255, 150, 150, 1)'
					]
				},{
					label: 'T5000',
					data: ChartData(5000),
					backgroundColor: [
						'rgba(0, 140, 0, 0.5)'
					],
					borderColor: [
						'rgba(0, 140, 0, 1)'
					]
				},{
					label: 'T10000',
					data: ChartData(10000),
					backgroundColor: [
						'rgba(30, 30, 255, 0.5)'
					],
					borderColor: [
						'rgba(30, 30, 255, 1)'
					]
				}/*,{
					label: 'T100 HAPPY FORTUNE NEW YEAR',
					data: [
						{x:moment('2021-01-12 12:00:00+09:00').add(0,'days').add(0,'hours'),y:0},
						{x:moment('2021-01-12 12:00:00+09:00').add(0,'days').add(7,'hours'),y:54036},
						{x:moment('2021-01-12 12:00:00+09:00').add(4,'days').add(23,'hours'),y:451398},
						{x:moment('2021-01-12 12:00:00+09:00').add(5,'days').add(3,'hours'),y:470204},
						{x:moment('2021-01-12 12:00:00+09:00').add(7,'days').add(18,'hours'),y:671150},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(15,'hours'),y:915147},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(17,'hours'),y:952330},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(19,'hours'),y:988548},
						{x:moment('2021-01-12 12:00:00+09:00').add(8,'days').add(21,'hours'),y:1027488},
					],
					backgroundColor: [
						'rgba(255, 255, 150, 0.5)'
					],
					borderColor: [
						'rgba(255, 255, 150, 1)'
					]
				}*/]
			},
			options: {
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
