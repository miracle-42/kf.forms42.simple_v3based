import { DateHandlerDS, Dateinfo } from "../../datasources/database/Datehandler";
import { ParticipatingInstructorsDS } from "../../datasources/database/ParticipatingInstructors";
import { ParticipatingStudentsDS } from "../../datasources/database/ParticipatingStudents";

import content from "./WeekOverview.html";
import weektable from "./WeekTable.html";

import { EventType, Form } from "forms42core";

const MILISECONDSPERWEEK:number = 604800000; //TODO - move to logic layer if reuse needed

export class WeekOverviewForm extends Form
{
    constructor()
    {
        super(content);
        this.title = "ugeoversigt";
        this.addEventListener(this.init, {type:EventType.PostViewInit});        
    }

    private async init() :Promise<boolean>
    { 
        let today = new Date(); 
        let fiveweeksview = new Date(today.getTime() + ( MILISECONDSPERWEEK * 4)); // X = 4 times miliseconds pr week + this week - wil show 5 weeks in UI
        this.weeklyoverviewinit(today, fiveweeksview);

        let searchenddate:HTMLInputElement = document.getElementById("enddatesearch") as HTMLInputElement;
        let searchstartdate:HTMLInputElement = document.getElementById("startdatesearch") as HTMLInputElement;

        let todaysweeknumber:number = await this.getWeekNumber(today);
        let thisweek:Date[] = await this.getWeekFromMonday(todaysweeknumber, today.getFullYear());
        
        let inXweeksweeknumber:number = await this.getWeekNumber(fiveweeksview);
        let inXweeksdates:Date[] = await this.getWeekFromMonday(inXweeksweeknumber, fiveweeksview.getFullYear());

        searchstartdate.value = thisweek[0].toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.','-').replace('.','-');//British ? 'en-GB' and '/' instead
        searchenddate.value = inXweeksdates[6].toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.','-').replace('.','-'); //British ? 'en-GB' and '/' instead

        return (true);
    }

    private showweekoverview()
    { 
        let startsearchelement:HTMLInputElement = document.getElementById("startdatesearch") as HTMLInputElement; 
        let endsearchelement:HTMLInputElement = document.getElementById("enddatesearch") as HTMLInputElement;
        let startdatelist:string[] = startsearchelement.value.split("-");
        let enddatelist:string[] = endsearchelement.value.split("-");
        
        let usastringstartdate = startdatelist[1] + "-" + startdatelist[0] + "-" + startdatelist[2];
        let usastringenddate = enddatelist[1] + "-" + enddatelist[0] + "-" + enddatelist[2];
        
        let startdate = new Date (usastringstartdate);
        let enddate = new Date (usastringenddate);

        let tmpelements:HTMLElement = document.getElementById('weeks').cloneNode() as HTMLElement;
  
        while (document.getElementById('weeks').lastElementChild) {
            document.getElementById('weeks').removeChild(document.getElementById('weeks').lastElementChild);
        }
        
        if(0 == document.getElementById('weeks').childNodes.length)
        {   
            this.weeklyoverviewinit(startdate, enddate);
        }
    }

