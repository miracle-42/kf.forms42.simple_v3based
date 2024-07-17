import { BindValue, DataType, DatabaseSource, LockMode, SQLStatement } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class ParticipatingDMTsDS extends DatabaseSource
{
    constructor(coursename:string)
	{  
        super("stmt07");
        
        this.setBindValue("course_name", coursename, DataType.string);

        this.rowlocking = LockMode.Pessimistic;
	}

    public static async getAmount(coursename: string): Promise<number>
    {
        let amount:number = 0;
        let stmt:SQLStatement = new SQLStatement("stmt08");

        stmt.addBindValue(new BindValue("course_name", coursename, DataType.string));
        
        try
        {
            let success:boolean = await stmt.execute(FormsModule.DATABASE);

            if(success) amount = Number(await stmt.fetch());
        }
        catch (e)
        { 
            console.log(e); 
        }
        finally
        {
            stmt.close();
            return amount;
        }
        
    }

    public static async getMaxAmountForEvent(coursename: string): Promise<number> 
    {
        let amount:number = -1;
        let stmt:SQLStatement = new SQLStatement("stmt09");

        stmt.addBindValue(new BindValue("course_name", coursename, DataType.string));
        
        try
        {
            let success:boolean = await stmt.execute(FormsModule.DATABASE);

            if(success) amount = Number(await stmt.fetch());
        }
        catch (e)
        { 
            console.log(e); 
        }
        finally
        {
            stmt.close();
            return amount;
        }
    }
}