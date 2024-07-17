import {DatabaseSource, LockMode, SQLStatement } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class AllCoursesDS extends DatabaseSource
{
    
    constructor()
	{  
        super("courses");
        this.connection = FormsModule.DATABASE;
        this.primaryKey = "event_id";
        this.rowlocking = LockMode.Pessimistic;
	}

    public static async getAmount(): Promise<number> 
    {
        let stmt:SQLStatement = new SQLStatement("stmt01");
       
        let success:boolean = await stmt.execute(FormsModule.DATABASE);
        let amount = 0;

        if (success)
        {
                amount = Number(await stmt.fetch());         
        } 
        await stmt.close();
        
        return amount;
    }

}