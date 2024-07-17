import { KeyMap } from "forms42core";

export class KeymapCustom extends KeyMap
{
   public static close:KeyMap = new KeyMap({key: 'w', ctrl: true},"close","close window");
   public static login:KeyMap = new KeyMap({key: 'l', ctrl: true},"login","show login");
   
   public static leftmenu:KeyMap = new KeyMap({key: 'm', ctrl: true},"mainmenu","Vis oversigt");
   public static allcoaches:KeyMap = new KeyMap({key: 'i', ctrl: true},"showcoaches","Vis alle instruktører");
}