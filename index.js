const mysql = require("mysql2");
const inquirer = require("inquirer");
const db = require('./db/connection');
const employeeRoutes = require('./routes/employeeRoutes')
const connection = require('./db/connection')
let deptArray = [];

  showMenu()
// const PORT = process.env.PORT || 3001;

//Connection to DB 
// const db = mysql.createConnection(
//     {
//         host: 'localhost',
//         user: 'root',
//         password: 'memis123',
//         database: 'employees'
//     },
// );

// db.connect(function (err) {
//     if (err) throw err
//     showMenu()
// }); 

// Start server after DB connection
// db.connect(err => {
//     if (err) throw err;
//     console.log('Database connected.');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
// });


//reference questions prompts asked by readME file gen project 
function showMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Choose option',
      choices: ['View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Update an employee manager',
        "View employees by department",
        'No Action']
    }
  ])
    .then((answers) => {
      console.log('igloo')
      const choices = answers.choice
      console.log(answers)
      if (choices === "View all departments") {
        // showDepartments();
        console.log('Showing all departments...\n');
        const sql = `SELECT department.id AS id, department.name AS department FROM department`;
        connection.promise().query(`SELECT * FROM department`)
          .then(([response]) => {
            console.table(response)
            showMenu()
          })
      }

      if (choices === "View all roles") {
        // showRoles();
        console.log('Showing all roles...\n');

        const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;
        connection.promise().query(`SELECT * FROM role`)
          .then(([response]) => {
            console.table(response)
            showMenu()
          })
      }

      if (choices === "View all employees") {
        // function showEmployees() {
        console.log('Showing all employees...\n');
        const sql = `SELECT employee.id, 
                                employee.first_name, 
                                employee.last_name, 
                                role.title, 
                                department.name AS department,
                                role.salary, 
                                CONCAT (manager.first_name, " ", manager.last_name) AS manager
                                FROM employee
                                LEFT JOIN role ON employee.role_id = role.id
                                LEFT JOIN department ON role.department_id = department.id
                                LEFT JOIN employee manager ON employee.manager_id = manager.id`;
        connection.promise().query(`SELECT * FROM employee`)
          .then(([response]) => {
            console.table(response)
            showMenu()
          })
      }

      if (choices === "Add a department") {
        // addDepartment();
        inquirer.prompt([
          {
            type: 'input',
            name: 'addDept',
            message: "What department do you want to add?",
            validate: addDept => {
              if (addDept) {
                return true;
              } else {
                console.log('Please enter a department');
                return false;
              }
            }
          }
        ])
          .then(answer => {
            const sql = `INSERT INTO department (name)
                  VALUES (?)`;
            connection.query(sql, answer.addDept, (err, result) => {
              if (err) throw err;
              console.log('Added ' + answer.addDept + " to departments!");

              console.log('Showing all departments...\n');
              const sql = `SELECT department.id AS id, department.name AS department FROM department`;
              connection.promise().query(`SELECT * FROM department`)
                .then(([response]) => {
                  console.table(response)
                  showMenu()
                })
            });
          });
      }

      if (choices === "Add a role") {
        // addRole(); 
        // needs to target the id of the department through the name 
        const roleSql = `SELECT name, id FROM department`;

        connection.query(roleSql, (err, data) => {
          if (err) throw err;

          const dept = data.map(({ name, id }) => ({ name: name, value: id }));
          inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: "What role do you want to add?",
              validate: addRole => {
                if (addRole) {
                  return true;
                } else {
                  console.log('Please enter a role');
                  return false;
                }
              }
            },
            {
              type: 'input',
              name: 'salary',
              message: "What is the salary of this role?",
              // validate: addSalary => {
              //   if (!isNaN(addSalary)) {
              //     return true;
              //   } else {
              //     console.log('Please enter a salary');
              //     return false;
              //   }
              // }
            },
            {
              type: 'list',
              name: 'dept',
              message: "What department is this role in?",
              choices: dept
            }
          ])
            // grab dept from department table
            .then(answers => {
              const dept = answers.dept;

              connection.query(
                'INSERT INTO role SET?',
                {
                  title: answers.title,
                  salary: answers.salary,
                  department_id: answers.dept
                },
              )
              const sql = `SELECT role.id, role.title, department.name AS department
                             FROM role
                             INNER JOIN department ON role.department_id = department.id`;

              connection.query(sql, (err, result) => {
                if (err) throw err;
                console.log('Added' + answers.title + " to roles!");

                console.log('Showing all roles...\n');


                connection.promise().query(`SELECT * FROM role`)
                  .then(([response]) => {
                    console.log(response)
                    showMenu()
                  })
              });
            });
        })
      }
      if (choices === "Add an employee") {
        // addEmployee();
        const roleSql = `SELECT role.id, role.title FROM role`;
        const managerSql = `SELECT * FROM employee`;

        inquirer.prompt([
          {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: addFirst => {
              if (addFirst) {
                return true;
              } else {
                console.log('Please enter a first name');
                return false;
              }
            }
          },
          {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: addLast => {
              if (addLast) {
                return true;
              } else {
                console.log('Please enter a last name');
                return false;
              }
            }
          }
        ])
          .then(answer => {
            const params = [answer.fistName, answer.lastName]

            connection.query(roleSql, (err, data) => {
              if (err) throw err;

              const roles = data.map(({ id, title }) => ({ name: title, value: id }));

              inquirer.prompt([
                {
                  type: 'list',
                  name: 'role',
                  message: "What is the employee's role?",
                  choices: roles
                }
              ])
                .then(roleChoice => {
                  const role = roleChoice.role;
                  params.push(role);

                  connection.query(managerSql, (err, data) => {
                    if (err) throw err;

                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

                    // console.log(managers);

                    inquirer.prompt([
                      {
                        type: 'list',
                        name: 'manager',
                        message: "Who is the employee's manager?",
                        choices: managers
                      }
                    ])
                      .then(managerChoice => {
                        const manager = managerChoice.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;

                        connection.query(sql, (err, result) => {
                          if (err) throw err;
                          console.log("Employee has been added!")

                          // showEmployees();
                          console.log('Showing all employees...\n');
                          const sql = `SELECT employee.id, 
                                employee.first_name, 
                                employee.last_name, 
                                role.title, 
                                department.name AS department,
                                role.salary, 
                                CONCAT (manager.first_name, " ", manager.last_name) AS manager
                                FROM employee
                                LEFT JOIN role ON employee.role_id = role.id
                                LEFT JOIN department ON role.department_id = department.id
                                LEFT JOIN employee manager ON employee.manager_id = manager.id`;
                          connection.promise().query(`SELECT * FROM employee`)
                            .then(([response]) => {
                              console.table(response)
                              showMenu()
                            })

                        });
                      });
                  });
                });
            });
          });
      }

      if (choices === "Update an employee role") {
        // updateEmployee();
        const employeeSql = `SELECT * FROM employee`;

        connection.query(employeeSql, (err, data) => {
          if (err) throw err;

          const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'name',
              message: "Which employee would you like to update?",
              choices: employees
            }
          ])
            .then(empChoice => {
              const employee = empChoice.name;
              const params = [];
              params.push(employee);

              const roleSql = `SELECT * FROM role`;

              connection.query(roleSql, (err, data) => {
                if (err) throw err;

                const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's new role?",
                    choices: roles
                  }
                ])
                  .then(roleChoice => {
                    const role = roleChoice.role;
                    params.push(role);

                    let employee = params[0]
                    params[0] = role
                    params[1] = employee


                    // console.log(params)

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                    connection.query(sql, params, (err, result) => {
                      if (err) throw err;
                      console.log("Employee has been updated!");

                      // showEmployees();
                      console.log('Showing all employees...\n');
                      const sql = `SELECT employee.id, 
                                employee.first_name, 
                                employee.last_name, 
                                role.title, 
                                department.name AS department,
                                role.salary, 
                                CONCAT (manager.first_name, " ", manager.last_name) AS manager
                                FROM employee
                                LEFT JOIN role ON employee.role_id = role.id
                                LEFT JOIN department ON role.department_id = department.id
                                LEFT JOIN employee manager ON employee.manager_id = manager.id`;
                      connection.promise().query(`SELECT * FROM employee`)
                        .then(([response]) => {
                          console.table(response)
                          showMenu()
                        })
                    });
                  });
              });
            });
        });

      }

      if (choices === "No Action") {
        connection.end()
      };
    });
};


// function showMenu() {
//     inquirer.prompt(questions)
//     .then(function(answers){
//         // do this for every table within the database 
//         if(answers.options === "show departments"){
//             // do this for every action you want performed on each table, ie: selecting the whole group, selecting 1, adding 1, droppign 1 
//             db.query('select * from department', function(err, result){
//                 if (err) throw err
//                 console.table(result)
//             }); 
//         }
//         if(answers.options === "show employees"){
//             // do this for every action you want performed on each table, ie: selecting the whole group, selecting 1, adding 1, droppign 1 
//             db.query('select * from department', function(err, result){
//                 if (err) throw err
//                 console.table(result)
//             }); 
//         }
//         if(answers.options === "show roles"){
//             // do this for every action you want performed on each table, ie: selecting the whole group, selecting 1, adding 1, droppign 1 
//             db.query('select * from department', function(err, result){
//                 if (err) throw err
//                 console.table(result)
//             }); 
//         }
//     }) 
// };