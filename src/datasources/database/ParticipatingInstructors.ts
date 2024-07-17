import { BindValue, DataType, DatabaseSource, LockMode, SQLStatement } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class ParticipatingInstructorsDS extends DatabaseSource
{
    
    constructor(coursename:string)
	{  
        super("stmt10");
        this.setBindValue("course_name", coursename, DataType.string);

        this.rowlocking = LockMode.Pessimistic;
	}
    
    public static async getAmountOfMaxInstructorsForEvent(coursename: string): Promise<number> 
    {
        let amount:number = 0;
        let stmt:SQLStatement = new SQLStatement("stmt11");

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

    public static async getRanksByInstructorsFullName(coursename:string): Promise<Map<string, number>> // TODO - refactor elsewhere and delete this?
    {    
        let fullnameandrank:Map<string, number> = new Map<string, number>();
        let stmt:SQLStatement = new SQLStatement("stmt12");

        stmt.addBindValue(new BindValue("event_name", coursename, DataType.string));
        stmt.addBindValue(new BindValue("dmt_rank", 0, DataType.int));
        
        try
        {
            let success:boolean = await stmt.execute(FormsModule.DATABASE);

            if (success)
            {
                while (true){
                    let info = await stmt.fetch()
                    if(info == null)
                    {
                        break;
                    }
                    let rank:number = Number(info[2])
                    let fullname:string = String(info[0] + " " + info[1]);
                    fullnameandrank.set(fullname, rank); 
                }
            } 
        }
        catch (e){ console.log(e); }
        finally
        {
            stmt.close();
            return fullnameandrank;
        }
        
    }

    public static async getAmountOfInstructors(coursename: string): Promise<number> 
    {
        let amount:number = 0;
        let stmt:SQLStatement = new SQLStatement("stmt13");

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

    
    public static async getInstructorsByRank(coursename:string): Promise<Map<number, string>> // TODO - refactor: to delete 
    {    
        let fullnameandrank:Map<number, string> = new Map<number, string>();
        let stmt:SQLStatement = new SQLStatement("stmt14");
        
        stmt.addBindValue(new BindValue("event_name", coursename, DataType.string));
        stmt.addBindValue(new BindValue("dmt_rank", 0, DataType.int));
        
        try
        {
            let success:boolean = await stmt.execute(FormsModule.DATABASE);

            if (success)
            {
                while (true){
                    let info = await stmt.fetch()
                    if(info == null)
                    {
                        break;
                    }
                    let rank:number = Number(info[2])
                    let fullname:string = String(info[0] + " " + info[1]);
                    fullnameandrank.set(rank, fullname); 
                }
            } 
        }
        catch (e){ console.log(e); }
        finally
        {
            stmt.close();
            return fullnameandrank;
        }
        
    }
}