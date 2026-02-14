## Small Project - Contact Manager

### Running the project

- Install PHP
- Install Composer

> cd backend

> composer i

> composer dump-autoload

> php -S 127.0.0.1:8000 router.php

The following topics describe the order of steps I think we should do. We may discuss changes to it whenever we have time to meet. I used TypeScript type system to describe the database's schema and routes' inputs and outputs, which is good for you to start getting familiar with it since in the Large Project we will be using it as our backend (Only the Small Project has to be written with PHP!)

Other examples are written in JavaScript or Rust, and people working on the API role will have to figure out how to translate them to PHP, and how to use the choosen framework (Example: Laravel). I can implement the whole application in Rust/JavaScript and we could use AI to translate it to PHP.

## First step - Database creation

1. Define the Database's schema
    - Create tables and define columns

The following code is just a suggestion of the database's structure. Note that we will have to decide what information a contact will hold, or if it is just its name

```ts
type Database_Schema = {
    users: {
        // It could be an UUID, or BigInt. I suggest to use
        // a number to represent an user because it is simpler
        // to implement and we won't need to download some UUID
        // library. Recall this project is meant to be simple.
        // If we choose UUID, this field will be a string

        // Recommended Type: BigInt, Unsigned, Auto Increment
        user_id: number | string

        // Every user has to have a name. Note that I'm assuming
        // we will not use the First-Name, Last-Name approach
        
        // Recommended Type: VarChar(128), accepts names up to 128
        // characters long.
        name: string

        // The login and register will be done using email, it
        // is the simplest and most reliable way to create an
        // access control system
        email: string

        // This is not the user's actual password. This is the
        // Hashed form of it. We will have to use a library, I have
        // used `Bcrypt` in the past, and for sure it is available
        // in PHP, we just have to figure out how to download it
        password: string

        // Optional fields. Probably we don't need to know when
        // the user created its account, nor when he updated it
        created_at?: Date
        updated_at?: Date
    },
    contacts: {
        // Primary Key. Same as the user_id, we have to decide if
        // it will be an UUID or integer
        contact_id: number | string

        // Every contact has a name
        // Recommended Type: VarChar(128)
        // If we deny contacts having the same name, make this field
        // marked as unique, which will fail the INSERT query if it
        // violates this rule
        name: string

        // Reference to the Users table. We need to know who's the
        // owner of that contact
        user_id: number | string

        // Optional fields. When we create a contact, what will be
        // the information we need to provide in order to allow
        // its creation?
        // All fields marked with ? are a suggestion

        // Recommended Type: VarChar(128)
        email?: string 

        // Phones don't usually go past 32 characters
        // Recommended Type: VarChar(32)
        phone?: string

        // Some basic information about the contact that wasn't
        // listed in other fields. It can be a comment of who's
        // the person. This is probably not required
        notes?: string

        // Optional fields, if we need or not to know more about
        // the user's last interaction and when it was created
        created_at?: Date
        updated_at?: Date
    }
}
index on contact name and user_id for fast retrieval
also consider fulltext index for substring matching for search functionality
```

2. Deploy the database remotely after its creation has been finished

## Defining API endpoints

Our PHP backend will work as an HTTP server. If you have used a library such as `Actix Web (Rust)`, `ExpressJS`, `KitoJS`, `net/HTTP (Go)` this topic should be familiar

If you have not worked with this concepts before, I'll try to explain them shortly

### API Methods

The most common HTTP request methods will be listed below. We can do everything using only GET and POST, which is what I recommend to keep the project simple

- **GET** - Method used when the frontend ***does not send any data in the request's body***. For example, `/health` endpoints are implemented just to indicate that the backend is running. Because of that, the backend app does not expect any data coming from the caller of this endpoint, it just returns constant data such as an "API is running!"

    - Example in Rust of how it would look like (very simple example)
    
    ```rs
    #[get("/health")]
    async fn health() -> HttpResponse {
        HttpResponse::Ok().body("API is running!")
    }
    ```

- **POST** - Most of our routes will use this method. It is the recommended one when the frontend has to send data to the backend application. Example:
    - Suppose you're trying to create an account in our system. You need to send your email, password, and name to create an account and save it in our database. It means that the PHP backend has to receive this data from the user and to the appropriate modification on the database
    - Example of route (I have been working with Rust, not PHP, so this is how you would do on it for example. Try to understand what the code is doing, not its syntax)

    ```rs
    // What the user sends to the backend app
    #[derive(Deserialize)]
    struct RegisterBody {
        email: String,
        password: String,
        name: String
    }

    #[post("/users/register")]
    async fn register_route(body: Json<RegisterBody>) -> HttpResponse { 
        // Get the data sent by the user and store it in variables
        let RegisterBody {
            email, 
            password,
            name
        } = body.into_inner();

        let hashed_password = bcrypt::hash(password, 10);

        // Save the received data to the database and get back
        // the user_id the database assigned to this new user
        let (user_id, ..) = sqlx::query!("INSERT INTO users ({email}, {password}, {name})").await?;

        // At this point some row in the database table "users"
        // should have the email, password and name, while other
        // fields are either "null" or default values\

        let json = json!({ "user_id": user_id });

        // We're returning a JSON to the frontend app containing
        // only its user_id that was just assigned
        HttpResponse::Ok().json(json)
    }
    ```

    - Now we have to figure out how to do something similar on PHP

