const TodoList = artifacts.require("TodoList");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TodoList", function (accounts) {
  it("deploys successful", async function () {
    const todoListInstance = await TodoList.deployed()
    const address = await todoListInstance.address

    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  });

  it("lists tasks", async () => {
    const todoListInstance = await TodoList.deployed()
    const taskCount = await todoListInstance.taskCount()
    const task = await todoListInstance.tasks(taskCount)

    assert.equal(task.id.toNumber(), taskCount.toNumber())
    assert.equal(task.content, "Finish final project")
    assert.equal(task.finished, false)
    assert.equal(taskCount.toNumber(), 1)
  })

  it("creates tasks", async () => {
    const todoListInstance = await TodoList.deployed()
    await todoListInstance.createTask("A new task to test")
    const taskCount = await todoListInstance.taskCount()

    const newTask = await todoListInstance.tasks(2)

    assert.equal(taskCount, 2) // task count
  })

  it("task id is correct", async () => {
    const todoListInstance = await TodoList.deployed()
    const taskCount = await todoListInstance.taskCount()
    const newTask = await todoListInstance.tasks(2)

    assert.equal(newTask[0], 2) // task id
  })

  it("task title is correct", async () => {
    const todoListInstance = await TodoList.deployed()
    const taskCount = await todoListInstance.taskCount()
    const newTask = await todoListInstance.tasks(2)

    assert.equal(newTask[1], "A new task to test") // task title
  })

  it("task finished is correct", async () => {
    const todoListInstance = await TodoList.deployed()
    const taskCount = await todoListInstance.taskCount()
    const newTask = await todoListInstance.tasks(2)

    assert.equal(newTask[2], false) // finished
  })


  it("toggles task finish", async () => {
    const todoListInstance = await TodoList.deployed()
    await todoListInstance.toggleFinished(1)
    const task = await todoListInstance.tasks(1)
    assert.equal(task[2], true)
  })
});