    // TODO - you MUST DO REACTORING.... !!!!!
    private async weeklyoverviewinit(startdate:Date, end_date:Date) :Promise<boolean>
    {    
        //TODO - there is an much easier way to do this - do it  
        let todaysweeknumber:number = await this.getWeekNumber(startdate);
        let thisweek:Date[] = await this.getWeekFromMonday(todaysweeknumber, startdate.getFullYear());
       
        let inXweeksweeknumber:number = await this.getWeekNumber(end_date);
        let inXweeksdates:Date[] = await this.getWeekFromMonday(inXweeksweeknumber, end_date.getFullYear());
        
        console.log("Your browserlanguage is: " + navigator.language); // This is a dev-note: language for browser 
    
        let timeinnumberandinfo:Map<string, Dateinfo[]> = await DateHandlerDS.getDateInfoPerStringDateByDaterange(thisweek[0], inXweeksdates[6]);
        let showweekselem:HTMLElement = document.querySelector(".showweeks") as HTMLElement;
        
        while(true)
        { 
            if(thisweek[0].getTime() >= inXweeksdates[6].getTime()){
                return (true);
            }
            let week = document.createElement('div');
            week.setAttribute("id", "weeknumber" + String(todaysweeknumber));
            week.innerHTML = weektable;
            
            week.querySelector('.numberatweek').innerHTML = "Uge " + String(todaysweeknumber) + " - " + thisweek[0].getFullYear();
            showweekselem.appendChild(week);

            for (let index = 0; index < thisweek.length; index++) 
            {
                let inputdayelem:HTMLInputElement = week.getElementsByClassName("day" + Number(index))[0] as HTMLInputElement;
                inputdayelem.value = thisweek[index].toLocaleString('da-DK', { weekday: 'short'});  // British ? 'en-GB' and '/' instead
                              
                let inputdateelem:HTMLInputElement = week.getElementsByClassName("date" + Number(index))[0] as HTMLInputElement;
                let dateformatstring:string = thisweek[index].toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.','-').replace('.','-'); // British ? 'en-GB' and '/' instead
                inputdateelem.value = dateformatstring;
                              
                if(typeof(timeinnumberandinfo.get(dateformatstring)) != typeof(undefined))
                {
                    let elementevent:HTMLInputElement = week.getElementsByClassName("event" + Number(index))[0] as HTMLInputElement; // Change to reglaur htmlelement
                    let input1instruct:HTMLInputElement = week.getElementsByClassName("firstinstructor" + Number(index))[0] as HTMLInputElement; // Change to reglaur htmlelement
                    let input2instruct:HTMLInputElement = week.getElementsByClassName("secondinstructor" + Number(index))[0] as HTMLInputElement;
                    let input3instruct:HTMLInputElement = week.getElementsByClassName("thirdinstructor" + Number(index))[0] as HTMLInputElement;
                    let inpustudents:HTMLInputElement = week.getElementsByClassName("participantsamount" + Number(index))[0] as HTMLInputElement;
                    let inputother:HTMLInputElement = week.getElementsByClassName("other" + Number(index))[0] as HTMLInputElement;

                    let dateinfolist: Dateinfo[] = timeinnumberandinfo.get(dateformatstring);
                    dateinfolist.forEach( async dateinfo =>
                    {
                        let eventshown:string = "[link for "+ dateinfo.eventname +"] (**ID:" + dateinfo.eventid + ")";
                        
                        if(dateinfo.noclocksetted == false) 
                        {
                            let timestart = new Date(dateinfo.timestampstart);
                            let formattedtime = timestart.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit'}).replace('.',':');
                            eventshown = eventshown + " ( " + formattedtime + " )";
                        }

                        if(dateinfolist.indexOf(dateinfo) > 0 )
                        {
                            let idforekstaevent:string =  "extrafor"+ Number(index) + "day";
                            let ekstraeventelemntbyid:HTMLDivElement = document.querySelector('#'+idforekstaevent) as HTMLDivElement;
                            let eventekstrarow:HTMLElement = document.createElement('tr') as HTMLElement;
                            
                            eventekstrarow.insertAdjacentHTML(
                                'afterend',
                                     '<td>'
                                    +'    <input readonly type="text" name="day'
                                                + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)) 
                                                +'" class="day'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'" >'
                                    +'</td>'
                                    +'<td>'
                                    +'    <input readonly type="text" class="date'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'" date-format="dd-mm-yyyy"> '
                                    +'</td>'
                                    +'<td>'
                                    +'    <input id="event'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'" style="width:20pc" type="text" class="event'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'">'
                                    +'    <!--- changed---->'
                                    +'</td>'
                                    +'<td>'
                                    +'    <input type="text" class="firstinstructor'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'">'
                                    +'</td>'
                                    +'<td>'
                                    +'    <input readonly type="text" class="secondinstructor'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'"> '
                                    +'</td>'
                                    +'<td>'
                                    +'    <input readonly type="text" class="thirdinstructor'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'"> '
                                    +'</td>'
                                    +'<td>'
                                    +'    <input readonly type="number" class="participantsamount'+
                                                idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                                +'" > '
                                    +'</td>'
                                    +'<td>'
                                    +'    <input readonly type="text" class="other'+
                                            idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo))
                                            +'"> '
                                    +'</td>'
                                );
                            // ^ TODO - Set link for event
                            inputdayelem = eventekstrarow.getElementsByClassName("day" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement;
                            inputdateelem = eventekstrarow.getElementsByClassName("date" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement;
                            elementevent = eventekstrarow.getElementsByClassName("event"+ idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement; 
                            input1instruct = eventekstrarow.getElementsByClassName("firstinstructor" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement; 
                            input2instruct = eventekstrarow.getElementsByClassName("secondinstructor" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement;
                            input3instruct = eventekstrarow.getElementsByClassName("thirdinstructor" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement;
                            inpustudents = eventekstrarow.getElementsByClassName("participantsamount" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement;
                            inputother = eventekstrarow.getElementsByClassName("other" + idforekstaevent + ":"+ String(dateinfolist.indexOf(dateinfo)))[0] as HTMLInputElement;
                            
                            inputdayelem.value = "";
                            inputdateelem.value = "";

                            let instructors:Map<number, string> = await ParticipatingInstructorsDS.getInstructorsByRank(dateinfo.eventname);
                            let amountstudents:number = await ParticipatingStudentsDS.getAmountOfParticipatingStudents(dateinfo.eventname);
                                
                            if(typeof(instructors.get(1)) != typeof(undefined)) input1instruct.value = String(instructors.get(1));
                                
                            if(typeof(instructors.get(2)) != typeof(undefined)) input2instruct.value = String(instructors.get(2));
                                
                            if(typeof(instructors.get(3)) != typeof(undefined)) input3instruct.value = String(instructors.get(3)); 
                                
                            elementevent.value = eventshown;
                            

                            inpustudents.value = String(amountstudents);
                            inputother.value = dateinfo.notes;
                            
                        } 
                        else 
                        {   
                       
                        let instructors:Map<number, string> = await ParticipatingInstructorsDS.getInstructorsByRank(dateinfo.eventname);
                        let amountstudents:number = await ParticipatingStudentsDS.getAmountOfParticipatingStudents(dateinfo.eventname);
                        
                        if(typeof(instructors.get(1)) != typeof(undefined)) input1instruct.value = String(instructors.get(1));
                        
                        if(typeof(instructors.get(2)) != typeof(undefined)) input2instruct.value = String(instructors.get(2));

                        if(typeof(instructors.get(3)) != typeof(undefined)) input3instruct.value = String(instructors.get(3));
                        
                        inpustudents.value = String(amountstudents);
                        inputother.value = dateinfo.notes;
                        }
                        
                        elementevent.value = eventshown;
                    });  
                }
            }
            let year:number = thisweek[0].getFullYear();
            todaysweeknumber++;
            if(todaysweeknumber >= 53){
                todaysweeknumber = 1;
                year++;
            }
            thisweek = await this.getWeekFromMonday(todaysweeknumber, year);
        }
    }

    public async getWeekNumber(date: Date): Promise<number> // TODO - Use week from html to set week ... this methode has troubles with 'skudår' (every 4th year where we get an ekstra day)
    {
        // Copying date so the original date won't be modified
        const tempDate = new Date(date.valueOf());
    
        // ISO week date weeks start on Monday, so correct the day number
        const dayNum = (date.getDay() + 6) % 7;
    
        // Set the target to the nearest Thursday (current date + 4 - current day number)
        tempDate.setDate(tempDate.getDate() - dayNum + 3);
    
        // ISO 8601 week number of the year for this date
        const firstThursday = tempDate.valueOf();
    
        // Set the target to the first day of the year
        // First set the target to January 1st
        tempDate.setMonth(0, 1);
    
        // If this is not a Thursday, set the target to the next Thursday
        if (tempDate.getDay() !== 4) 
        {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
        }
           
        // The weeknumber is the number of weeks between the first Thursday of the year
        // and the Thursday in the target week
        return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000); // 604800000 = number of milliseconds in a week
    }

    public async getWeekFromMonday(week:number, year:number):Promise<Date[]>
    { 
        let simple = new Date(year, 0, 1 + (week - 1) * 7);
        let dow = simple.getDay();
        let ISOweekStart = simple;
    
        if (dow <= 4)
        {
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        }
        else
        {
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        const temp = {
    
          d: ISOweekStart.getDate(),//+1, // plus one for monday because type of Date is american standarts (from sunday to saturday)
          m: ISOweekStart.getMonth(),
          y: ISOweekStart.getFullYear(),
    
        }    
        const numDaysInMonth = new Date(temp.y, temp.m + 1, 0).getDate();

        return Array.from({length: 7}, _ => 
            {
                if (temp.d > numDaysInMonth)
                {
                    temp.m +=1;
                    temp.d = 1;
                }      
            
                return new Date(temp.y, temp.m, temp.d++);
        });
    }
}