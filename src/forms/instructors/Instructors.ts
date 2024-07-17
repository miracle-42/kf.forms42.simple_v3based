import content from "./Instructors.html";
import { EventType, Form, datasource } from "forms42core";
import { InstructorsDS } from "../../datasources/database/Instructors";
import { Sorter } from "forms42core/src/database/Sorter";

@datasource("instructors", InstructorsDS)

export class InstructorsForm extends Form
{
   private sorter:Sorter;

	constructor()
	{        
        super("");
        this.addEventListener(this.init, {type:EventType.PostViewInit});
        this.sorter = new Sorter(this); 
	}

    private async init() :Promise<boolean>
    {   
        let page:string = content;
        page = page.replace("{ROWS}", String(await InstructorsDS.getAmountInstructors()));
        
        await this.setView(page);
        await this.executeQuery("instructors");

        return (true);
    }
    
    public async sort(block:string, column:string) : Promise<boolean>
	{
		return(this.sorter.toggle(block,column).sort(block));
	}

}