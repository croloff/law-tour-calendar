import React from 'react';
import ReactDOM from 'react-dom';
import DayPicker from 'react-day-picker';
import dateFnsFormat from 'date-fns/format';
import addDays from 'date-fns/addDays';
import { parseISO, format } from 'date-fns';
import { formatToTimeZone } from 'date-fns-timezone';
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
            <div class="container-fluid">
				<div class="row no-margin">
					<div class="col-xs-12 col-sm-6 calendar-column">
						<DayPicker
							onDayClick={this.handleDayClick}
							selectedDays={this.state.selectedDay}
							disabledDays={[past, { daysOfWeek: [0, 6] }]}
						/>
					</div>
					<div className="col-xs-12 col-sm-6 tour-list">{this.state.loaded && (this.state.tours.constructor === Array) ? (
						<div><h3>You selected {dateFnsFormat(this.state.selectedDay, 'MMM d, yyyy')}</h3>
							Tours available (all time EST)
							{this.state.tours.map((tour, i)=>{
								var no_link = false;
								var custom_link = "";
								var custom_link_length = 0;
								if (tour.description) {
									//urlstart = "yes"
									//console.log("has desc");
									//console.log(tour.description.match(/href="([^"]*)/).length);
									if (tour.description === "NO LINK" || tour.description === "no link") {
										no_link = true;
										//console.log("no link on this one");
									}
									if (tour.description.match(/href="([^"]*)/) && tour.description.match(/href="([^"]*)/).length === 2) {
										//console.log("includes href");
										custom_link = tour.description.match(/href="([^"]*)/)[1];
										//console.log(custom_link);
										custom_link_length = custom_link.length;
									}
								} else {
									//console.log("no desc");
								}
								
								return(
									<div className="tour" key={i.toString()}>
										{no_link ? (
											tour.summary
										) : (
											(custom_link_length > 1 ? (
												<a href={custom_link}>{tour.summary}: {formatToTimeZone(parseISO(tour.start.dateTime), 'h:mm a', { timeZone: 'America/New_York' })} - {formatToTimeZone(parseISO(tour.end.dateTime), 'h:mm a', { timeZone: 'America/New_York' })}</a>
											) : (
												<a href={"https://case.edu/law/admissions/jd-admissions/visit-us/schedule-visit/tour-registration?date=" + formatToTimeZone(parseISO(tour.start.dateTime), 'MMM. d YYYY h:mm a', { timeZone: 'America/New_York' }) + "&class=" + tour.summary}>{tour.summary}: {formatToTimeZone(parseISO(tour.start.dateTime), 'h:mm a', { timeZone: 'America/New_York' })} - {formatToTimeZone(parseISO(tour.end.dateTime), 'h:mm a', { timeZone: 'America/New_York' })}</a>
											))
										)}
									</div>
								)
							})}
						</div>
					) : (
						(this.state.loaded ? (
							<div><h3>There are no tours available on {dateFnsFormat(this.state.selectedDay, 'MMM d, yyyy')}. Please select a different date or <a href="mailto:lawadmissions@case.edu">contact Admissions</a>.</h3></div>
						) : (
							<p>Please select a day.</p>
						)
					))}</div>
				</div>
			</div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'))
