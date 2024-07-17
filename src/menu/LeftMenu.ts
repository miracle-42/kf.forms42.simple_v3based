import { FormList } from './FormList';
import { MenuComponent, MenuEvent } from 'forms42core';

export class LeftMenu extends MenuComponent
{
	public tar:EventTarget = null;
	private displayed:boolean = false;
	private folder:HTMLDivElement = null;
	private menuelem:HTMLElement = null;
	private menu_left:HTMLElement = null;
	private container:HTMLElement = null;
	private closewindow:HTMLElement = null;
	private kingfish:HTMLElement = null;
	constructor()
	{
		super("left-menu",new FormList(),{openroot: true, multipleOpen: true});

		this.menuelem = document.createElement("div");
		this.closewindow = document.createElement("div");

		this.kingfish = document.createElement("label");

		this.kingfish.textContent = "kingfish";


		this.menuelem.classList.value = "left-menu-container";
		this.closewindow.classList.value = "menu-left-button";
		this.menu_left = document.querySelector(".menu-left-place");

		this.container = document.getElementById("main-menu") as HTMLElement;
		
		this.closewindow.appendChild(this.kingfish);
		this.container.appendChild(this.closewindow);

		this.menuelem = this.container.appendChild(this.menuelem);

		document.addEventListener("mousedown",(e:MouseEvent) => { 
			this.tar = e.target
		})

		
		this.target = this.menuelem;
		super.show();
	}

	public async showSideBar(event:MenuEvent) : Promise<boolean>
	{
		if (event.menu != this)
			return(true);

		this.kingfish.classList.add("active");
		this.container.style.minWidth = "12pc";
		this.menu_left.style.minWidth = "12pc";
		this.container.classList.add("menu-left-open");

		return(true);
	}

	public async hideSideBar(event:MenuEvent) : Promise<boolean>
	{
		if (event.menu != this)
			return(true);

		if(this.tar == this.kingfish && this.kingfish.classList.contains("active"))
		{
			this.kingfish.classList.remove("active");
			
			this.container.style.minWidth = "0pc";
			this.menu_left.style.minWidth = "0pc";
			this.container.classList.remove("menu-left-open");
		
		}
		return(true);
	}

	public async togglemenu() : Promise<boolean>
	{
		console.log("asopdjapsojd")
			if (this.tar == this.kingfish && this.kingfish.classList.contains("active"))
			{
	
				this.container.style.minWidth = "0pc";
				this.menu_left.style.minWidth  = "0pc";
		
				this.kingfish.classList.remove("active");
				this.container.classList.remove("menu-left-open");
			}
			else
			{
				this.kingfish.classList.add("active");
				this.container.style.minWidth = "12pc";
				this.menu_left.style.minWidth = "12pc";
				this.container.classList.add("menu-left-open");
		
			}
		return(true);
	}

	public async toggleDarkMode(): Promise<boolean> 
	{
		document.body.classList.toggle("dark");
		return(true);
	}

	
}