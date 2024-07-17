import { DataType, DatabaseSource, LockMode} from "forms42core";

export class UpcomingCoursesDS extends DatabaseSource
{

    constructor() // TODO to test
	{  
        super("stmt20");
        //TODO fetch views instead
        
        this.setBindValue("isacourse", true, DataType.boolean);
        this.setBindValue("currentdate", new Date().getTime(), DataType.timestamp);
     
        this.rowlocking = LockMode.Pessimistic;
	}

}