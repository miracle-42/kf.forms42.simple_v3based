import { Form, dates,formevent } from "forms42core";
import { EventType } from "forms42core";
import table from "./courseactions.html";
import { ParticipatingInstructorsDS } from "../../datasources/database/ParticipatingInstructors";
import { ParticipatingStudentsDS } from "../../datasources/database/ParticipatingStudents";
import { Reciever, sendEmailMessage } from "../../utils/EmailHandler";
import { Properties } from "../../../Properties";
import { ParticipatingDMTsDS } from "../../datasources/database/ParticipatingDMTs";

export class CourseActionsForm extends Form
{
    public static coursename:string;

    constructor()
    {
        super("");

        //TODO - this is just for test (to be deleted)
        console.warn("Be careful now!!!!!");
        // console.log("Pyha - Den er god nok");
        this.addEventListener(this.init, {type: EventType.PostViewInit});
        this.addEventListener(this.resizeInput,{})


        let input:HTMLInputElement = document.querySelector('#input[name="first_names"]');
        console.log("constructor",input)
        
    }

    // TODO - REFACTOR - do it better....
    private async init(): Promise<boolean>
    {
        //Validating if course is chosed before anything else
        if(CourseActionsForm.coursename == undefined || CourseActionsForm.coursename == null || CourseActionsForm.coursename == "") 
            throw new Error("There is no course to take actions from...");
        //Fetching data from datasources
        let studentsamount:number = await ParticipatingStudentsDS.getAmountOfParticipatingStudents(CourseActionsForm.coursename);
        let participatingdmtsamount:number = await ParticipatingDMTsDS.getAmount(CourseActionsForm.coursename);
        let dmtsamount:number = await ParticipatingDMTsDS.getMaxAmountForEvent(CourseActionsForm.coursename);
        let instructorsamount: number = await ParticipatingInstructorsDS.getAmountOfMaxInstructorsForEvent(CourseActionsForm.coursename);
        let participatinginstructorsamount: number = await ParticipatingInstructorsDS.getAmountOfInstructors(CourseActionsForm.coursename);
        
        //Template html as page
        let page:string = String(table);
        

        //Setting up page for UI
        page = page.replace("{INSTRUCTORS}", String( participatinginstructorsamount - 1));
        page = page.replace("{COURSE_NAME}", String(CourseActionsForm.coursename));
        page = page.replace("{STUDENTS}", String(studentsamount - 1));
        page = page.replace("<div id=\"coursedays\">{COURSES_DAYS_ADDED}</div>", String(await this.setCoursedaysForStudentAsHTML(CourseActionsForm.coursename)));        
        
        if(participatinginstructorsamount < instructorsamount )
        {
            page = page.replace("<div id=\"missinginstructors\"></div>", String(
                "<tr id=\"missinginstructors\" foreach=\"number in 1.."+ String(instructorsamount-participatinginstructorsamount-1) +"\"> <td> <input readonly=\"readonly\" row=\"$number\" size=\"1\" style=\"display:inline;text-align:right;margin-right:0\"> <div style=\"display:inline;padding-left:0;\" class=\"tobedeleted warningred\">(Mangler instruktør)</div> </td> <td><input readonly=\"readonly\"></td> <td><input readonly=\"readonly\"></td> <td><input readonly=\"readonly\"></td> <td><input row=\"$number\"></td> </tr>"
                )
            );
        } 
        
        if (dmtsamount == 0 || participatingdmtsamount == 0)
        {
            page = page.replace(
                "<tr id=\"dmts\" foreach=\"number in 1..{DMTS}\"> <td> <input readonly=\"readonly\" row=\"$number\" size=\"1\" style=\"display:inline;text-align:right;margin-right:0\"> <div style=\"display:inline;padding-left:0\">Dmt</div> </td> <td><input readonly=\"readonly\" name=\"first_names\" from=\"dmtsparticipating\" row=\"$number\"></td> <td><input readonly=\"readonly\" name=\"last_name\" from=\"dmtsparticipating\" row=\"$number\"></td> <td><input readonly=\"readonly\" type=\"checkbox\" name=\"assigned\" from=\"dmtsparticipating\" id=\"$number00-assigned\" row=\"$number\" value=\"true\"></td> <td><input row=\"$number\"></td> </tr>"
                , String("")
            ); 
        }
        
        if(dmtsamount > 0 && participatingdmtsamount > 0)
        {
            page = page.replace("{DMTS}", String(participatingdmtsamount));
        }
       
        if(participatingdmtsamount < dmtsamount)
        {
            page = page.replace(
                "<div id=\"missingdmts\"></div>", 
                String(
                    "<tr id=\"missingdmts\" foreach=\"number in 1.."+ String(dmtsamount-participatingdmtsamount-1) +"\"> <td> <input readonly=\"readonly\" row=\"$number\" size=\"1\" style=\"display:inline;text-align:right;margin-right:0\"> <div style=\"display:inline;padding-left:0;\" class=\"tobedeleted warningred\">(Mangler dmt)</div> </td> <td><input readonly=\"readonly\"></td> <td><input readonly=\"readonly\"></td> <td><input readonly=\"readonly\"></td> <td><input row=\"$number\"></td> </tr>"
                )
            );
        }
        console.log(page);
        await this.setView(page);


        //Setting datasources by cridentials
        if(participatinginstructorsamount > 0 ) 
        { 
            this.setDataSource("instructorsparticipating", new ParticipatingInstructorsDS(CourseActionsForm.coursename));
            await this.executeQuery("instructorsparticipating");
        }

        if(participatingdmtsamount > 0)
        {
            this.setDataSource("dmtsparticipating", new ParticipatingDMTsDS(CourseActionsForm.coursename));
            await this.executeQuery("dmtsparticipating");
        }

        this.setDataSource("studentsparticipating", new ParticipatingStudentsDS(CourseActionsForm.coursename));
        if(studentsamount > 0) await this.executeQuery("studentsparticipating");

        //Setting extra instructors if any
        if(participatinginstructorsamount > instructorsamount) 
        {
            for (let index = participatinginstructorsamount; index > instructorsamount; index--) 
            {
                let divelement:HTMLElement = document.getElementById(String(index-1 + "_rankinstructor")) as HTMLElement;
                divelement.innerHTML = "(ekstra instruktør)";
                // await this.setView(page);
            }
        }
        
        //Setting students data by course     ->    // TODO - REFACTOR - do it better....
        for (let index = 0; index < studentsamount; index++) 
        {
            let signedupelement:HTMLInputElement = document.getElementById(index + "-signed_up_date") as HTMLInputElement;
            let emailelement:HTMLInputElement = document.getElementById(index + "-student_email") as HTMLInputElement;
            let firstnameselement:HTMLInputElement = document.getElementById(index + "-first_names") as HTMLInputElement;
            
            let signeddate:Date = await ParticipatingStudentsDS.getDateForAssigned(CourseActionsForm.coursename, emailelement.value, firstnameselement.value);
            signedupelement.value = signeddate.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.','-').replace('.','-'); // British ? 'en-GB' and '/' instead;
            
            page = page.replace('<input readonly type="date" name="signed_date" from="studentsparticipating" id="'+index+'-signed_up_date" row="'+index+'" >',signedupelement.outerHTML);
        }
        
        return (true)
    }

