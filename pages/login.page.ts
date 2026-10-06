import { Locator, Page } from "playwright-core";

class Login{

    page:Page;
    username:Locator;
    password:Locator;
    loginButton:Locator;
    addToCart:Locator;

    constructor(page:Page){
        this.page=page;
        this.username = page.getByPlaceholder("Username");
        this.password = page.getByPlaceholder("Password");
        this.loginButton = page.getByRole("button",{name:'Login'});
        this.addToCart = page
            .locator(".inventory_item");
            
    
        
    }

    async gotoLoginPage(){
        await this.page.goto("https://www.saucedemo.com/");
    }

    async Login(username:string,password:string){
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginButton.click();
    }

    async addItemToCart(cartItem:string){
        await this.addToCart.filter({ hasText: cartItem })
            .getByRole("button", { name: "Add to cart" }).click();
    }

   
}

export default Login;