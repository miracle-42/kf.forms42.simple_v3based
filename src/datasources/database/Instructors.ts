import { BindValue, DataType, DatabaseSource, SQLStatement } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class InstructorsDS extends DatabaseSource
{
    constructor()
	{  
        super("stmt04");
     
        this.setBindValue("roletype", "instructor", DataType.string);

        this.sorting = "first_names, last_name"; //First time fetching data
        
	}

    public static async getAmountInstructors(): Promise<number> 
    {
        let stmt:SQLStatement = new SQLStatement("stmt05");

        stmt.addBindValue(new BindValue("roletype", "instructor", DataType.string));

        let success:boolean = await stmt.execute(FormsModule.DATABASE);
        let amount = 0;

        if (success)
        {
                amount = Number(await stmt.fetch());         
        } 
        stmt.close();
        
        return amount;
    }
    

    public static async getAmountOfMaxInstructors(course_name:string): Promise<number>
    {    
        let stmt:SQLStatement = new SQLStatement("stmt06");

        stmt.addBindValue(new BindValue("event_name", course_name, DataType.string));
        
        let success:boolean = await stmt.execute(FormsModule.DATABASE);
        let amount = 0;

        if (success)
        {
                amount = Number(await stmt.fetch());         
        } 
        stmt.close();
        
        return amount;
    }
}