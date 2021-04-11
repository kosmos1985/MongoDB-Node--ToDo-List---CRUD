const mongo = require('mongodb');

const client = new mongo.MongoClient('mongodb://localhost:27017', { useNewUrlParser: true });

function addNewToDo(todosCollection, title)
{
    todosCollection.insertOne({
        title,
        done: false,
    }, err =>
    {
        if (err)
        {
            console.log('Bład podczas dodawania', err);
        } else
        {
            console.log('Zadanie dodane');
        }
        client.close();
    });
};
function showAllTodos(todosCollection)
{
    todosCollection.find({}).toArray((err, todos) =>
    {
        if (err)
        {
            console.log('Bład podczas pobierania', err);
        } else
        {
            const todosToDo = todos.filter(todo => !todo.done);
            const todosDone = todos.filter(todo => todo.done);
            console.log(`# Lista zadań do zrobienia (niezakończone): ${todosToDo.length}`);

            for (const todo of todosToDo)
            {
                console.log(`- [${todo._id}] ${todo.title}`);
            }
            console.log(`# Lista zadań wykonanych (zakończonych): ${todosDone.length}`);

            for (const todo of todosDone)
            {
                console.log(`- [${todo._id}] ${todo.title}`);
            }
        }
        client.close();
    });
}
function markTaskAsDone(todosCollection,id)
{
    todosCollection.find({
        _id: mongo.ObjectID(id)
    }).toArray((err, todos) =>
    {
        if (err)
        {
            console.log('Bład podczas pobierania', err);
        } else if (todos.length !== 1)
        {
            console.log('Nie ma takiego zadania');
            client.close();
        }else if (todos[0].done)
        {
            console.log('Zadanie było juz zakończone');
            client.close();
        } else
        {
            todosCollection.updateOne({
                _id: mongo.ObjectID(id)
            }, {
                $set: {
                    done: true,
                }
            }, err =>
            {
                if (err)
                {
                    console.log('Bład podczas ustawiania zakończenia', err);
                } else
                {
                    console.log('Zadanie oznaczone jako zakończone');
                }
            });
        };
        client.close();
    });

};
function deleteTask(todosCollection)
{
    todosCollection.find({
        _id: mongo.ObjectID(id)
    }).toArray((err, todos) =>
    {
        if (err)
        {
            console.log('Bład podczas pobierania', err);
        } else if (todos.length !== 1)
        {
            console.log('Nie ma takiego zadania');
            client.close();
        } else
        {
            todosCollection.deleteOne({
                _id: mongo.ObjectID(id)
            }, err =>
            {
                if (err)
                {
                    console.log('Bład podczas usuwania zadania', err);
                } else
                {
                    console.log('Zadanie usunięte');
                }
            });
        };
        client.close();
    });
};

function doTheToDo(todosCollection)
{
    const [command, ...args] = process.argv.splice(2);
    
    switch (command)
    {
        case 'add':
            addNewToDo(todosCollection,args[0]);
            break;
        case 'list':
            showAllTodos(todosCollection);
            break;
        case 'done':
            markTaskAsDone(todosCollection,args[0]);
            break;
        case 'delete':
            deleteTask(todosCollection,args[0]);
            break;
        case 'default':
            console.log(`##### MONGO DB - LISTA TO DO - CRUD
            Lista dostępnych komend:
            add <nazwa adania> - dodaje zadania do listy
            list - wyświetla zadania
            done <id zadania> - oznacza zadania jako zakończone
            deleta <id zadania> - usuwa zadanie z bazy danych`);
            client.close();
            break;
    };
};

client.connect(err =>
{
    if (err)
    {
        console.log('Bład połaczenia1', err);
    } else
    {
        console.log('Połaczenie udane!'); 
        const db = client.db('test');
        const todosCollection = db.collection('todos');
        doTheToDo(todosCollection);
    }   
});
