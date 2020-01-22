import React from 'react';
import ReactDOM from 'react-dom';
import DayPicker from 'react-day-picker';
import dateFnsFormat from 'date-fns/format';
import addDays from 'date-fns/addDays';
import { parseISO, format } from 'date-fns'
import 'react-day-picker/lib/style.css';
import './index.css';

class App extends React.Component{
	constructor(props) {
		super(props);
		this.handleDayClick = this.handleDayClick.bind(this);
		this.state = {
			selectedDay: undefined,
			loaded:false, 
			tours:{}
		};
	}

	handleDayClick(day, { selected, disabled }) {
		if (disabled) {
		  // Day is disabled, do nothing
		  return;
		}
		//console.log("click, day = " + day);
		this.setState({ selectedDay: day });
		//console.log("clicking " + this.state.selectedDay);
		if(day !== undefined){
			return fetch('https://lawhome.case.edu/PortalUtilities/DrupalControls/GetVisitUsCalendarDay.aspx?date=' + day.toLocaleDateString())
			.then(results=>results.json())
			.then(info =>{
				//console.clear();
				//console.log("fetching " + day.toLocaleDateString());
				//console.log(info);
				// if(Array.isArray(info)) {
				// 	console.log("info isarray ")
				// }
				// console.log("const " +  info.constructor)
				this.setState({tours:info, loaded:true})
			})
			.catch(error =>
				this.setState({ error: error.message, loaded: false }),
			);		
		}
	}

	formatDate(string){
		var options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(string).toLocaleDateString('en-US',options);
	}

	render(){
		let past = {
			before: addDays(new Date(), 3),
		}
        return(
            <div>
				<DayPicker
					onDayClick={this.handleDayClick}
					selectedDays={this.state.selectedDay}
					disabledDays={[past, { daysOfWeek: [0, 6] }]}
				/>
				<div className="tour-list">{this.state.loaded && (this.state.tours.constructor === Array) ? (
					<div><h3>You selected {this.state.selectedDay.toLocaleDateString()}</h3>
						Tours available
						{this.state.tours.map((tour, i)=>{
							return(
								<div key={i.toString()}>
									<a href={"https://case.edu/law/admissions/jd-admissions/visit-us/schedule-visit/tour-registration?date=" + dateFnsFormat(parseISO(tour.start.dateTime), 'MMM. d yyyy h:mm a') + "&class=" + tour.summary}>{tour.summary}: {dateFnsFormat(parseISO(tour.start.dateTime), 'h:mm a')} - {dateFnsFormat(parseISO(tour.start.dateTime), 'h:mm a')}</a>
								</div>
							)
						})}
					</div>
				) : (
					(this.state.loaded ? (
						<div><h3>There are no tours available on {this.state.selectedDay.toLocaleDateString()}. Please select a different date.</h3></div>
					) : (
						<p>Please select a day.</p>
					)
				))}</div>
			</div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'))
