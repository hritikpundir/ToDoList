const express = require('express')
const  bodyParser = require('body-parser')
const _ = require('lodash')

const mongoose = require('mongoose')
const app = express()
app.set("view engine", 'ejs')

let workItems = []

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb://mongo:nAlZnfGuqNwrEFSehjHIpsZVNnRfIGoq@yamabiko.proxy.rlwy.net:43293")

//SCHEMA
const itemsSchema = {
    name: String
}

//one collection is formed
const Item = mongoose.model("Item",itemsSchema)

const Meditation = new Item({
    name:"Meditation"
})
const Walk = new Item({
    name:"Walk"
})
const Cardio = new Item({
    name:"Cardio"
})

const defaultItems = [Meditation,Walk,Cardio];

const listSchema = {
    name:String,
    items:[itemsSchema]
}

//second collection formed
const List = mongoose.model("List",listSchema)

async function insertManyItems(){
    try
    {
        await Item.insertMany([Meditation,Walk,Cardio])
        console.log("Items inserted successfully!!");
        
    }
    catch(err){
        console.log("Error: "+err);
        
    }
}


app.get('/', (req,res)=>{ 

    async function findItem(){
        try{ 
            const items = await Item.find({});

            if(items.length === 0){
             insertManyItems()
            }
            // mongoose.connection.close()
            res.render("list", {listTitle: "Today" , newListItems: items})
            
        }
        catch(err){
            console.log(err);
            
        }
    }
    findItem()
})

app.post("/", (req,res)=>{

    const itemName = req.body.newItem 
    const listName = req.body.list
    
    //save to the database
    const item = new Item({
        name: itemName
    })

    if(listName==="Today"){
        item.save()
        res.redirect("/")
    }
    else{
        async function findDocument(){
            const foundList = await List.findOne({name:listName})
            foundList.items.push(item)
            foundList.save()
            res.redirect("/"+listName)
        }
        findDocument()
    }
    
    //REMEMBER: newItem is the name of the input text
   
})

app.post('/delete', (req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName

    if(listName === "Today"){
        async function removeCheckedItems(){
            try{
                await Item.findByIdAndDelete(checkedItemId)
                console.log("Successfully deleted checked item");
                res.redirect("/")
                
            }
        catch(err){
            console.log(err);
            }
        } 
        removeCheckedItems()
    }
    else{
        async function removeCheckedCustomItems(){
          const foundList = await List.findOneAndUpdate({name:listName}, {
            $pull: {items: {_id: checkedItemId}}
          })
          res.redirect("/"+listName)

        }
        removeCheckedCustomItems()
    }
    })

    app.get("/about", (req,res)=>{
        res.render("about") 
    })

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName)

    async function findDuplicacy(){
        try{
            const foundList  = await List.findOne({name:customListName})
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/"+customListName)
            }
            else{
                res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
            }
        }
        catch(err){
            console.log(err);
            
            }
    }
    findDuplicacy()

})    


app.listen(5000, ()=>{
    console.log("Server started at port 5000");
    
})

