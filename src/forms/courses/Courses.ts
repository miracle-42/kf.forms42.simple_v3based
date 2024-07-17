import content from "./Courses.html";
import { EventType, Form, datasource } from "forms42core";
import { UpcomingCoursesDS } from "../../datasources/database/UpcomingCourses";
import { PastCoursesDS } from "../../datasources/database/PastCourses";
import { DateHandlerDS } from "../../datasources/database/Datehandler";
import { Sorter } from "forms42core/src/database/Sorter";
import { ParticipatingStudentsDS } from "../../datasources/database/ParticipatingStudents";
import { InstructorsDS } from "../../datasources/database/Instructors";
import { ParticipatingInstructorsDS } from "../../datasources/database/ParticipatingInstructors";
import { CourseActionsForm } from "../courseactions/CourseActions";

@datasource("courses", UpcomingCoursesDS)

export class CoursesForm extends Form
{
    private sorter:Sorter;  

	constructor()
	{
        super("");
        this.addEventListener(this.initview, {type:EventType.PostViewInit});
        this.sorter = new Sorter(this); 
    }

    private async initview() :Promise<boolean>
    { 
        let page:string = String(content)
        page = page.replace("{ROWS}", String(10));
        await this.setView(page);
        
        return await this.displayUpcomingCourses();
    }

    public async redirectToActions(rownumber:string):Promise<boolean>
    {
        let eventnameelement:HTMLInputElement = document.getElementById(String("eve-en-0-" + rownumber)) as HTMLInputElement;
        let eventname:string = eventnameelement.value;
        CourseActionsForm.coursename = eventname;
        await this.showform(CourseActionsForm);
        this.dettach();

        return (true);
    }

    //TODO - Refactoring
    private async displayPastCourses():Promise<boolean>
    {
        document.getElementById("past").classList.add("disabled");
        document.getElementById("past").setAttribute("disabled", "");
        
        document.getElementById("upcoming").classList.remove("disabled");
        document.getElementById("upcoming").removeAttribute("disabled");
        
        //TOD Sort start date with oldest dates
        this.setDataSource("courses", new PastCoursesDS());
        await this.executeQuery("courses").then(() => this.getDatesAndAmountStudentsAndInstructorsParticipatingByCourse());

        return (true);
    }

    private async displayUpcomingCourses():Promise<boolean>
    {
        document.getElementById("upcoming").classList.add("disabled");
        document.getElementById("upcoming").setAttribute("disabled", "");
        
        document.getElementById("past").classList.remove("disabled");
        document.getElementById("past").removeAttribute("disabled");

        this.setDataSource("courses", new UpcomingCoursesDS());
        await this.executeQuery("courses").then(() => this.getDatesAndAmountStudentsAndInstructorsParticipatingByCourse());

        return (true);
    }

    public async sort(block:string, column:string) : Promise<boolean>
	{
		return(this.sorter.toggle(block,column).sort(block));
	}

    
    public async getDatesAndAmountStudentsAndInstructorsParticipatingByCourse():Promise<boolean>//TODO - REFACTOR METHOD AlERT !!!!! TOO LONG METHODE
    {
        //Remove childelements to delete
        let todelete = document.querySelectorAll('p'); //TODO - Only remove params with 'tobedeleted' as class
         
        todelete.forEach(node => 
            {
                node.remove();
            }
        );
        

        //For each course shown 
        for (let index = 0; index < 20; index++) //TODO - pageable?
        {

            //Students
            let eventnameelement:HTMLInputElement = document.getElementsByName("event_name")[index] as HTMLInputElement;
            let eventname:string = eventnameelement.value;
                        
            if(eventname == ""){
                return true;
            }

            let amount:number = await ParticipatingStudentsDS.getAmountOfParticipatingStudents(eventname);
            let amountelement:HTMLInputElement = document.getElementsByName("amount_participating_students")[index] as HTMLInputElement;
            amountelement.value = String(amount);
            
            //Instructors
            let instructorsdescription:string = "";

            let maxamountinstructors:number = await InstructorsDS.getAmountOfMaxInstructors(eventname);
            let fullnameandrank:Map<string, number> = await ParticipatingInstructorsDS.getRanksByInstructorsFullName(eventname);
            
            
            let instructorelement:HTMLElement = document.querySelector(".instructors"+index) as HTMLElement;

           
            fullnameandrank.forEach( (rank, name) =>{
            
                instructorsdescription = name + ' (' + rank + '. instruktør)';
                instructorelement.insertAdjacentHTML(
                    'beforeend',
                    '<p class="tobedeleted">'+ instructorsdescription +'</p>'
                );
            });
            if(maxamountinstructors > fullnameandrank.size)
            {
                instructorelement.insertAdjacentHTML(
                    'beforeend',
                    '<p class="tobedeleted warningred"> Der mangler ' 
                        + String(maxamountinstructors-fullnameandrank.size) 
                            + ' instruktører(e) </p>'
                );
            }
        
            

            //Dates
            let datetypesbydates:Map<Date, string> = await DateHandlerDS.getDatesAndDateTypeByCourse(eventname);

            let dateselement:HTMLElement = document.querySelector(".dates"+index) as HTMLElement;
            
            datetypesbydates.forEach((datetype, date) => 
            {
                let formatteddate:string = date.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.','-').replace('.','-'); // British ? 'en-GB' and '/' instead
                //TODO - validates weekenddays ? 

                dateselement.insertAdjacentHTML(
                    'beforeend',
                    '<p class="tobedeleted">' + formatteddate + ' ' + datetype +'</p> '
                    
                );
            
            });
        } 
        return true;
    }
    
}