import { FormsModule } from "../../../FormsModule";
import { AllCoursesDS } from "../../../datasources/database/AllCourses";
import content from "./CoursesHandler.html";
import { EventType, Form, KeyMap, datasource } from "forms42core";

@datasource("coursesDS", AllCoursesDS)

export class CoursesHandler extends Form
{
    
    constructor(){
        super("");
        this.addEventListener(this.init, {type:EventType.PostViewInit});
    }

    private async init() :Promise<boolean>
    {   
        let page:string = content;
        page = page.replace("{ROWS}", String(await AllCoursesDS.getAmount()));
        
        await this.setView(page);
        await this.executeQuery("coursesDS");

        return (true);
    }

    private async precreateFiveCourses() :Promise<boolean>
    {
        for (let index = 0; index < 5; index++) {
            FormsModule.sendkey(KeyMap.insert);	            
        }
        return true
    }
}