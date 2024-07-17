import { BindValue, DataType, DatabaseSource, LockMode, SQLStatement } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class Dateinfo 
{
    eventid:number;
    datetypeid:number;
    timestampstart:number;
    notes:string|null;
    noclocksetted:boolean;
    eventname:string;
    firstinstrname:string;
    secondinstrname:string;
    thirdinstrname:string;
}

export class DateHandlerDS
{

    public static async getDatesAndDateTypeByCourse(course_name:string): Promise<Map<Date, string>>
    {
        let datetypebydate:Map<Date, string> = new Map<Date, string>();
        let stmt:SQLStatement = new SQLStatement("stmt02");
        
        stmt.addBindValue(new BindValue("course_name", course_name, DataType.string));
        
        let success:boolean = await stmt.execute(FormsModule.DATABASE);

        if (success)
        {
            while (true)
            {
                let timeanddatetypetitle = await stmt.fetch();
                if(timeanddatetypetitle == null)
                {
                    break;
                }
                datetypebydate.set(new Date(Number(timeanddatetypetitle[0])), timeanddatetypetitle[1]);
            }
        } 
        stmt.close();

        return datetypebydate;
    }

    public static async getDateInfoPerStringDateByDaterange(startdate:Date, enddate:Date): Promise<Map<string, Dateinfo[]>>
    {
        let timenumberedperdateinfo:Map<string, Dateinfo[]> = new Map<string, Dateinfo[]>();
        let stmt:SQLStatement = new SQLStatement("stmt03");

        stmt.addBindValue(new BindValue("startdate", startdate, DataType.date));
        stmt.addBindValue(new BindValue("enddate", enddate, DataType.date));

        let success:boolean = await stmt.execute(FormsModule.DATABASE);
        
        if (success)
        {
            while (true)
            {   
                let info = new Dateinfo();
                let evendateinfo = await stmt.fetch();
                
                if(evendateinfo == null)
                {
                    break;
                }
                info.eventid = evendateinfo[0];
                info.datetypeid = evendateinfo[1];
                info.timestampstart = evendateinfo[2];
                info.notes = evendateinfo[3];
                info.noclocksetted = evendateinfo[4];
                info.eventname = evendateinfo[5];
                
                let stringdate:string = new Date(info.timestampstart)
                    .toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        .replace('.','-').replace('.','-'); // British ? 'en-GB' and '/' instead

                if(typeof(timenumberedperdateinfo.get(stringdate)) == typeof(undefined))
                {
                    let emptylist:Dateinfo[] = [];
                    timenumberedperdateinfo.set(stringdate, emptylist);
                }
                
                timenumberedperdateinfo.get(stringdate).push(info);
                
            }
        } 
        stmt.close();

        return timenumberedperdateinfo;
    }

}