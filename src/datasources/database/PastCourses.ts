import { BindValue, DataType, LockMode, DatabaseSource } from "forms42core";
import { FormsModule } from "../../FormsModule";

export class PastCoursesDS extends DatabaseSource
{

    constructor() // TODO to test
	{  
        super("stmt19");
        //TODO fetch views instead
       
        this.setBindValue("isacourse", true, DataType.boolean);
        this.setBindValue("currentdate", new Date().getTime(), DataType.timestamp);

        this.rowlocking = LockMode.Pessimistic;
	}

}