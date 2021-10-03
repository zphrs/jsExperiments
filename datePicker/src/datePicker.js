// create a date picker custom component\
import spi from "./smoothPlaceholderInput.js";
class DatePicker extends HTMLElement {
    dayList = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];

    constructor() {
        super();
    }
    
    connectedCallback() {
        this._selectedDate = new Date();
        this._selectedDate.setHours(0,0,0,0);
        this._accentColor = 'darkblue';
        this._backgroundColor = 'lavender';
        this.addStyle();
        this.createInput();
        this.style.position = 'relative';
        this.createShowCalendarButton();
        this.renderCalendar();
        this.calendarShown = false;
    }

    set accentColor(color) {
        this._accentColor = color;
        this.styleElem.textContent = this.getStyleText();
    }

    get accentColor() {
        return this._accentColor;
    }

    getStyleText() {
        return `
            
            smooth-placeholder-input {
                position: relative;
                display: inline-block;
                width: 100%;
                top: 0;
            }
            smooth-placeholder-input::after {
                content: "";
                position: absolute;
                bottom: -5px;
                left: 0;
                width: 100%;
                height: 5px;
                background: #e0e0e0;
                border-radius: 5px;
                transition: clip-path 0.3s ease-in-out;
                clip-path: polygon(0 0, 100% 0, 100% 101%, 0% 100%);
            }
            smooth-placeholder-input.focus::after,
            smooth-placeholder-input.is-filled::after {
                clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            smooth-placeholder-input::before {
                content: "";
                position: absolute;
                bottom: -5px;
                left: .5%;
                width: 99%;
                height: 5px;
                background: ${this._accentColor};
                transition: background-color 0.3s ease-out;
                border-radius: 10px;
            }
            smooth-placeholder-input.invalid::before {
                background: red;
            }
        `;
    }

    addStyle() {
        let style = document.createElement('style');
        style.textContent = this.getStyleText();
        this.styleElem = style;
        this.appendChild(style);
    }

    createShowCalendarButton() {
        let button = document.createElement('button');
        // icon from Google Fonts - https://fonts.google.com/specimen/Material+Icons - licensed under apache 2.0 license
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V10h16v11zm0-13H4V5h16v3z"/></svg>`
        button.addEventListener('click', () => {
            this.calendarShown = !this.calendarShown;
            button.style.fill = this.calendarShown ? this.accentColor : 'gray';
        });

        button.style = `
            position: absolute;
            right: -.25em;
            top: -1em;
            height: 2em;
            background: transparent;
            color: ${this._backgroundColor};
            fill: gray;
            border: none;
            padding: .25em;
            border-radius: 5px;
            font-size: 1em;
            cursor: pointer;
        `;
        button.firstChild.style.fill="inherit";
        this.appendChild(button);
        this.button = button;
    }
    
    renderCalendar() {
        if (this.calendarShown) {
            const cal = this.renderTwoWeekCalendar();
        }
    }
    renderTwoWeekCalendar(customDate) {
        if (!this.selectedDate || isNaN(this.selectedDate.valueOf()))
        {
            this.selectedDate = new Date();
            this.selectedDate.setHours(0,0,0,0);
            return;
        }
        const selectedDate = customDate ?? this.selectedDate;
        console.log(customDate);
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        const dayOfWeek = selectedDate.getDay();
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        // generate the current week
        let nextTwoWeeks = [];
        // add all days leading up to the current day
        for (let j = dayOfWeek; j>0; j--) {
            nextTwoWeeks.push({
                dateObj: new Date(year, month, day - j),
                selectedDate: selectedDate
            });
        }
        // add the rest of the days in the 2 weeks
        for (let j = 0; j < 14 - dayOfWeek; j++) {
            nextTwoWeeks.push({
                dateObj: new Date(year, month, day + j),
                selectedDate: selectedDate
            });
        }

        let weeks = [nextTwoWeeks.slice(0, 7), nextTwoWeeks.slice(7, 14)];
        if (this.calendar) {
            this.removeChild(this.calendar);
        }
        let calendar = document.createElement('div');
        this.calendar = calendar;
        calendar.style = `
            position: absolute;
            top: 1em;
            left: 0;
            width: 100%;
            background: ${this._backgroundColor};
            font-size: 2em;
            border-radius: .5em;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
            z-index: 10;
        `;

        let daysRow = document.createElement('div');
        daysRow.style = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            grid-template-rows: 1fr;
            width: 100%;
            background: ${this._accentColor};
            border-radius: .5em .5em 0 0;
            color: ${this._backgroundColor};
            font-size: .75em;
            font-weight: bold;
            text-align: center;
            padding-left: .25em;
            padding-right: .25em;
            box-sizing: border-box;
        `;
        daysRow.innerHTML = days.map(day => `<div>${day}</div>`).join('');
        let weeksDiv = document.createElement('div');
        weeksDiv.style = `
            display: grid;
            grid-template-rows: 1fr 1fr;
            margin: .5em .25em;
            grid-gap: .75em;
            position: relative;
            `;
        // converts the weeks array into html
        for (let i = 0; i < weeks.length; i++) {
            let week = weeks[i];
            let weekDiv = document.createElement('div');
            weekDiv.style = `
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                grid-template-rows: 1fr;
                justify-items: center;
                padding-top: .25em;
                padding-bottom: .25em;
                width: 100%;
                background: ${this._accentColor};
                border-radius: 1em;
                color: ${this._backgroundColor};
                font-size: .75em;
                font-weight: bold;
                text-align: center;
            `;
            for (let j = 0; j < week.length; j++) {
                let day = week[j];
                let dayButton = document.createElement('button');
                dayButton.innerHTML = day.dateObj.getDate();
                dayButton.style = `
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 1.5em;
                    height: 1.5em;
                    background: ${this._backgroundColor};
                    border-radius: 100%;
                    color: ${this._accentColor};
                    font-size: .75em;
                    font-weight: bold;
                    text-align: center;
                    cursor: pointer;
                    border: none;
                    transition-duration: .5s;
                    transition-property: background, color, filter;
                `;
                if (day.dateObj.toDateString() === this.selectedDate.toDateString()) {
                    dayButton.style.background = this._accentColor;
                    dayButton.style.color = this._backgroundColor;
                }
                dayButton.addEventListener('click', () => {
                    this.selectedDate = day.dateObj;
                    this.renderCalendar();
                    this.calendarShown = false;
                });
                dayButton.addEventListener('mouseover', () => {
                    dayButton.style.background = this._accentColor;
                    dayButton.style.color = this._backgroundColor;
                    dayButton.style.filter = `drop-shadow(0 0 .1em ${this._backgroundColor})`;
                });
                dayButton.addEventListener('mouseout', () => {
                    dayButton.style.filter = `drop-shadow(0 0 0 ${this._backgroundColor})`;
                    if (day.dateObj.valueOf() === this.selectedDate.valueOf()) {
                        return;
                    }
                    dayButton.style.background = this._backgroundColor;
                    dayButton.style.color = this._accentColor;
                });
                weekDiv.appendChild(dayButton);
            }
            weeksDiv.appendChild(weekDiv);
        }
        // adds left and right arrows
        let leftArrow = document.createElement('button');
        leftArrow.innerHTML = '◀';
        leftArrow.style = `
            display: flex;
            justify-content: center;
            align-items: center;
            width: 1.5em;
            height: 1.5em;
            background: ${this._backgroundColor};
            border-radius: 100%;
            color: ${this._accentColor};
            font-size: .75em;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: none;
            transition-duration: .5s;
            transition-property: background, color, filter;
            position: absolute;
            top: 1.32em;
            left: -.25em;
        `;
        leftArrow.addEventListener('click', () => {
            this.renderTwoWeekCalendar(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 14));
        });
        leftArrow.addEventListener('mouseover', () => {
            leftArrow.style.background = this._accentColor;
            leftArrow.style.color = this._backgroundColor;
            leftArrow.style.filter = `drop-shadow(0 0 .1em ${this._backgroundColor})`;
        });
        leftArrow.addEventListener('mouseout', () => {
            leftArrow.style.filter = `drop-shadow(0 0 0 ${this._backgroundColor})`;
            leftArrow.style.background = this._backgroundColor;
            leftArrow.style.color = this._accentColor;
        });
        let rightArrow = document.createElement('button');
        rightArrow.innerHTML = '▶';
        rightArrow.style = `
            display: flex;
            justify-content: center;
            align-items: center;
            width: 1.5em;
            height: 1.5em;
            background: ${this._backgroundColor};
            border-radius: 100%;
            color: ${this._accentColor};
            font-size: .75em;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: none;
            transition-duration: .5s;
            transition-property: background, color, filter;
            position: absolute;
            bottom: 1.32em;
            right: -.25em;
        `;
        rightArrow.addEventListener('click', () => {
            this.renderTwoWeekCalendar(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 14));
        });
        rightArrow.addEventListener('mouseover', () => {
            rightArrow.style.background = this._accentColor;
            rightArrow.style.color = this._backgroundColor;
            rightArrow.style.filter = `drop-shadow(0 0 .1em ${this._backgroundColor})`;
        });
        rightArrow.addEventListener('mouseout', () => {
            rightArrow.style.filter = `drop-shadow(0 0 0 ${this._backgroundColor})`;
            rightArrow.style.background = this._backgroundColor;
            rightArrow.style.color = this._accentColor;
        });
        let monthAndYear = document.createElement('div');
        monthAndYear.style = `
            display: flex;
            justify-content: center;
            position: absolute;
            top: 1.4em;
            align-items: center;
            width: 100%;
            height: 1.5em;
            border-radius: 1em;
            color: ${this._accentColor};
            font-size: .7em;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: none;
            `;
        // preconditions: days in same month are bunched together
        // also 7 days per week
        let monthWithMaxDays = -1,
        leaderCt = 0,
        risingCt = 0,
        risingMonth = -1,
        dayCt = weeks.length*7;
        for (let i = 0; i<weeks.length; i++) {
            let week = weeks[i];
            for (let j = 0; j<week.length; j++) {
                let day = week[j];
                if (day.dateObj.getMonth() === risingMonth) {
                    risingCt++;
                } else {
                    risingCt = 1;
                    risingMonth = day.dateObj.getMonth();
                }
                if (risingCt > leaderCt)
                {
                    monthWithMaxDays = risingMonth;
                    leaderCt = risingCt;
                    if (leaderCt>=dayCt/2)
                    {
                        break;
                    }
                }
            }
        }
        console.log(monthWithMaxDays);

        monthAndYear.innerHTML = `
            ${months[monthWithMaxDays]} ${selectedDate.getFullYear()}
        `;
        weeksDiv.appendChild(monthAndYear);
        weeksDiv.appendChild(leftArrow);
        weeksDiv.appendChild(rightArrow);
        calendar.appendChild(daysRow);
        calendar.appendChild(weeksDiv);
        this.appendChild(calendar);
        return calendar;
    }


                

    createInput() {

        const input = new spi();
        input.setAttribute("placeholder", "Date");
        console.log(input);
        input.type = 'text';
        input.addEventListener('change', (e) => {
            let date = new Date(e.target.value);
            if (!isNaN(date.valueOf())) {
                this.selectedDate = date;
                return;
            }
            const inpStr = e.target.value;
            const inpWords = inpStr.split(" ").map(e=>e.toLowerCase().replace(/[^a-z0-9]/g, ''));
            if (inpStr.length === 0) {
                this.selectedDate = new Date();
            }
            for (var i = 0; i<this.dayList.length; i++) {
                console.log(this.dayList[i].toLowerCase(), inpStr.toLowerCase());
                if (inpWords.includes(this.dayList[i].toLowerCase())) {
                    const date = new Date();
                    let newDay = i - date.getDay()
                    if (newDay < 0) {
                        newDay += 7;
                    }
                    if (inpWords.includes("following")) {
                        newDay += 7;
                    }
                    date.setDate(date.getDate() + newDay);
                    this.selectedDate = date;
                    return;
                }
            }
            this.selectedDate = date;
        });
        input.addEventListener('input', ()=>{
            if (this.calendarShown) this.calendarShown = false;
        })
        this.input = input;
        this.appendChild(input);
    }

    set selectedDate(date) {
        this._selectedDate = date;
        this.setAttribute('selected-date', date);
        // set this.input to date formatted as MM/DD/YYYY
        if (!isNaN(date.valueOf()))
        {
            this.input.value = date.toLocaleDateString();
            this.input.classList.remove('invalid');
        }
        else
        {
            this.input.value = '';
            this.input.classList.add('invalid');
        }
        // this.input.value = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        this.renderCalendar();
    }

    get selectedDate() {
        return this._selectedDate;
    }

    static get observedAttributes() {
        return ['selected-date'];
    }

    set calendarShown(bool) {
        this._calendarShown = bool;
        this.setAttribute('calendar-shown', bool);
        this.button.style.fill = bool ? this.accentColor : 'gray';
        if (bool) {
            this.renderCalendar();
        } else {
            this.calendar && this.removeChild(this.calendar);
            this.calendar = null;
        }
    }

    get calendarShown() {
        return this._calendarShown;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'selected-date') {
            this._selectedDate = new Date(newValue);
        }
    }
}

// register custom element
customElements.define('date-picker', DatePicker);