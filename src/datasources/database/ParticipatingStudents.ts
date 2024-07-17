import { BindValue, DataType, DatabaseSource, LockMode, SQLStatement } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class ParticipatingStudentsDS extends DatabaseSource
{
    constructor(coursename)
	{  
        super("stmt15");
    
        this.setBindValue("course_name", coursename, DataType.string);
        this.rowlocking = LockMode.Pessimistic;
	}

    public static async getAmountOfParticipatingStudents(course_name:string): Promise<number>
    {    
        let stmt:SQLStatement = new SQLStatement("stmt16");

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

    public static async getCoursedaysOfParticipatingStudents(course_name:string): Promise<any[][]>
    {    
        //TODO change and make changes to view //  and studevdays.email = :email (BUT only in version 2)
        let coursedays:any[][] = [];
        let stmt:SQLStatement = new SQLStatement("stmt17");
        console.log("Trigger!", course_name);
        
        stmt.addBindValue(new BindValue("event_name", course_name, DataType.string));
        
        // stmt.addBindValue(new BindValue("email", email, DataType.string));

        try
        {
            let success:boolean = await stmt.execute(FormsModule.DATABASE);
            console.log(success);
            
            if(success)
            {
                while(true)
                {
                    let row:any[] = await stmt.fetch();
                    console.log(row);
                    
                    if(row == null) break;

                    coursedays.push(row);
                }
            }
        }
        catch (e)
        { 
            console.log(e); 
        }
        finally
        {
            stmt.close();
            return coursedays;
        }
    }

    public static async getDateForAssigned(course_name:string, email:string, first_names:string): Promise<Date>
    {    
        let stmt:SQLStatement = new SQLStatement("stmt18");

        stmt.addBindValue(new BindValue("course_name", course_name, DataType.string));
        stmt.addBindValue(new BindValue("email", email, DataType.string));
        stmt.addBindValue(new BindValue("first_names", first_names, DataType.string));
        
        let success:boolean = await stmt.execute(FormsModule.DATABASE);
        let date:Date;

        if (success)
        {
                date = new Date(String(await stmt.fetch()));         
        } 
        stmt.close();
        
        return date;
    }
}

