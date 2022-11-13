const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const cors = require("cors")
const { response } = require("express")
const { request } = require("http")

const dbPath = path.join(__dirname,"todo.db")

const app = express()
app.use(express.json())
app.use(cors()) 

let db = null 

const initializeDbAndServer = async () => {
    try{
       db = await open({
        filename:dbPath,
        driver:sqlite3.Database
       })
       app.listen(process.env.PORT || 3003, () => {
        console.log("Server Running at http://localhost:3003/")
       }  )
    } 
    catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
      }
}

initializeDbAndServer()

// get all users api

app.get("/users/", async(request,response) => {
  const getUserListQuery = `
  SELECT * 
  FROM users ;
  `
  const userArray = await db.all(getUserListQuery)
  response.send(userArray.map((eachUser) => eachUser))
})


// add users api 

app.post("/users/add/", async(request,response) =>{
  const userDetails = request.body 
  const {username,id} = userDetails

  const checkUserExistsOrNot = `
  
  SELECT * 
  FROM users 
  WHERE username = '${username}';
  `
  const dbUser = await db.get(checkUserExistsOrNot)
  
  if (dbUser === undefined){
    const addNewUserQuery = `
    INSERT INTO users (id,username) VALUES ("${id}","${username}");
    `
    const addUser = await db.run(addNewUserQuery)
    const newUserId = addUser.lastID
    response.send(`create new user with ${newUserId}`)
  }
  else{
    response.status(400)
    response.send("User already exists")
  }
})

// delete users api 

app.delete("/users/:id/",async(request,response) => {
  const {id} = request.params 
  
  const userDeleteQuery = `
  DELETE FROM users WHERE id = '${id}';
  `
  await db.run(userDeleteQuery)
  response.send("Book Deleted Successfully")
})

// add task api 

app.post("/tasks/add/",async(request,response) => {
  const taskDetails = request.body 
  const {id,user_id,task,is_completed} = taskDetails
  const checkTaskExistsOrNot = `
  SELECT * FROM tasks WHERE user_id = '${user_id}';
  `
  const usersTask  = await db.all(checkTaskExistsOrNot)
  const filterData = usersTask.filter(eachData => eachData.task === task)
  if (filterData.length === 0){
    const addTaskQuery = `
  INSERT INTO tasks (id,user_id,task,is_completed) VALUES ("${id}","${user_id}","${task}","${is_completed}")
  ;`
  const addNewTaskId = await db.run(addTaskQuery)
  const newTaskId = addNewTaskId.lastID 
  response.send(`created new task with id ${newTaskId}`)
  }
  else{
    response.status(400)
    response.send("task already exists")
  }
})

// delete task api 

app.delete("/task/:id",async(request,response) => {
  const {id} = request.params 
  const taskDeleteQuery = `
  DELETE FROM tasks WHERE id = '${id}';
  `
  await db.run(taskDeleteQuery)
  response.send("Delete task success")

})

// get tasks 

app.get("/task/user/:user_id/",async(request,response) => {
  const {user_id} = request.params 
  const getTaskQuery = `
  SELECT * FROM tasks WHERE user_id ='${user_id}';
  `
  const getAllTask = await db.all(getTaskQuery)
  response.send(getAllTask.map((eachtask) => eachtask))
})

// update api

app.put("/task/update/:id",async(request,response) => {
  const {id} = request.params 
  const {is_completed} = request.body 
  const updateTaskQuery = `
  UPDATE tasks SET  is_completed = '${is_completed}'
  WHERE id = '${id}';
  `
  await db.run(updateTaskQuery)
  response.send("Update successfuly")


})

//get username by id api 

app.get("/username/:user_id",async(request,response) => {
  const {user_id} = request.params 
  const getUsernameQuery = `
  SELECT username FROM users WHERE id = '${user_id}';
  `
  const getUserName = await db.get(getUsernameQuery)
  response.send(getUserName)
})