import { Locator, Page } from "playwright-core";

class Login{

    page:Page;
    username:Locator;
    password:Locator;
    loginButton:Locator;
    addToCart:Locator;
    getItems:Locator;
    filter:Locator;
    price:Locator;
    cart:Locator;
    checkout:Locator;
    firstName:Locator;
    lastName:Locator;
    zip:Locator;
    continue:Locator;
    finish:Locator;

    constructor(page:Page){
        this.page=page;
        this.username = page.getByPlaceholder("Username");
        this.password = page.getByPlaceholder("Password");
        this.loginButton = page.getByRole("button",{name:'Login'});
        this.addToCart = page.locator(".inventory_item");
        this.getItems = page.locator(".inventory_item");
        this.filter = page.locator('.product_sort_container');
        this.price = page.locator('.inventory_item_price');
        this.cart = page.locator('.shopping_cart_link');
        this.checkout = page.getByRole("button",{name:'Checkout'});
        this.firstName = page.getByPlaceholder("First Name");
        this.lastName = page.getByPlaceholder("Last Name");
        this.zip = page.getByPlaceholder("Zip/Postal Code");
        this.continue = page.getByRole("button",{name:'Continue'});
        this.finish = page.getByRole("button",{name:'Finish'});
        
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

    async filterByPriceLowToHigh(){
         await this.filter.selectOption('lohi');
            const prices = await this.price.allTextContents();
            console.log(prices);
            const nums = prices.map(p => parseFloat(p.replace('$', ''))); //parseFloat to convert string to number
            return nums.toSorted((a, b) => a - b);
    }
   
    async goToCheckout(){
        await this.cart.click();
        await this.page.waitForLoadState('networkidle');
        await this.checkout.click();
    }

    async completeCheckout(first:string,last:string,post:string){
        await this.firstName.fill(first);
        await this.lastName.fill(last);
        await this.zip.fill(post);
        await this.continue.click();
        
    }

    async finishCheckout(){
        await this.finish.click();
    }
}

export default Login;