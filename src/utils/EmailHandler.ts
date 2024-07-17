import { Properties } from "../../Properties";

// export async function runPingEmailTest(): Promise<boolean> 
// {
//     const response = await mailchimpTx.users.ping();
//     console.log(response);
//     return (true);
// }

// export async function sendEMailTemplate():Promise<boolean> {
//     const response = await mailchimpTx.messages.sendTemplate({
//         template_name: "template_name",
//         template_content: [{}],
//         message: testmessage
//     });
//     console.log(response);
//     return (true);
// }

///////////// TODO - for testing sending images (look at it later - maybe...!) ////////////
export async function getDataURl(): Promise<boolean>
{   
    const canvastest:HTMLCanvasElement = document.createElement("canvas");
    const ctx = canvastest.getContext("2d");
    
    const bin = canvastest.toDataURL("../../images/144x144px.png", 1.0);
    const image = new Image();
    image.src = bin;

    image.onload = () => {
        ctx.drawImage(image, 50, 50);
    }

    console.log(bin);
    console.log(image);
    
    return (true);
}

////////////////// END //////////////////////////

const message = {
    from_email: null,
    from_name: null,
    subject: "",
    text: "",
    to: []
};

const mailchimpTx = require("../../node_modules/@mailchimp/mailchimp_transactional")(Properties.mailchimpapikey);

export class Reciever
{
    email:string;
    name:string;
    type:string;
    
    constructor(){};
}

export async function sendEmailMessage(authoremail:string, authorname:string, recievers:Reciever[], textcontent:string,
        subject:string="Ang. kursus"):Promise<boolean> //TODO - ask; subject deafult?
{
    //TODO - Make validation method instead and split op in even more methods if possible
    if(!(typeof(authoremail) == typeof("") && authoremail != ""))
    {  
        throw new Error("There is no 'senders email' to this current message!");
    }
    if(!(typeof(authorname) == typeof("") && authorname != ""))
    {
       throw new Error("Senders name is not defined..."); 
    }
       
    if(!(typeof(textcontent) == typeof("") && textcontent != ""))
    {  
        throw new Error("There is no content in this current message!");
    }  
    
    if(!(recievers.length > 0 && typeof(recievers[0]) == typeof(new Reciever())))
    {    
        throw new Error("There is no recievers added to this current message!");
    }
    
    if(!(typeof(subject) == typeof(""))) // TODO - Not necessary!?
    {   
        throw new Error("System error - contact your staff or system manager! \n Message: 'Type of subject is not a string!'");
    }  
    else 
    {
        message.from_email = authoremail;
        message.from_name = authorname;
        message.text = textcontent;
        message.subject = subject;

        const regexp:RegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        let norecievers:Reciever[] = recievers.slice(0);

        recievers.forEach((reciever:Reciever) => 
        {   
            if(typeof(reciever.email) != typeof("") || (!(regexp.test(reciever.email))))
            {
                throw new Error("Incorrect email..."); 
            }
            else
            {
                norecievers.splice(norecievers.indexOf(reciever),1);
                //Defaults
                if(typeof(reciever.type) == typeof(undefined) || reciever.type == "") reciever.type = "to";
                if(typeof(reciever.name) == typeof(undefined) || reciever.name == "") reciever.name = reciever.email;
                
                message.to.push({
                    email: reciever.email,
                    name: reciever.name,
                    type: reciever.type
                });
            }
        });
        
        if(norecievers.length > 0)
        {
            let namesandemails:string = "";
            norecievers.forEach(
                (reciever) => 
                    namesandemails = namesandemails + "Name: " + reciever.name + ", Email: " + reciever.email + ",\n"
            );

            throw new Error(
                norecievers.length + " reciever by sending email!\n"
                + "The recievers are:\n" 
                + namesandemails 
                + "The emails are not a legal emailadresses..."
            );
        }
        
        console.log(message);
            // const response = await mailchimpTx.messages.send({
        //     message: message
        // });
        // console.log(response);
    }

    return (true);
}
