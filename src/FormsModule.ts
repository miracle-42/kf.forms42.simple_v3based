import { KeymapCustom } from './KeyMaps';
import { FormsPathMapping, FormsModule as FormsCoreModule , DatabaseConnection, EventType, FormProperties, ConnectionScope,InternalFormsConfig } from 'forms42core';
import { InstructorsForm } from './forms/instructors/Instructors';
import { LeftMenu } from './menu/LeftMenu';
import { Properties } from '../Properties';
import { CoursesForm } from './forms/courses/Courses';
import { WeekOverviewForm } from './forms/weekoverview/WeekOverview';
import { CourseActionsForm } from './forms/courseactions/CourseActions';
import { CoursesHandler } from './forms/adminfeatures/courseshandler/CoursesHandler';
import { instructors, courses, weekoverview, courseactions, handlecourse } from './UrlPaths';

@FormsPathMapping(
   [
      {class: InstructorsForm, path: instructors ,navigable:true},
      {class: CoursesForm, path: courses ,navigable:true},
      {class: WeekOverviewForm, path: weekoverview ,navigable:true},
      {class: CourseActionsForm, path: courseactions ,navigable:true},
      {class: CoursesHandler, path: handlecourse ,navigable:true},
   ]
)

export class FormsModule extends FormsCoreModule
{
   public static DATABASE:DatabaseConnection = null;
   public leftmenu:LeftMenu = null;
      
   constructor()
      {
         
         super();
         this.parse();         
         this.setup();
      }

      private async setup()
      {  
         
         //TODO - LOADBALANCER handling
         //let port:number = +window.location.port;
         //let backend:string = (port >= 5500 && port < 5600) ? "http://localhost:12002" : null;
         let backend:string = Properties.domain;
               // Be aware of FormProperties
         FormProperties.DateFormat = "DD-MM-YYYY";

         InternalFormsConfig.CloseButtonText = "&#215;";


         // Be aware of InternalFormsConfig
         // TODO - fix = InternalFormsConfig.close = "&#215;";

        
         FormsModule.showurl = true;
         FormsModule.OpenURLForm();
         // In case loadbalancer/multi-site, get up to last /
         //if (!backend) backend = document.documentURI.match(/^.*\//)[0];
         
         FormsModule.DATABASE = new DatabaseConnection(backend);
         FormsModule.DATABASE.scope = ConnectionScope.transactional;
         
         console.log("I will now connect");
         
         await FormsModule.DATABASE.connect(Properties.username, Properties.password);

         console.log("I will now connect " + FormsModule.DATABASE.connected());
         let parse:boolean = true;

         if (parse)
         {
            this.parse(document.body);  
         }

         this.leftmenu = new LeftMenu();
         this.addEventListener(this.showLeftMenu,{type: EventType.Key, key: KeymapCustom.leftmenu});

         FormsModule.setRootElement(document.body.querySelector("#forms"));
         FormsModule.showurl = true;
              return (true);
      }

      public async showLeftMenu() : Promise<boolean>
      {
         this.leftmenu.focus();
         return(true);
      }

}