    @formevent({type: EventType.PostViewInit})
    private async resizeInput(): Promise<boolean> 
    {
        let input:NodeListOf<HTMLInputElement> = document.querySelectorAll('#students input:not(input[type="button"])');
        if (input) 
        {
            for (let index = 0; index < input.length; index++) {
                input[index].style.width = input[index].value.length + "ch";
            }
        }

        return true;
    }
    
    public async setCoursedaysForStudentAsHTML(course:string):Promise<string>
    {
        let html:string = "";   
        let coursedaysinfo:any[][] = await ParticipatingStudentsDS.getCoursedaysOfParticipatingStudents(course);
        let count:number = 1;
        coursedaysinfo.forEach((dayinfo) =>
        {
            let datetime:Date = new Date(dayinfo[1]);
            let datetimeformatted:string = datetime.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour:'2-digit', minute:'2-digit'}).replace('.','-').replace('.','-');
            
            if(!(html.includes(datetimeformatted)))
            {
                html = html + "<thead><tr class=\"row-indicator\"><th><h3 style=\"text-align:left;\">" + datetimeformatted + "</h3></th></tr></thead>";
            }
            
            let date:string = String(dayinfo[0]);
            
            if(html.includes(date))
            {
                count = count + 1;            
            }  
            else 
            {
                count = 1;
            }
            
            html = html + String(
                '<tr class="row-indicator" ><td>'
            + '<input readonly type="text" value="'+ dayinfo[0] + String(count) + '">'
            + '<input readonly type="text" value="'+ dayinfo[1].toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace('.','-').replace('.','-')  +'">'// British ? 'en-GB' and '/' instead;
            + '</td></tr>'
            );
            
        });
        console.log(html);
        
        return html;
    }

    public async sendSMS(rownumber:string):Promise<boolean>
    {
        let studentareanumberelement:HTMLInputElement = document.getElementById(String(rownumber + "-student_area_phone_code")) as HTMLInputElement;
        let studentnumberelement:HTMLInputElement = document.getElementById(String(rownumber + "-student_phone_number")) as HTMLInputElement;
        let phonenumber:string = "+" + studentareanumberelement.value + studentareanumberelement.value;
        console.log(this);// TODO - send sms by number
        return (true);
    }

    //TODO - Change Methode
    public async sendTESTEmail(authormail:string, authorname:string , reciever:Reciever, text:string):Promise<boolean>
    {
        let recievers:Reciever[] = [];
        recievers.push(reciever)
        let subject = "Greetings " + reciever.name + " !";
        // return await sendEmailMessage(authormail, authorname, recievers, text, subject);
        return await sendEmailMessage(authormail, authorname, recievers, text);
    }

    public async sendEmail(rownumber:string):Promise<boolean>
    {
        let studentemailelement:HTMLInputElement = document.getElementById(String(rownumber + "-student_email")) as HTMLInputElement;
        let studentfirstnamseelement:HTMLInputElement = document.getElementById(String(rownumber + "-first_names")) as HTMLInputElement;
        let studentlastnameelement:HTMLInputElement = document.getElementById(String(rownumber + "-last_name")) as HTMLInputElement;
        
        let email:string = studentemailelement.value;
        let fullname:string = studentfirstnamseelement.value + " " + studentlastnameelement.value;
        
        console.log(email);
        console.log(fullname);

        
        
        
        //TODO - mailchimp stuff: add the right info from table

        //return await sendEMailMessage();
        // return await getDataURl();
        let testreceiver = new Reciever();
        testreceiver.name = Properties.testrecievername;
        testreceiver.email = Properties.testrecievermail;
        let testmessage: string = "Halløj! \n Venlige hilsner \n \t - Mig!";

        return await this.sendTESTEmail(Properties.testauthoremail, Properties.testauthorname, testreceiver, 
            testmessage);

        // return (true);
    }
   
    public set coursename(coursename : string) {
        this.coursename = coursename;
    }
    
}

