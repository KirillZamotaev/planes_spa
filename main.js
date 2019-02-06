(function(){
	
const heads = [
'Координаты самолета',
'Cкорость',
'Курс',
'Высота полета самолета',
'Код аэропорта вылета ',
'Код аэропорта назначения',
'Номер рейса',];

const dataSource =  'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48';


const DOMODEDOVO = [55.410307, 37.902451];

const latlng2distance = function(lat1, long1, lat2, long2){
     
    var R = 6372795;
     
    lat1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    long1 *= Math.PI / 180;
    long2 *= Math.PI / 180;
     
    var cl1 = Math.cos(lat1);
    var cl2 = Math.cos(lat2);
    var sl1 = Math.sin(lat1);
    var sl2 = Math.sin(lat2);
    var delta = long2 - long1;
    var cdelta = Math.cos(delta);
    var sdelta = Math.sin(delta);
    
    var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
    var x = sl1 * sl2 + cl1 * cl2 * cdelta;
    var ad = Math.atan2(y, x);
    var dist = ad * R;  
    return dist
}


if(typeof window ==="object" && window !==null){
	
	
	var App =  function(){
		
		//управление из объекта Window//
		window.App = this;
		
		
		this.constructor = function(){
		
			this.state = {
				data:null,
				loading: false,
				error: false,
				showDistance: false
			}
			this.loadData = this.loadData.bind(this);
			this.measureDistance = this.measureDistance.bind(this);
			this.getDistance = this.getDistance.bind(this);
			this.toggleDistance = this.toggleDistance.bind(this);
		}
		
		
		this.setState = function(newState){
			
			let prevState = this.state;
			
			 
			
			let state = Object.assign({}, prevState, newState)
			  
			this.state = state;
			
			this.render();
		}

		
		
		
		this.getDistance = function (point){
			return latlng2distance(point[1], DOMODEDOVO[0],point[2], DOMODEDOVO[1]) 
			 
		}
		
		this.convertToKM = function (val){
			return (val/1000).toFixed(0);
		}
		this.measureDistance= function (a,b){

			 let distanceA =  this.getDistance(a);
			 let distanceB = this.getDistance(b);
			 
			 if(distanceA < distanceB) return -1;
			 if(distanceA > distanceB) return 1;
		} 
		
		this.loadData = function(){
			let _this = this;
			let url = dataSource;
			
			let preloader = setTimeout(()=>{_this.setState({loading :true, data: this.state.data});}, 200);
			
			
			
			fetch(url, {method: "GET"}).then(response=>{
				 
				return response.json();
				}).then(data=> {
					clearTimeout(preloader);
					this.state.loading = false;
					
					let dataArray =[];
					for(key in data){
						if(data[key] instanceof Object && data[key] !==null ){
							dataArray.push(data[key])
						} else{
							this.state[key] = data[key]
						}
						
					}
					 
					dataArray.sort(_this.measureDistance);
					
					_this.setState({data:dataArray});
					
					
					setTimeout(()=>{this.loadData()}, 3000)
				
				}).catch(err=> {
					_this.setState({error : true}); 
					console.error(err)
				});
			
		} 
		
		this.mounted = function(){ 
			this.loadData(); 
		}
		
		this.toggleDistance = function (){
			this.setState({showDistance: !this.state.showDistance})
		}
		
		this.render = function(){  
			let _this = this;
			let {data, showDistance} =this.state;
			
			let tableTemplate = ` 
			<div class="app">
				<button class="show-distance ${ showDistance ? 'active' : ''}" onClick="App.toggleDistance()">Показать расстояние до Домодедово</button>
				<table id="table-airports">
					<tr>
					${
						heads.map((el, index) =>{
							return (`<th>${el}</th>`);
						}).join('')
						
					} 
					${ showDistance
									? `<th>Расстояние до Домодедово</th>`
									: ''
					}
					</tr>
					
					${data instanceof Array 
						?
						data.map((plane, index)=>{
							return (`
							<tr>
								<td>${plane[1]}°, ${plane[2]}°</td>
								<td>${plane[3]} км/ч</td>
								<td>${plane[2]}°</td>
								<td>${plane[6]}  м</td>
								<td>${plane[11]}</td>
								<td>${plane[12]}</td>
								<td>${plane[0]}</td>
								${
									showDistance
									? `<td>${_this.convertToKM(_this.getDistance(plane))} км</td>`
									: ''
								}
							</tr>
							`);
						}).join('') 
						:''
					}					
				</table>
				${this.state.loading? `<div class="preloader">Загрузка..</div>`: ''}
			</div>
				`;

			
			 let root = document.querySelector('#root');
			 
			 if(root!==undefined){
				root.innerHTML = tableTemplate;
			 }
			 
		}
		 
		
		this.constructor();
		this.render();
		this.mounted();
		
	}

	 return new App;
	};
})()