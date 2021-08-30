const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express()



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abe:a123@cluster0.lvciq.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// creating a new new todo schema
const todoSchema = {
    name: String
}
// mongoose Model
const ItemMongoose = mongoose.model("Item", todoSchema)
const itemOne = new ItemMongoose({
    name: "wash clothes"
});
const itemTwo = new ItemMongoose({
    name: "Clean room"
});
const itemThree = new ItemMongoose({
    name: "sweep"
});
const toDoItems = [itemOne,itemTwo,itemThree]
// Wrapping this up with all the todoSchema with the default inputs

// New Schema
const listSchema = {
    name: String,
    items: [todoSchema]
}

const ListMongoose = mongoose.model("List", listSchema);

app.get('/', (req, res) =>{
    ItemMongoose.find({}, (err, foundItems) =>{
        if(foundItems.length === 0){
            ItemMongoose.insertMany(toDoItems, (err) =>{
                if (err)
                {
                    console.log(err);
                }
                else {
                    console.log("Success");
                }
            })
            res.redirect("/")
        }
        else{
            res.render("list", {listTitle: "Today", addedListItems: foundItems});    
        }
    })
});

app.get("/:customListName", (req,res) =>{
    let customListName = _.capitalize(req.params.customListName);


    ListMongoose.findOne({name: customListName}, (err, foundList) =>{
        if(err){
            console.log(err);
        } else{
            // Show an existing list 
            console.log("success");
            if(foundList){
                res.render("list", {listTitle: foundList.name, addedListItems: foundList.items});
            }
            else{
                // Create a new list
                let list = new ListMongoose({
                    name: customListName,
                    items: toDoItems
                })
                list.save()
                res.redirect("/" + customListName)
            }
        }
    })
    
});

app.post('/', (req,res) =>{
    let submitted = req.body.newItem;  
    let listName = req.body.list;

    // we are passing over the new submitted text to the array below
    let item = new ItemMongoose({
        name: submitted
    });

    if(listName == "Today"){
        item.save()
        res.redirect("/")
    }
    else{
        ListMongoose.findOne({name: listName}, (err, foundList) =>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})

app.post("/delete", (req, res) =>{
    let checked = req.body.checkbox;
    let listName = req.body.listName;

    if( listName === "Today"){        
            ItemMongoose.findByIdAndDelete((checked), (err) =>{
                if(err){
                    console.log(err);
                } else{
                      res.redirect("/")
                }
            });
    } else{
        ListMongoose.findOneAndUpdate({name: listName},{$pull: {items: {_id: checked}}}, (err, finishedList)=>{
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => console.log(`Server is running`));