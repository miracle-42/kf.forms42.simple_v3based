import { FormsModule } from "../FormsModule";
import { Form, StaticMenu, StaticMenuEntry } from "forms42core";
import { courses, instructors, weekoverview, handlecourse } from "../UrlPaths";

export class FormList extends StaticMenu
{
	constructor()
	{
		super(FormList.data());
	}

	public async execute(path:string): Promise<boolean>
	{
		let formsrunning:Form[] = FormsModule.getRunningForms();
		
		//TO FIX - works now but not 'perfect'
		formsrunning.forEach( form => 
		{
			if(form.blocks.length == 0){
			//continue loop
			}
			else form.dettach();
			
			form.close();
		});
		await FormsModule.showform(path);
		
		return(true);
	}

	private static data() : StaticMenuEntry
	{
		return(
		{
			id: "menu",
			display: "Menu",
			entries:
			[
				{
					id: "allcourses",
					display: "Kurser",
					command: courses,
				},
				{
					id: "allinstructors",
					display: "Instrukører/DMT",
					command: instructors
				},
				{
					id: "weeklyoverview",
					display: "Ugeoversigt",
					command: weekoverview
				},
				// {
				// 	id: "home",
				// 	display: "Home",
				// 	command: "/home"
				// },
				{
					id: "handle_courses_admin",
					display: "(Admin) Kurser",
					command: handlecourse
				}
			]
		});
	}
}