- **PUT** - Change all data at once. Same as a "POST" request but more meaningful
- **DELETE** - Method used when we want to delete something, also the same as POST method, but more descriptive
- **PATCH** - Change only one single field of our database. Same as a POST method

3. Define what routes our API will provide, what will be its inputs and outputs. The following code is just a suggestion of what routes I think we should implement, note that I'm defining only inputs and outputs, not the actual logic it will do.

```ts
type Routes = {
    // Create a new account
    // Suggested SQL:

    // INSERT INTO users ($1, $2, $3) VALUES ({email}, {password}, {name})
    "users/register": {
        // We send this info to the PHP backend
        input: {
            email: string,
            password: string,
            name: string
        },
        // We get only the user_id back, then we have
        // to go to the login screen
        output: {
            user_id: number
        }
    },
    // Login route
    // Suggested SQL:

    // SELECT * FROM users WHERE email = {email} AND password = {password}
    "users/login": {
        // We send our email and password
        input: {
            email: string,
            password: string
        },
        // If our password was incorrect, or our email
        // is not registered, the API won't return the
        // user_id because it does not exist. It will
        // return an error otherwise, usually defined as
        // a string with the message
        output: {
            user_id: number
        } | {
            // In case of error
            error: string
        }
    },
    // Returns all contacts related to some user
    // Suggested SQL:

    // SELECT * FROM contacts WHERE user_id = {user_id}
    "contacts/all": {
        input: {
            user_id: number
        },
        // Returns a list with all assigned contacts
        output: {
            contacts: {
                contact_id: number,
                name: string,
                email?: string,
                phone?: string,
                notes?: string
            }[]
        }
    },
    // Add only one contact to the user's list
    // Suggested SQL:

    // INSERT INTO contacts ($1, $2, $3, $4, $5) VALUES ({user_id}, {name}, {email}, {phone}, {notes})
    "contacts/add": {
        // Fields marked with ? are optional
        input: {
            user_id: number,
            name: string,
            email?: string,
            phone?: string,
            notes?: string
        },
        // Returns the contact_id of the new contact
        output: {
            contact_id: number
        }
    },
    // Remove only one contact
    // Suggested SQL: 

    // DELETE FROM contacts WHERE user_id = {user_id} AND contact_id = {contact_id}
    "contacts/remove": {
        // We have to provide our user_id and the contact_id
        // that we want to remove
        input: {
            user_id: number,
            contact_id: number
        },
        // If there's no error, it is nothing. In case of an
        // error such as user_id or contact_id not valid, we
        // return a message explaining what the issue was
        output: {
            error?: string
        } | undefined
    },
    // Removes every single contact related to some user
    // Suggested SQL:

    // DELETE FROM contacts WHERE user_id = {user_id}
    "contacts/clear": {
        // We have to provide our user_id
        input: {
            user_id: number
        },
        output: {
            error?: string
        } | undefined
    }
    // Instead of providing the contact_id, we provide only
    // our user_id and the name of the contact we want to
    // remove. If contacts can have repeated names, this route
    // is dangerous and should not be implemented
    
    // Suggested SQL:
    // SELECT * FROM contacts WHERE user_id = {user_id} AND name = {name}
    "contacts/get_by_name": {
        input: {
            user_id: number,
            name: string
        },
        // Returns the info about that contact
        output: {
            contact_id: number,
            name: string,
            email?: string,
            phone?: string,
            notes?: string
        }
    }
    // SELECT * FROM contacts WHERE user_id = {user_id} AND LIKE %{search}%;
    "contacts/search": {
        input: {
            user_id: number,
            search: string
        },
        // Returns the info about that contact
        output: {
            contact_id: number,
            name: string,
            email?: string,
            phone?: string,
            notes?: string 
        }
    }
}
```

4. Once the API's routes input data and return types are defined, the frontend may start to be built
    - We will need 3 pages:
        - Main page
        - Login page
        - Register page
        - Contact manager page (Depends on login to reach this page)

To access our API, the most common way to do it is using the browser's native `fetch` function, see the example below

```ts
// Create an user
async function register() {
    // Get from the document the email, password and name
    // from the tag <input id="{x}">

    let [email, password, name] = [
        "#register_email",
        "#register_password",
        "#register_name"
    ].map(x => $(x).value);
    
    // What we will send to the API
    const body = {
        email,
        password,
        name
    };
    
    try {
        const response = await fetch(
            "http://localhost:8080/users/register", 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        // Get a JSON from the API if the request was successful
        return await response.json();
    } catch (e) {
        // If an error occur inside the try block, it will 
        // reach this line and print to the console whatever
        // happened wrong
        console.error(e)
    }
}
```

5. As soon as we have some screens in our frontend app, I can already deploy them to my personal domains